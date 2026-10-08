// src/app/api/economy/daily/route.ts — Daily suya reward. Once per day (server checks date).

import { verifyUserToken, updateBalances, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { SUYA_DAILY_REWARD_CASH, SUYA_DAILY_REWARD_REP } from "@/data/economy-rules";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const uid = await verifyUserToken(token);
  if (!uid) return json({ error: "Invalid token" }, 401);

  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);

  // Check date — once per calendar day
  const todayStr = new Date().toISOString().slice(0, 10);
  const userSnap = await userRef.get();
  const lastSuyaDate = userSnap.data()?.lastSuyaDate;

  if (lastSuyaDate === todayStr) {
    return json({ error: "Already claimed today. Come back tomorrow!" }, 429);
  }

  try {
    const result = await updateBalances(uid, {
      cashDelta: SUYA_DAILY_REWARD_CASH,
      repDelta: SUYA_DAILY_REWARD_REP,
      extra: { lastSuyaDate: todayStr, lastSeen: Date.now() },
    });
    return json({ success: true, cash: result.cash, rep: result.rep, cashEarned: SUYA_DAILY_REWARD_CASH, repEarned: SUYA_DAILY_REWARD_REP });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
