"use client";

// src/lib/admin-client.ts — Client-side admin operations.
// Works WITHOUT env vars or Firebase Admin SDK. Uses Firestore rules
// that grant admin users write access to any user document.
// All admin actions also write an audit log entry.

import {
  doc, getDoc, updateDoc, increment, collection, addDoc,
  runTransaction, getDocs, query, orderBy, limit,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { getFirebaseAuth } from "./firebase";

// Check if the current user is an admin (via the admins collection).
export async function checkAdminRole(uid: string): Promise<"owner" | "admin" | "moderator" | null> {
  const db = getFirebaseDb();
  // First check: is this the hard-coded owner?
  if (uid === "1rf7yswl35QuUyfdQehMs1qdlIy2") return "owner";
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    if (!snap.exists()) return null;
    const role = snap.data()?.role as string;
    if (role === "owner" || role === "admin" || role === "moderator") return role;
    return null;
  } catch {
    return null;
  }
}

// Write an audit log entry.
export async function writeAudit(entry: {
  actorUid: string;
  actorRole: string;
  action: string;
  targetUid?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
}): Promise<void> {
  const db = getFirebaseDb();
  try {
    await addDoc(collection(db, "adminLogs"), {
      ...entry,
      timestamp: Date.now(),
    });
  } catch {
    /* best-effort */
  }
}

// Atomically adjust a user's cash. Uses Firestore transaction.
export async function adjustCash(
  actorUid: string, actorRole: string,
  targetUid: string, amount: number, reason: string
): Promise<{ newBalance: number }> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", targetUid);
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const data = snap.data() as Record<string, number>;
    const current = data.cash ?? 0;
    const newBalance = Math.max(0, current + amount);
    tx.update(ref, { cash: newBalance });
    return { newBalance };
  });
  await writeAudit({
    actorUid, actorRole,
    action: amount >= 0 ? "add_cash" : "deduct_cash",
    targetUid,
    before: { cash: result.newBalance - amount },
    after: { cash: result.newBalance },
    reason,
  });
  return result;
}

// Adjust gold coins.
export async function adjustGold(
  actorUid: string, actorRole: string,
  targetUid: string, amount: number, reason: string
): Promise<{ newBalance: number }> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", targetUid);
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const data = snap.data() as Record<string, number>;
    const current = data.gold ?? 0;
    const newBalance = Math.max(0, current + amount);
    tx.update(ref, { gold: newBalance });
    return { newBalance };
  });
  await writeAudit({
    actorUid, actorRole,
    action: amount >= 0 ? "add_gold" : "deduct_gold",
    targetUid,
    before: { gold: result.newBalance - amount },
    after: { gold: result.newBalance },
    reason,
  });
  return result;
}

// Adjust rep.
export async function adjustRep(
  actorUid: string, actorRole: string,
  targetUid: string, amount: number, reason: string
): Promise<{ newBalance: number }> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", targetUid);
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const data = snap.data() as Record<string, number>;
    const current = data.rep ?? 0;
    const newBalance = Math.max(0, current + amount);
    tx.update(ref, { rep: newBalance });
    return { newBalance };
  });
  await writeAudit({
    actorUid, actorRole,
    action: amount >= 0 ? "add_rep" : "deduct_rep",
    targetUid,
    before: { rep: result.newBalance - amount },
    after: { rep: result.newBalance },
    reason,
  });
  return result;
}

// Warn a user — increments warning count + creates a blocking notification.
export async function warnUser(
  actorUid: string, actorRole: string,
  targetUid: string, reason: string
): Promise<{ warnings: number }> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", targetUid);
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("User not found");
    const data = snap.data() as Record<string, number>;
    const warnings = (data.warnings ?? 0) + 1;
    tx.update(ref, { warnings });
    return { warnings };
  });
  // Create a blocking warning notification
  try {
    await addDoc(collection(db, "users", targetUid, "notifications"), {
      type: "warning",
      title: "Warning",
      message: reason,
      fromAdmin: true,
      createdAt: Date.now(),
      read: false,
      blocking: true,
    });
  } catch { /* best-effort */ }
  await writeAudit({
    actorUid, actorRole,
    action: "warn_user",
    targetUid,
    reason,
  });
  return result;
}

// Mute a user.
export async function muteUser(
  actorUid: string, actorRole: string,
  targetUid: string, untilTimestamp: number | null, reason: string
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", targetUid), { mutedUntil: untilTimestamp });
  await writeAudit({
    actorUid, actorRole,
    action: "mute_user",
    targetUid,
    after: { mutedUntil: untilTimestamp },
    reason,
  });
}

// Ban a user.
export async function banUser(
  actorUid: string, actorRole: string,
  targetUid: string, reason: string, expires: number | null
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", targetUid), {
    banned: true,
    banReason: reason,
    banExpires: expires,
  });
  await writeAudit({
    actorUid, actorRole,
    action: "ban_user",
    targetUid,
    after: { banned: true, banReason: reason, banExpires: expires },
    reason,
  });
}

// Unban a user.
export async function unbanUser(
  actorUid: string, actorRole: string,
  targetUid: string
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", targetUid), {
    banned: false,
    banReason: null,
    banExpires: null,
  });
  await writeAudit({
    actorUid, actorRole,
    action: "unban_user",
    targetUid,
  });
}

// Clear warnings.
export async function clearWarnings(
  actorUid: string, actorRole: string,
  targetUid: string
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", targetUid), { warnings: 0 });
  await writeAudit({
    actorUid, actorRole,
    action: "clear_warnings",
    targetUid,
  });
}

// Fetch all users (for admin dashboard). Limited to 100.
export async function fetchAllUsers(searchQuery?: string): Promise<Array<Record<string, unknown> & { uid: string }>> {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, "users"));
  let users = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Record<string, unknown>) }));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    users = users.filter((u) => {
      const username = String(u.username ?? "").toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      return username.includes(q) || email.includes(q) || u.uid.includes(q);
    });
  }
  users.sort((a, b) => ((b.rep as number) ?? 0) - ((a.rep as number) ?? 0));
  return users.slice(0, 50);
}

// Fetch overview stats.
export async function fetchOverviewStats() {
  const db = getFirebaseDb();
  const [usersSnap, presenceSnap, logsSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "presence")),
    getDocs(query(collection(db, "adminLogs"), orderBy("timestamp", "desc"), limit(10))),
  ]);

  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  let totalCash = 0;
  let totalGold = 0;
  let activeToday = 0;
  const topRiders: Array<{ uid: string; username: string; rep: number; cash: number }> = [];

  usersSnap.forEach((d) => {
    const u = d.data() as Record<string, number | string>;
    totalCash += (u.cash as number) ?? 0;
    totalGold += (u.gold as number) ?? 0;
    if ((u.lastSeen as number) ?? 0 > dayAgo) activeToday++;
    topRiders.push({
      uid: d.id,
      username: String(u.username ?? "Unknown"),
      rep: (u.rep as number) ?? 0,
      cash: (u.cash as number) ?? 0,
    });
  });
  topRiders.sort((a, b) => b.rep - a.rep);
  const recentLogs = logsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

  return {
    totalUsers: usersSnap.size,
    activeToday,
    onlineNow: presenceSnap.size,
    totalCashInCirculation: totalCash,
    totalGoldInCirculation: totalGold,
    topRiders: topRiders.slice(0, 5),
    recentLogs,
  };
}

// Get the current user's ID token (for API calls that still use route handlers).
export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}
