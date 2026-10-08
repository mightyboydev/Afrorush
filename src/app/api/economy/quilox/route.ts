// src/app/api/economy/quilox/route.ts — Club cover fee + buy drinks. Server decides prices.

import { verifyUserToken, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { COVER_FEE, DRINK_RULES } from "@/data/economy-rules";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { action, drinkId } = body;
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);

  try {
    if (action === "cover") {
      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists) throw new Error("User not found");
        const data = snap.data()!;
        const cash = data.cash ?? 0;
        if (cash < COVER_FEE) throw new Error("Insufficient funds for cover fee");
        tx.update(userRef, { cash: cash - COVER_FEE, lastSeen: Date.now() });
        return { cash: cash - COVER_FEE };
      });
      return json({ success: true, ...result, action: "cover" });
    }

    if (action === "drink") {
      if (!drinkId || typeof drinkId !== "string") return json({ error: "Missing drinkId" }, 400);
      const rule = DRINK_RULES[drinkId];
      if (!rule) return json({ error: "Unknown drink" }, 400);

      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists) throw new Error("User not found");
        const data = snap.data()!;
        const cash = data.cash ?? 0;
        if (cash < rule.price) throw new Error("Insufficient funds");

        const vitals = data.vitals ?? { stamina: 80, hunger: 20, street_cred: 10 };
        const newCred = Math.min(100, vitals.street_cred + rule.cred);
        const newCash = cash - rule.price;
        tx.update(userRef, {
          cash: newCash,
          vitals: { ...vitals, street_cred: newCred },
          vitalsUpdatedAt: Date.now(),
          lastSeen: Date.now(),
        });
        return { cash: newCash, cred: newCred };
      });
      return json({ success: true, ...result, drinkId, cred: rule.cred });
    }

    return json({ error: "Unknown action. Use 'cover' or 'drink'" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
