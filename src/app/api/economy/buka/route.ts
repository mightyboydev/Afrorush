// src/app/api/economy/buka/route.ts — Buy food from Buka. Server looks up price + applies vitals.

import { verifyUserToken, updateBalances, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FOOD_RULES } from "@/data/economy-rules";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { foodId } = body;
  if (!foodId || typeof foodId !== "string") return json({ error: "Missing foodId" }, 400);

  const rule = FOOD_RULES[foodId];
  if (!rule) return json({ error: "Unknown food item" }, 400);

  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new Error("User not found");
      const data = snap.data()!;
      const cash = data.cash ?? 0;
      if (cash < rule.price) throw new Error("Insufficient funds");

      // Update vitals server-side
      const vitals = data.vitals ?? { stamina: 80, hunger: 20, street_cred: 10 };
      const newStamina = Math.min(100, vitals.stamina + rule.stamina);
      const newHunger = Math.max(0, vitals.hunger - rule.hunger);
      const newCred = Math.min(100, vitals.street_cred + rule.credBoost);
      const newCash = cash - rule.price;

      tx.update(userRef, {
        cash: newCash,
        vitals: { stamina: newStamina, hunger: newHunger, street_cred: newCred },
        vitalsUpdatedAt: Date.now(),
        lastSeen: Date.now(),
      });
      return { cash: newCash, stamina: newStamina, hunger: newHunger, cred: newCred };
    });
    return json({ success: true, ...result, foodId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
