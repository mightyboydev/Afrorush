// src/app/api/economy/buy/route.ts — Secure shop purchase endpoint.

import { verifyUserToken, getUserBalances, updateBalances, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { itemId, price, currency } = body;
  if (!itemId || typeof price !== "number" || price < 0 || price > 1000000) {
    return json({ error: "Invalid item data" }, 400);
  }
  if (currency !== "naira" && currency !== "gold") {
    return json({ error: "Invalid currency" }, 400);
  }

  try {
    const balances = await getUserBalances(uid);
    if (!balances) return json({ error: "User not found" }, 404);

    const balance = currency === "gold" ? balances.gold : balances.cash;
    if (balance < price) return json({ error: "Insufficient funds" }, 400);

    // Deduct payment
    const result = await updateBalances(uid, {
      cashDelta: currency === "naira" ? -price : 0,
      goldDelta: currency === "gold" ? -price : 0,
    });

    // Add to unlocked items (server-side)
    const db = getAdminDb();
    const unlockedRef = db.collection("users").doc(uid).collection("meta").doc("unlocked");
    await unlockedRef.set({ ids: FieldValue.arrayUnion(itemId) }, { merge: true });

    return json({ success: true, cash: result.cash, gold: result.gold, itemId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}

import { FieldValue } from "firebase-admin/firestore";
