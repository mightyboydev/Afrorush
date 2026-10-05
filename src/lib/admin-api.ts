// src/lib/admin-api.ts — Shared server-side helpers for admin API routes.
// All money, rep, ban, and catalog mutations go through here.

import { getAdminDb, getAdminAuth, verifyAdminToken, getUserRole } from "./firebase-admin";
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Hmm — those imports above are from the client SDK. We need admin SDK writes.
// Let's use the admin firestore directly.
import type { FirebaseFirestore } from "firebase-admin/firestore";

export interface AuditEntry {
  actorUid: string;
  actorRole: string;
  action: string;
  targetUid?: string;
  targetCollection?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  timestamp: number;
}

// Verify the request has a valid admin token. Returns the decoded token or null.
export async function requireAdmin(req: Request): Promise<{ uid: string; role: string } | { error: string; status: number }> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: "Missing auth token", status: 401 };
  }
  const token = auth.slice(7);
  const decoded = await verifyAdminToken(token);
  if (!decoded) {
    return { error: "Invalid or expired token", status: 401 };
  }
  const role = await getUserRole(decoded.uid);
  if (!role) {
    return { error: "Not an admin", status: 403 };
  }
  return { uid: decoded.uid, role };
}

// Write an audit log entry — fire and forget, never blocks the main operation.
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const db = getAdminDb();
    await db.collection("adminLogs").add({
      ...entry,
      serverTimestamp: serverTimestamp(),
    });
  } catch {
    /* best-effort — don't fail the main op if logging fails */
  }
}

// Atomically adjust a user's cash and write an audit entry.
export async function adjustCash(
  actorUid: string,
  actorRole: string,
  targetUid: string,
  amount: number,
  reason: string
): Promise<{ newBalance: number }> {
  const db = getAdminDb();
  const ref = db.doc(`users/${targetUid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const current = (snap.data()?.cash as number) ?? 0;
    const newBalance = Math.max(0, current + amount);
    tx.update(ref, { cash: newBalance });
    return { newBalance };
  }).then(async (result) => {
    await writeAudit({
      actorUid,
      actorRole,
      action: amount >= 0 ? "add_cash" : "deduct_cash",
      targetUid,
      before: { cash: result.newBalance - amount },
      after: { cash: result.newBalance },
      reason,
      timestamp: Date.now(),
    });
    return result;
  });
}

// Adjust gold coins.
export async function adjustGold(
  actorUid: string,
  actorRole: string,
  targetUid: string,
  amount: number,
  reason: string
): Promise<{ newBalance: number }> {
  const db = getAdminDb();
  const ref = db.doc(`users/${targetUid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const current = (snap.data()?.gold as number) ?? 0;
    const newBalance = Math.max(0, current + amount);
    tx.update(ref, { gold: newBalance });
    return { newBalance };
  }).then(async (result) => {
    await writeAudit({
      actorUid,
      actorRole,
      action: amount >= 0 ? "add_gold" : "deduct_gold",
      targetUid,
      before: { gold: result.newBalance - amount },
      after: { gold: result.newBalance },
      reason,
      timestamp: Date.now(),
    });
    return result;
  });
}

// Adjust rep.
export async function adjustRep(
  actorUid: string,
  actorRole: string,
  targetUid: string,
  amount: number,
  reason: string
): Promise<{ newBalance: number }> {
  const db = getAdminDb();
  const ref = db.doc(`users/${targetUid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const current = (snap.data()?.rep as number) ?? 0;
    const newBalance = Math.max(0, current + amount);
    tx.update(ref, { rep: newBalance });
    return { newBalance };
  }).then(async (result) => {
    await writeAudit({
      actorUid,
      actorRole,
      action: amount >= 0 ? "add_rep" : "deduct_rep",
      targetUid,
      before: { rep: result.newBalance - amount },
      after: { rep: result.newBalance },
      reason,
      timestamp: Date.now(),
    });
    return result;
  });
}

// Warn a user — shows as blocking popup, increments warning count.
export async function warnUser(
  actorUid: string,
  actorRole: string,
  targetUid: string,
  reason: string
): Promise<{ warnings: number }> {
  const db = getAdminDb();
  const ref = db.doc(`users/${targetUid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const current = (snap.data()?.warnings as number) ?? 0;
    const warnings = current + 1;
    tx.update(ref, { warnings });
    // Also push a warning notification
    const notifRef = db.collection(`users/${targetUid}/notifications`).doc();
    tx.set(notifRef, {
      type: "warning",
      title: "Warning",
      message: reason,
      fromAdmin: true,
      createdAt: Date.now(),
      read: false,
      blocking: true,
    });
    return { warnings };
  }).then(async (result) => {
    await writeAudit({
      actorUid,
      actorRole,
      action: "warn_user",
      targetUid,
      reason,
      timestamp: Date.now(),
    });
    return result;
  });
}

// Mute a user (chat) until a timestamp.
export async function muteUser(
  actorUid: string,
  actorRole: string,
  targetUid: string,
  untilTimestamp: number | null,
  reason: string
): Promise<void> {
  const db = getAdminDb();
  await db.doc(`users/${targetUid}`).update({ mutedUntil: untilTimestamp });
  await writeAudit({
    actorUid,
    actorRole,
    action: "mute_user",
    targetUid,
    after: { mutedUntil: untilTimestamp },
    reason,
    timestamp: Date.now(),
  });
}

// Ban a user — temporary (banExpires) or permanent.
export async function banUser(
  actorUid: string,
  actorRole: string,
  targetUid: string,
  reason: string,
  expires: number | null // null = permanent
): Promise<void> {
  const db = getAdminDb();
  await db.doc(`users/${targetUid}`).update({
    banned: true,
    banReason: reason,
    banExpires: expires,
  });
  // Revoke all sessions
  try {
    await getAdminAuth().revokeRefreshTokens(targetUid);
  } catch { /* best-effort */ }
  await writeAudit({
    actorUid,
    actorRole,
    action: "ban_user",
    targetUid,
    after: { banned: true, banReason: reason, banExpires: expires },
    reason,
    timestamp: Date.now(),
  });
}

// Unban a user.
export async function unbanUser(
  actorUid: string,
  actorRole: string,
  targetUid: string
): Promise<void> {
  const db = getAdminDb();
  await db.doc(`users/${targetUid}`).update({
    banned: false,
    banReason: null,
    banExpires: null,
  });
  await writeAudit({
    actorUid,
    actorRole,
    action: "unban_user",
    targetUid,
    timestamp: Date.now(),
  });
}

// Clear warnings.
export async function clearWarnings(
  actorUid: string,
  actorRole: string,
  targetUid: string
): Promise<void> {
  const db = getAdminDb();
  await db.doc(`users/${targetUid}`).update({ warnings: 0 });
  await writeAudit({
    actorUid,
    actorRole,
    action: "clear_warnings",
    targetUid,
    timestamp: Date.now(),
  });
}
