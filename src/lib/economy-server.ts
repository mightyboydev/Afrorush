// src/lib/economy-server.ts — Server-side economy helpers.
// Verifies user tokens and reads/writes balances using firebase-admin.
// NEVER import in client code.

import { getAdminAuth, getAdminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/** Verify a Firebase ID token. Returns uid or null. */
export async function verifyUserToken(idToken: string): Promise<string | null> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Read a user's cash, gold, rep from Firestore (server-side, bypasses rules). */
export async function getUserBalances(uid: string): Promise<{ cash: number; gold: number; rep: number } | null> {
  const db = getAdminDb();
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    cash: data.cash ?? 0,
    gold: data.gold ?? 0,
    rep: data.rep ?? 0,
  };
}

/** Atomically update a user's cash/gold/rep using a transaction. */
export async function updateBalances(
  uid: string,
  changes: { cashDelta?: number; goldDelta?: number; repDelta?: number; extra?: Record<string, unknown> }
): Promise<{ cash: number; gold: number; rep: number }> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const data = snap.data()!;
    const newCash = Math.max(-5000, (data.cash ?? 0) + (changes.cashDelta ?? 0));
    const newGold = Math.max(0, (data.gold ?? 0) + (changes.goldDelta ?? 0));
    const newRep = Math.max(0, (data.rep ?? 0) + (changes.repDelta ?? 0));
    const patch: Record<string, unknown> = {
      cash: newCash,
      gold: newGold,
      rep: newRep,
    };
    if (changes.extra) Object.assign(patch, changes.extra);
    tx.update(ref, patch);
    return { cash: newCash, gold: newGold, rep: newRep };
  });
  return result;
}

/** Transfer cash from sender to recipient atomically. */
export async function transferCashServer(
  senderUid: string,
  recipientUid: string,
  amount: number
): Promise<{ senderCash: number; recipientCash: number }> {
  if (amount <= 0) throw new Error("Amount must be positive");
  const db = getAdminDb();
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const result = await db.runTransaction(async (tx) => {
    const [senderSnap, recipientSnap] = await Promise.all([tx.get(senderRef), tx.get(recipientRef)]);
    if (!senderSnap.exists) throw new Error("Sender not found");
    if (!recipientSnap.exists) throw new Error("Recipient not found");
    const senderCash = senderSnap.data()!.cash ?? 0;
    const recipientCash = recipientSnap.data()!.cash ?? 0;
    if (senderCash < amount) throw new Error("Insufficient funds");
    tx.update(senderRef, { cash: senderCash - amount });
    tx.update(recipientRef, { cash: recipientCash + amount });
    return { senderCash: senderCash - amount, recipientCash: recipientCash + amount };
  });
  return result;
}

/** Extract Bearer token from request headers. */
export function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

/** Standard JSON response helper. */
export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
