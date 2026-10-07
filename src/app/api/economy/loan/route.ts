// src/app/api/economy/loan/route.ts — Secure loan take/repay endpoint.

import { verifyUserToken, getUserBalances, updateBalances, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { action, amount } = body;

  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);

  try {
    if (action === "take") {
      if (typeof amount !== "number" || amount <= 0 || amount > 50000) {
        return json({ error: "Invalid loan amount (1 - 50,000)" }, 400);
      }
      const userSnap = await userRef.get();
      const existing = userSnap.data()?.activeLoan;
      if (existing) return json({ error: "You already have an active loan" }, 400);

      const loan = {
        principal: amount,
        interestRate: 0.05,
        totalOwed: amount,
        takenAt: Date.now(),
      };
      const result = await updateBalances(uid, {
        cashDelta: amount,
        extra: { activeLoan: loan },
      });
      return json({ success: true, cash: result.cash, loan });
    }

    if (action === "repay") {
      if (typeof amount !== "number" || amount <= 0) {
        return json({ error: "Invalid repayment amount" }, 400);
      }
      const userSnap = await userRef.get();
      const loan = userSnap.data()?.activeLoan;
      if (!loan) return json({ error: "No active loan" }, 400);

      const balances = await getUserBalances(uid);
      if (!balances) return json({ error: "User not found" }, 404);
      if (balances.cash < amount) return json({ error: "Insufficient funds" }, 400);

      const repayAmount = Math.min(amount, loan.totalOwed);
      const newOwed = loan.totalOwed - repayAmount;
      const result = await updateBalances(uid, {
        cashDelta: -repayAmount,
        extra: { activeLoan: newOwed === 0 ? null : { ...loan, totalOwed: newOwed } },
      });
      return json({ success: true, cash: result.cash, loanPaid: repayAmount, remaining: newOwed });
    }

    return json({ error: "Unknown action. Use 'take' or 'repay'" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
