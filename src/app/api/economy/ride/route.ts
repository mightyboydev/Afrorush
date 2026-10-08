// src/app/api/economy/ride/route.ts — Pay ride fare + agbero encounter. Server decides fare.

import { verifyUserToken, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { RIDE_RULES } from "@/data/economy-rules";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { rideId } = body;
  if (!rideId || typeof rideId !== "string") return json({ error: "Missing rideId" }, 400);

  const rule = RIDE_RULES[rideId];
  if (!rule) return json({ error: "Unknown ride" }, 400);

  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new Error("User not found");
      const data = snap.data()!;
      const cash = data.cash ?? 0;

      // Agbero encounter (server-side roll)
      let finalFare = rule.fare;
      let agberoHit = false;
      let extortAmount = 0;
      if (rule.risk > 0 && Math.random() < rule.risk) {
        extortAmount = Math.min(cash - rule.fare, 200 + Math.floor(Math.random() * 300));
        if (extortAmount < 0) extortAmount = 0;
        finalFare += extortAmount;
        agberoHit = true;
      }

      if (cash < finalFare) throw new Error("Insufficient funds for this ride");

      // Apply fare + stamina drain
      const vitals = data.vitals ?? { stamina: 80, hunger: 20, street_cred: 10 };
      const newStamina = Math.max(0, vitals.stamina - rule.staminaCost);
      const newCash = cash - finalFare;
      tx.update(userRef, {
        cash: newCash,
        vitals: { ...vitals, stamina: newStamina },
        vitalsUpdatedAt: Date.now(),
        lastSeen: Date.now(),
      });
      return { cash: newCash, finalFare, agberoHit, extortAmount };
    });
    return json({ success: true, ...result, rideId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
