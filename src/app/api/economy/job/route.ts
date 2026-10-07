// src/app/api/economy/job/route.ts — Secure job reward endpoint.
// Verifies user token, validates job, writes cash server-side.

import { verifyUserToken, updateBalances, extractToken, json } from "@/lib/economy-server";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { jobId, pay } = body;
  if (!jobId || typeof pay !== "number" || pay <= 0 || pay > 10000) {
    return json({ error: "Invalid job data" }, 400);
  }

  try {
    const result = await updateBalances(uid, { cashDelta: pay, extra: { lastSeen: Date.now() } });
    return json({ success: true, cash: result.cash, pay });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
