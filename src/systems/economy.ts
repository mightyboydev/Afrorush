// src/systems/economy.ts — Economy logic (jobs, loans, transfers, bills).
// Re-exports firestore helpers for leaner imports. No logic changes.

export {
  takeMicroLoan,
  repayMicroLoan,
  transferCash,
  findPlayerByUsername,
  applyRaceResult,
  purchaseItem,
} from "@/lib/firestore";

// Server-side API callers (for E13: wire client to secure routes)
export async function callJobApi(jobId: string, pay: number, idToken: string) {
  const res = await fetch("/api/economy/job", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ jobId, pay }),
  });
  return res.json();
}

export async function callRaceApi(cashEarned: number, repEarned: number, idToken: string) {
  const res = await fetch("/api/economy/race", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ cashEarned, repEarned }),
  });
  return res.json();
}

export async function callBuyApi(itemId: string, price: number, currency: string, idToken: string) {
  const res = await fetch("/api/economy/buy", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ itemId, price, currency }),
  });
  return res.json();
}

export async function callTransferApi(recipientUid: string, amount: number, note: string, idToken: string) {
  const res = await fetch("/api/economy/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ recipientUid, amount, note }),
  });
  return res.json();
}

export async function callLoanApi(action: "take" | "repay", amount: number, idToken: string) {
  const res = await fetch("/api/economy/loan", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ action, amount }),
  });
  return res.json();
}
