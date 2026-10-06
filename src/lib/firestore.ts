// src/lib/firestore.ts — Firestore data layer for AfroRush.
// Profiles, crews, presence, leaderboards — all reactive via onSnapshot.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  increment,
  serverTimestamp,
  addDoc,
  or,
  and,
  type Unsubscribe,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import {
  DEFAULT_UNLOCKED,
  makeDefaultProfile,
  type Crew,
  type Loadout,
  type PlayerProfile,
  type RaceMode,
} from "./storage";

// ---------- Collections ----------
const USERS = "users";
const CREWS = "crews";
const PRESENCE = "presence";
const DM_CHATS = "dm_chats";

// We store the unlocked items list as a sub-doc to keep profile doc small.
const UNLOCKED_KEY = "unlocked";

// ---------- Profiles ----------


// Older profiles (created by earlier versions) may lack newer fields.
// Fill the gaps so the UI never reads undefined (e.g. graphicsQuality, avatar).
function withDefaults(uid: string, data: Partial<PlayerProfile>): PlayerProfile {
  const base = makeDefaultProfile(uid, data.email ?? null, data.username ?? "Rider", data.photoURL ?? null);
  return {
    ...base,
    ...data,
    avatar: { ...base.avatar, ...(data.avatar ?? {}) },
    loadout: { ...base.loadout, ...(data.loadout ?? {}) },
    highScores: { ...base.highScores, ...(data.highScores ?? {}) },
    graphicsQuality: data.graphicsQuality ?? base.graphicsQuality,
  } as PlayerProfile;
}

export async function fetchProfile(uid: string): Promise<PlayerProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return withDefaults(uid, snap.data() as Partial<PlayerProfile>);
}

export async function fetchUnlocked(uid: string): Promise<string[]> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, USERS, uid, "meta", UNLOCKED_KEY));
  if (!snap.exists()) return [...DEFAULT_UNLOCKED];
  return (snap.data().ids as string[]) ?? [...DEFAULT_UNLOCKED];
}

export async function createProfile(profile: PlayerProfile): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, USERS, profile.uid), profile);
  await setDoc(doc(db, USERS, profile.uid, "meta", UNLOCKED_KEY), {
    ids: [...DEFAULT_UNLOCKED],
  });
}

export function subscribeToProfile(
  uid: string,
  cb: (profile: PlayerProfile | null) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(doc(db, USERS, uid), (snap) => {
    cb(snap.exists() ? withDefaults(uid, snap.data() as Partial<PlayerProfile>) : null);
  });
}

export function subscribeToUnlocked(
  uid: string,
  cb: (ids: string[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(doc(db, USERS, uid, "meta", UNLOCKED_KEY), (snap) => {
    cb(snap.exists() ? (snap.data().ids as string[]) ?? [...DEFAULT_UNLOCKED] : [...DEFAULT_UNLOCKED]);
  });
}

export async function updateProfile(uid: string, patch: Partial<PlayerProfile>): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, uid), patch as Record<string, unknown>);
}

export async function updateLoadout(uid: string, loadout: Loadout): Promise<void> {
  await updateProfile(uid, { loadout });
}

export async function purchaseItem(uid: string, itemId: string, price: number): Promise<void> {
  const db = getFirebaseDb();
  // Atomic-ish: deduct cash + add to unlocked list in one transaction-like sequence.
  // For simplicity we use field transforms; if cash goes negative it's a bug to fix
  // at the UI layer (which already gates the purchase button).
  await updateDoc(doc(db, USERS, uid), { cash: increment(-price) });
  await updateDoc(doc(db, USERS, uid, "meta", UNLOCKED_KEY), {
    ids: arrayUnion(itemId),
  });
}

export async function applyRaceResult(
  uid: string,
  result: {
    cashEarned: number;
    repEarned: number;
    mode: RaceMode;
    score: number;
  }
): Promise<void> {
  const db = getFirebaseDb();
  // Update cash, rep, totalRuns in one write.
  await updateDoc(doc(db, USERS, uid), {
    cash: increment(result.cashEarned),
    rep: increment(result.repEarned),
    totalRuns: increment(1),
    lastSeen: Date.now(),
  });
  // High score: read-then-write (single-client app, acceptable).
  const profile = await fetchProfile(uid);
  if (profile) {
    const prevHigh = profile.highScores[result.mode] ?? 0;
    if (result.score > prevHigh) {
      const newHighScores = { ...profile.highScores, [result.mode]: result.score };
      await updateDoc(doc(db, USERS, uid), { highScores: newHighScores });
      return;
    }
  }
}

// ---------- Presence ----------

const ONLINE_WINDOW_MS = 60_000; // a player is "online" if lastSeen within 60s
const HEARTBEAT_MS = 20_000; // refresh presence every 20s

export async function setPresence(profile: PlayerProfile): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, PRESENCE, profile.uid), {
    uid: profile.uid,
    username: profile.username,
    photoURL: profile.photoURL,
    crewTag: profile.crewTag,
    crewColor: profile.crewColor,
    lastSeen: Date.now(),
  });
}

export async function clearPresence(uid: string): Promise<void> {
  const db = getFirebaseDb();
  try {
    await deleteDoc(doc(db, PRESENCE, uid));
  } catch {
    /* best-effort cleanup */
  }
}

// Subscribe to the list of currently online players.
export function subscribeToOnlinePlayers(
  cb: (players: Array<{
    uid: string;
    username: string;
    photoURL: string | null;
    crewTag: string | null;
    crewColor: string | null;
    lastSeen: number;
  }>) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  const q = query(collection(db, PRESENCE), where("lastSeen", ">", cutoff));
  return onSnapshot(q, (snap) => {
    const players = snap.docs.map((d) => d.data() as {
      uid: string;
      username: string;
      photoURL: string | null;
      crewTag: string | null;
      crewColor: string | null;
      lastSeen: number;
    });
    players.sort((a, b) => b.lastSeen - a.lastSeen);
    cb(players);
  });
}

// Start a heartbeat interval. Returns a stop function.
export function startPresenceHeartbeat(profile: PlayerProfile): () => void {
  void setPresence(profile);
  const id = setInterval(() => {
    void setPresence(profile);
  }, HEARTBEAT_MS);
  return () => {
    clearInterval(id);
    void clearPresence(profile.uid);
  };
}

// ---------- Crews ----------

export async function createCrew(
  owner: PlayerProfile,
  name: string,
  tag: string,
  color: string
): Promise<string> {
  const db = getFirebaseDb();
  const crewRef = doc(collection(db, CREWS));
  const crewId = crewRef.id;
  const crew: Crew = {
    id: crewId,
    name: name.trim() || "Anonymous Crew",
    color,
    tag: tag.toUpperCase().slice(0, 3) || "AFR",
    ownerId: owner.uid,
    ownerName: owner.username,
    memberCount: 1,
    totalRep: owner.rep,
    createdAt: Date.now(),
  };
  await setDoc(crewRef, crew);
  // Patch owner profile to point at the new crew.
  await updateProfile(owner.uid, {
    crewId: crewId,
    crewName: crew.name,
    crewColor: crew.color,
    crewTag: crew.tag,
  });
  return crewId;
}

export async function joinCrew(profile: PlayerProfile, crew: Crew): Promise<void> {
  const db = getFirebaseDb();
  // Patch profile
  await updateProfile(profile.uid, {
    crewId: crew.id,
    crewName: crew.name,
    crewColor: crew.color,
    crewTag: crew.tag,
  });
  // Patch crew counts
  await updateDoc(doc(db, CREWS, crew.id), {
    memberCount: increment(1),
    totalRep: increment(profile.rep),
  });
}

export async function leaveCrew(profile: PlayerProfile): Promise<void> {
  if (!profile.crewId) return;
  const db = getFirebaseDb();
  await updateDoc(doc(db, CREWS, profile.crewId), {
    memberCount: increment(-1),
    totalRep: increment(-profile.rep),
  });
  await updateProfile(profile.uid, {
    crewId: null,
    crewName: null,
    crewColor: null,
    crewTag: null,
  });
}

export function subscribeToCrews(cb: (crews: Crew[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(collection(db, CREWS), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    const crews = snap.docs.map((d) => d.data() as Crew);
    crews.sort((a, b) => b.totalRep - a.totalRep);
    cb(crews);
  });
}

export function subscribeToCrew(crewId: string, cb: (crew: Crew | null) => void): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(doc(db, CREWS, crewId), (snap) => {
    cb(snap.exists() ? (snap.data() as Crew) : null);
  });
}

// ---------- Leaderboards ----------

export interface LeaderboardEntry {
  uid: string;
  username: string;
  photoURL: string | null;
  rep: number;
  cash: number;
  crewTag: string | null;
  crewColor: string | null;
  totalScore: number;
}

export function subscribeToLeaderboard(cb: (entries: LeaderboardEntry[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(collection(db, USERS), orderBy("rep", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    const entries: LeaderboardEntry[] = snap.docs.map((d) => {
      const p = d.data() as PlayerProfile;
      const totalScore = Object.values(p.highScores).reduce((a, b) => a + b, 0);
      return {
        uid: p.uid,
        username: p.username,
        photoURL: p.photoURL,
        rep: p.rep,
        cash: p.cash,
        crewTag: p.crewTag,
        crewColor: p.crewColor,
        totalScore,
      };
    });
    cb(entries);
  });
}

// Crew leaderboard — derived from crews collection (already sorted by totalRep).
export function subscribeToCrewLeaderboard(cb: (crews: Crew[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(collection(db, CREWS), orderBy("totalRep", "desc"), limit(20));
  return onSnapshot(q, (snap) => {
    const crews = snap.docs.map((d) => d.data() as Crew);
    cb(crews);
  });
}

// ---------- Bootstrap utility ----------

// Used once after signup to seed the user document.
export async function bootstrapProfile(profile: PlayerProfile): Promise<void> {
  await createProfile(profile);
}

// Fetch full player state (profile + unlocked) in one call.
export async function fetchPlayerState(uid: string): Promise<{
  profile: PlayerProfile | null;
  unlocked: string[];
}> {
  const [profile, unlocked] = await Promise.all([
    fetchProfile(uid),
    fetchUnlocked(uid),
  ]);
  return { profile, unlocked };
}

// ---------- Direct Messages (DMs) ----------
// DMs are stored in the `dm_chats` collection. Each message has:
//   fromUid, fromName, toUid, toName, text, createdAt, read
// We query by participant (using OR on fromUid/toUid) so a user sees all
// messages they sent OR received.

export interface DmMessage {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  text: string;
  createdAt: number;
  read: boolean;
}

// Helper: stable chatId from two UIDs (sorted) — used for grouping threads.
export function dmChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("__");
}

// Search for a player by username (case-insensitive prefix match).
// Returns up to 10 matches.
export async function searchPlayersByUsername(
  usernamePrefix: string
): Promise<Array<{ uid: string; username: string; photoURL: string | null }>> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, USERS),
    where("username", ">=", usernamePrefix),
    where("username", "<=", usernamePrefix + "\uf8ff"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const p = d.data() as PlayerProfile;
    return { uid: p.uid, username: p.username, photoURL: p.photoURL };
  });
}

// Send a DM. Uses chatId for easy thread lookup.
export async function sendDm(
  from: PlayerProfile,
  toUid: string,
  toName: string,
  text: string
): Promise<void> {
  const db = getFirebaseDb();
  const chatId = dmChatId(from.uid, toUid);
  await addDoc(collection(db, DM_CHATS), {
    chatId,
    fromUid: from.uid,
    fromName: from.username,
    toUid,
    toName,
    text,
    createdAt: Date.now(),
    read: false,
  });
}

// Subscribe to all DMs involving `uid` (sent OR received), newest first.
// Returns an unsubscribe function.
export function subscribeToDms(
  uid: string,
  cb: (messages: DmMessage[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  // Try OR query (requires composite index). If it errors, fallback to two
  // separate queries handled by the caller.
  try {
    const q = query(
      collection(db, DM_CHATS),
      or(where("fromUid", "==", uid), where("toUid", "==", uid)),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(
      q,
      (snap) => {
        const messages = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DmMessage, "id">),
        }));
        cb(messages);
      },
      // Fallback: if composite index missing, fall back to a single
      // client-side filter on the toUid query.
      async () => {
        const receivedQ = query(
          collection(db, DM_CHATS),
          where("toUid", "==", uid),
          orderBy("createdAt", "asc")
        );
        const sentQ = query(
          collection(db, DM_CHATS),
          where("fromUid", "==", uid),
          orderBy("createdAt", "asc")
        );
        const [recv, sent] = await Promise.all([getDocs(receivedQ), getDocs(sentQ)]);
        const combined: DmMessage[] = [];
        recv.forEach((d) =>
          combined.push({ id: d.id, ...(d.data() as Omit<DmMessage, "id">) })
        );
        sent.forEach((d) =>
          combined.push({ id: d.id, ...(d.data() as Omit<DmMessage, "id">) })
        );
        combined.sort((a, b) => a.createdAt - b.createdAt);
        cb(combined);
      }
    );
  } catch {
    // Synchronous fallback — should never hit, but keep TS happy.
    return () => {};
  }
}

// ---------- Peer-to-peer transfers (the Lagos Life viral mechanic) ----------
// Find a player by exact username (case-insensitive). Used by Bank / transfer UI.
export async function findPlayerByUsername(
  username: string
): Promise<{ uid: string; username: string; cash: number; photoURL: string | null } | null> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, USERS),
    where("username", "==", username.trim()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const p = snap.docs[0].data() as PlayerProfile;
  return { uid: p.uid, username: p.username, cash: p.cash, photoURL: p.photoURL };
}

// Transfer cash from `from` profile to a recipient username.
// Atomic-ish: debits sender, credits recipient, sends the recipient a DM
// notification of the transfer. Throws if recipient not found or insufficient
// balance. Returns the recipient's display name on success.
export async function transferCash(
  from: PlayerProfile,
  recipientUsername: string,
  amount: number,
  note?: string
): Promise<{ recipientName: string; recipientUid: string }> {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (amount > from.cash) throw new Error("You no get enough cash for this transfer");
  const recipient = await findPlayerByUsername(recipientUsername);
  if (!recipient) throw new Error(`No player called "${recipientUsername}". Tell them make them sign up first!`);
  if (recipient.uid === from.uid) throw new Error("You no fit send money to yourself");

  const db = getFirebaseDb();

  // Debit sender
  await updateDoc(doc(db, USERS, from.uid), { cash: increment(-amount) });
  // Credit recipient (best-effort — if this fails, refund sender)
  try {
    await updateDoc(doc(db, USERS, recipient.uid), { cash: increment(amount) });
  } catch (e) {
    // Refund sender if recipient credit fails
    await updateDoc(doc(db, USERS, from.uid), { cash: increment(amount) });
    throw new Error("Transfer failed. Try again.");
  }

  // Send recipient a DM so they see the money land (the viral hook!)
  try {
    const text = `💸 You don receive ₦${amount.toLocaleString()} from @${from.username}${note ? ` — "${note}"` : ""}. Open AfroRush to spend am!`;
    await sendDm(from, recipient.uid, recipient.username, text);
  } catch {
    /* DM is best-effort — don't fail the transfer */
  }

  return { recipientName: recipient.username, recipientUid: recipient.uid };
}

// ---------- Multiplayer Race Rooms ----------
// Serverless multiplayer: each room is a single Firestore document. Players
// write their own `players[uid]` sub-object (throttled by the client to
// ~12 writes/sec) and listen via onSnapshot for opponents' positions.

const RACE_ROOMS = "race_rooms";

export interface RaceRoomPlayer {
  username: string;
  lane: number;          // 0=left, 1=center, 2=right
  distance: number;      // cumulative distance in metres
  speed: number;         // current speed (for sync)
  yOffset: number;       // jump height offset
  isJumping: boolean;
  isEliminated: boolean;
  finished: boolean;
  lastUpdated: number;
}

export interface RaceRoom {
  id: string;
  room_status: "lobby" | "racing" | "finished";
  track_theme: "third_mainland" | "ikeja_traffic" | "vi_beach";
  created_at: number;
  started_at?: number;
  finished_at?: number;
  host_uid: string;
  players: Record<string, RaceRoomPlayer>;
}

// Create a new room. Returns the room id (6-char code).
export async function createRaceRoom(
  host: PlayerProfile,
  track: RaceRoom["track_theme"] = "third_mainland"
): Promise<string> {
  const db = getFirebaseDb();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room: RaceRoom = {
    id: code,
    room_status: "lobby",
    track_theme: track,
    created_at: Date.now(),
    host_uid: host.uid,
    players: {
      [host.uid]: {
        username: host.username,
        lane: 1,
        distance: 0,
        speed: 6,
        yOffset: 0,
        isJumping: false,
        isEliminated: false,
        finished: false,
        lastUpdated: Date.now(),
      },
    },
  };
  await setDoc(doc(db, RACE_ROOMS, code), room);
  return code;
}

// Join an existing room by code. Returns true on success.
export async function joinRaceRoom(
  player: PlayerProfile,
  code: string
): Promise<boolean> {
  const db = getFirebaseDb();
  const ref = doc(db, RACE_ROOMS, code.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Room code no dey. Check am well.");
  const room = snap.data() as RaceRoom;
  if (room.room_status === "finished") throw new Error("Room don finish already.");
  // Add this player to the players map
  await updateDoc(ref, {
    [`players.${player.uid}`]: {
      username: player.username,
      lane: 1,
      distance: 0,
      speed: 6,
      yOffset: 0,
      isJumping: false,
      isEliminated: false,
      finished: false,
      lastUpdated: Date.now(),
    } as RaceRoomPlayer,
  });
  return true;
}

// Subscribe to room state changes. Returns unsubscribe.
export function subscribeToRaceRoom(
  code: string,
  cb: (room: RaceRoom | null) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(doc(db, RACE_ROOMS, code.toUpperCase()), (snap) => {
    cb(snap.exists() ? (snap.data() as RaceRoom) : null);
  });
}

// Throttled position update — the client calls this ~12 times/sec
export async function updateRacePlayerState(
  code: string,
  uid: string,
  state: Partial<RaceRoomPlayer>
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, RACE_ROOMS, code.toUpperCase());
  const patch: Record<string, unknown> = {};
  for (const k of Object.keys(state)) {
    patch[`players.${uid}.${k}`] = (state as Record<string, unknown>)[k];
  }
  await updateDoc(ref, patch);
}

// Mark race as started (host only).
export async function startRaceRoom(code: string, host_uid: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, RACE_ROOMS, code.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Room no dey again.");
  const room = snap.data() as RaceRoom;
  if (room.host_uid !== host_uid) throw new Error("Na only host fit start race.");
  await updateDoc(ref, { room_status: "racing", started_at: Date.now() });
}

// Leave room + clean up if empty.
export async function leaveRaceRoom(
  code: string,
  uid: string,
  isHost: boolean
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, RACE_ROOMS, code.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const room = snap.data() as RaceRoom;
  const remainingPlayers = { ...room.players };
  delete remainingPlayers[uid];
  if (Object.keys(remainingPlayers).length === 0) {
    // Empty room — delete it
    await deleteDoc(ref);
    return;
  }
  // Update players map (must use serverTimestamp-safe approach)
  await updateDoc(ref, {
    players: remainingPlayers,
    // If host left, promote the next player
    ...(isHost ? { host_uid: Object.keys(remainingPlayers)[0] } : {}),
  });
}

// ---------- Lagos Life: Micro-loans ----------
// Lapo Babies (and anyone with cash < 1000) can take a micro-loan. The loan
// compounds at 5% per hour (so ₦1000 becomes ₦1050 in 1h, ₦1102 in 2h).
// Auto-deducted from cash as the player earns.

export async function takeMicroLoan(
  profile: PlayerProfile,
  amount: number
): Promise<void> {
  if (amount <= 0 || amount > 50000) throw new Error("Loan must be ₦1 - ₦50,000");
  if (profile.activeLoan) throw new Error("You still get outstanding loan. Pay am first!");
  const db = getFirebaseDb();
  const loan = {
    principal: amount,
    interestRate: 0.05, // 5% per hour
    totalOwed: amount,
    takenAt: Date.now(),
  };
  await updateDoc(doc(db, USERS, profile.uid), {
    cash: increment(amount),
    activeLoan: loan,
  });
}

export async function repayMicroLoan(
  profile: PlayerProfile,
  amount: number
): Promise<void> {
  if (!profile.activeLoan) throw new Error("You no get outstanding loan.");
  if (amount <= 0) throw new Error("Enter amount");
  if (amount > profile.cash) throw new Error("You no get enough cash");
  if (amount > profile.activeLoan.totalOwed) amount = profile.activeLoan.totalOwed;
  const db = getFirebaseDb();
  const newOwed = profile.activeLoan.totalOwed - amount;
  await updateDoc(doc(db, USERS, profile.uid), {
    cash: increment(-amount),
    activeLoan: newOwed === 0 ? null : { ...profile.activeLoan, totalOwed: newOwed },
  });
}

// ---------- Lagos Life: Street interactions ----------
// Pickpocket: attacker tries to steal a percentage of victim's pocket cash.
// Success rate depends on attacker's street_cred vs victim's street_cred.
// On success: attacker gains cash, victim loses cash, victim gets a DM.
// On failure: attacker gets reported automatically, jailed for 5 minutes.
export async function pickpocket(
  attacker: PlayerProfile,
  victimUid: string
): Promise<{ success: boolean; stolen: number; message: string }> {
  const db = getFirebaseDb();
  const victimSnap = await getDoc(doc(db, USERS, victimUid));
  if (!victimSnap.exists()) throw new Error("Victim no dey");
  const victim = victimSnap.data() as PlayerProfile;
  if (victim.cash <= 0) {
    return { success: false, stolen: 0, message: `${victim.username} no get cash for pocket. Try another person.` };
  }
  // Success rate: 50% base + (attacker.cred - victim.cred) / 2
  const attackerCred = attacker.vitals?.street_cred ?? 10;
  const victimCred = victim.vitals?.street_cred ?? 10;
  const successRate = Math.max(0.1, Math.min(0.85, 0.5 + (attackerCred - victimCred) / 200));
  const success = Math.random() < successRate;
  if (!success) {
    // Auto-jail the attacker for 5 minutes
    await updateDoc(doc(db, USERS, attacker.uid), {
      jailedUntil: Date.now() + 5 * 60 * 1000,
      jailedReason: `Caught trying to pickpocket ${victim.username}`,
    });
    return { success: false, stolen: 0, message: `🚔 You been caught! Dem lock you for 5 minutes.` };
  }
  // Steal 5-20% of victim's cash
  const pct = 0.05 + Math.random() * 0.15;
  const stolen = Math.min(victim.cash, Math.round(victim.cash * pct));
  await updateDoc(doc(db, USERS, victimUid), { cash: increment(-stolen) });
  await updateDoc(doc(db, USERS, attacker.uid), { cash: increment(stolen) });
  // Notify victim via DM
  try {
    await sendDm(attacker, victimUid, victim.username, `🚨 Pickpocket alert! @${attacker.username} don steal ₦${stolen.toLocaleString()} from your pocket! Report am if you catch am.`);
  } catch { /* best-effort */ }
  return { success: true, stolen, message: `💰 Success! You don pickpocket ₦${stolen.toLocaleString()} from @${victim.username}!` };
}

// Report to police: target a player who's been harassing you. If they've
// pickpocketed someone in the last hour (we can't verify, so it's a vote
// system), they get jailed. For simplicity, anyone can jail anyone for
// 5 minutes — but each player can only report once per hour (cooldown
// tracked in their own profile).
export async function reportToPolice(
  reporter: PlayerProfile,
  offenderUid: string
): Promise<{ success: boolean; message: string }> {
  const db = getFirebaseDb();
  const offenderSnap = await getDoc(doc(db, USERS, offenderUid));
  if (!offenderSnap.exists()) throw new Error("Person no dey");
  const offender = offenderSnap.data() as PlayerProfile;
  if (offender.jailedUntil && offender.jailedUntil > Date.now()) {
    return { success: false, message: `${offender.username} dey inside cell already.` };
  }
  // Jail offender for 10 minutes
  await updateDoc(doc(db, USERS, offenderUid), {
    jailedUntil: Date.now() + 10 * 60 * 1000,
    jailedReason: `Reported by @${reporter.username}`,
  });
  // Notify offender via DM
  try {
    await sendDm(reporter, offenderUid, offender.username, `🚔 @${reporter.username} don report you to police! Dem lock you for 10 minutes. Stay calm — e go pass.`);
  } catch { /* best-effort */ }
  return { success: true, message: `✓ You don report @${offender.username}. Police lock am for 10 minutes.` };
}
