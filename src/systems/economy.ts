// src/systems/economy.ts — Client-side API callers for ALL economy actions.
// Every money write goes through the server. No direct Firestore writes for cash/gold/rep.

import { getAuth } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

// Get the current user's ID token for API auth
async function getIdToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  return user.getIdToken();
}

// ---------- JOB ----------
export async function callJobApi(jobId: string): Promise<{ success: boolean; cash?: number; pay?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/job", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ jobId }),
  });
  return res.json();
}

// ---------- RACE ----------
export async function callRaceApi(distance: number, score: number, place: number, mode: string): Promise<{ success: boolean; cash?: number; rep?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/race", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ distance, score, place, mode }),
  });
  return res.json();
}

// ---------- BUY ----------
export async function callBuyApi(itemId: string): Promise<{ success: boolean; cash?: number; gold?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/buy", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId }),
  });
  return res.json();
}

// ---------- TRANSFER ----------
export async function callTransferApi(recipientUid: string, amount: number, note: string): Promise<{ success: boolean; senderCash?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ recipientUid, amount, note }),
  });
  return res.json();
}

// ---------- LOAN ----------
export async function callLoanApi(action: "take" | "repay", amount: number): Promise<{ success: boolean; cash?: number; loan?: unknown; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/loan", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, amount }),
  });
  return res.json();
}

// ---------- BUKA (food) ----------
export async function callBukaApi(foodId: string): Promise<{ success: boolean; cash?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/buka", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ foodId }),
  });
  return res.json();
}

// ---------- QUILOX (club) ----------
export async function callQuiloxApi(action: "cover" | "drink", drinkId?: string): Promise<{ success: boolean; cash?: number; cred?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/quilox", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, drinkId }),
  });
  return res.json();
}

// ---------- RIDE ----------
export async function callRideApi(rideId: string): Promise<{ success: boolean; cash?: number; agberoHit?: boolean; extortAmount?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/ride", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rideId }),
  });
  return res.json();
}

// ---------- DAILY (suya reward) ----------
export async function callDailyApi(): Promise<{ success: boolean; cash?: number; rep?: number; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/daily", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ---------- PICKPOCKET / REPORT ----------
export async function callPickpocketApi(targetUid: string): Promise<{ success: boolean; stolen?: number; message?: string; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/pickpocket", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: "pickpocket", targetUid }),
  });
  return res.json();
}

export async function callReportApi(targetUid: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = await getIdToken();
  const res = await fetch("/api/economy/pickpocket", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: "report", targetUid }),
  });
  return res.json();
}

// ---------- Transfer helper: find player by username (read-only, still client) ----------
export { findPlayerByUsername, searchPlayersByUsername } from "@/lib/firestore";
