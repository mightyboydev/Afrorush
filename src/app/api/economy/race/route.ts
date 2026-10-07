// src/app/api/economy/race/route.ts — Secure race reward endpoint.

import { verifyUserToken, updateBalances, extractToken, json } from "@/lib/economy-server";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { cashEarned, repEarned, distance } = body;
  if (typeof cashEarned !== "number" || cashEarned < 0 || cashEarned > 5000) {
    return json({ error: "Invalid cash amount" }, 400);
  }
  if (typeof repEarned !== "number" || repEarned < 0 || repEarned > 200) {
    return json({ error: "Invalid rep amount" }, 400);
  }

  try {
    const result = await updateBalances(uid, {
      cashDelta: cashEarned,
      repDelta: repEarned,
      extra: { lastSeen: Date.now() },
    });
    return json({ success: true, cash: result.cash, rep: result.rep });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
