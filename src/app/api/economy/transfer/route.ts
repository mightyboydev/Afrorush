// src/app/api/economy/transfer/route.ts — Secure P2P cash transfer.
// This is the FIX for item E13: players can't write to each other's docs.
// The server verifies both users and atomically debits/credits.

import { verifyUserToken, transferCashServer, extractToken, json } from "@/lib/economy-server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return json({ error: "Missing auth token" }, 401);
  const senderUid = await verifyUserToken(token);
  if (!senderUid) return json({ error: "Invalid token" }, 401);

  const body = await req.json().catch(() => ({}));
  const { recipientUid, amount, note } = body;
  if (!recipientUid || typeof amount !== "number" || amount <= 0 || amount > 5000000) {
    return json({ error: "Invalid transfer data" }, 400);
  }
  if (senderUid === recipientUid) {
    return json({ error: "Cannot transfer to yourself" }, 400);
  }

  try {
    const result = await transferCashServer(senderUid, recipientUid, amount);

    // Send a DM notification to the recipient (server-side)
    const db = getAdminDb();
    const senderSnap = await db.collection("users").doc(senderUid).get();
    const senderName = senderSnap.data()?.username ?? "Unknown";
    await db.collection("dm_chats").add({
      chatId: [senderUid, recipientUid].sort().join("__"),
      fromUid: senderUid,
      fromName: senderName,
      toUid: recipientUid,
      toName: "",
      text: `You received ${amount.toLocaleString()} naira from @${senderName}${note ? ` - "${note}"` : ""}`,
      createdAt: Date.now(),
      read: false,
    });

    return json({ success: true, senderCash: result.senderCash, amount });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
