// src/app/api/economy/pickpocket/route.ts — Pickpocket + report. Server-side cash moves.

import { verifyUserToken, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const attackerUid = await verifyUserToken(token);
  if (!attackerUid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { action, targetUid } = body;
  if (!action) return json({ error: "Missing action" }, 400);

  const db = getAdminDb();

  try {
    if (action === "pickpocket") {
      if (!targetUid) return json({ error: "Missing targetUid" }, 400);
      if (attackerUid === targetUid) return json({ error: "Cannot pickpocket yourself" }, 400);

      const result = await db.runTransaction(async (tx) => {
        const [attackerSnap, victimSnap] = await Promise.all([
          tx.get(db.collection("users").doc(attackerUid)),
          tx.get(db.collection("users").doc(targetUid)),
        ]);
        if (!attackerSnap.exists || !victimSnap.exists) throw new Error("Player not found");
        const attacker = attackerSnap.data()!;
        const victim = victimSnap.data()!;
        if ((victim.cash ?? 0) <= 0) return { success: false, stolen: 0, message: `${victim.username} no get cash for pocket.` };

        const attackerCred = attacker.vitals?.street_cred ?? 10;
        const victimCred = victim.vitals?.street_cred ?? 10;
        const successRate = Math.max(0.1, Math.min(0.85, 0.5 + (attackerCred - victimCred) / 200));
        const success = Math.random() < successRate;

        if (!success) {
          tx.update(db.collection("users").doc(attackerUid), {
            jailedUntil: Date.now() + 5 * 60 * 1000,
            jailedReason: `Caught trying to pickpocket ${victim.username}`,
          });
          return { success: false, stolen: 0, message: "You been caught! Dem lock you for 5 minutes." };
        }

        const pct = 0.05 + Math.random() * 0.15;
        const stolen = Math.min(victim.cash, Math.round(victim.cash * pct));
        tx.update(db.collection("users").doc(targetUid), { cash: (victim.cash ?? 0) - stolen });
        tx.update(db.collection("users").doc(attackerUid), { cash: (attacker.cash ?? 0) + stolen, lastSeen: Date.now() });
        return { success: true, stolen, message: `Success! You pickpocket ${stolen.toLocaleString()} from @${victim.username}!` };
      });

      // Send DM notification
      if (result.success) {
        const attackerSnap = await db.collection("users").doc(attackerUid).get();
        const attackerName = attackerSnap.data()?.username ?? "Unknown";
        await db.collection("dm_chats").add({
          chatId: [attackerUid, targetUid].sort().join("__"),
          fromUid: attackerUid, fromName: attackerName, toUid: targetUid, toName: "",
          text: `Pickpocket alert! @${attackerName} stole ${result.stolen.toLocaleString()} from you!`,
          createdAt: Date.now(), read: false,
        });
      }

      return json({ success: true, ...result });
    }

    if (action === "report") {
      if (!targetUid) return json({ error: "Missing targetUid" }, 400);
      await db.collection("users").doc(targetUid).update({
        jailedUntil: Date.now() + 10 * 60 * 1000,
        jailedReason: `Reported by another player`,
      });
      return json({ success: true, message: "Reported. Police lock am for 10 minutes." });
    }

    return json({ error: "Unknown action. Use 'pickpocket' or 'report'" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
