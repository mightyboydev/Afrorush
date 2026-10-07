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

export async function purchaseItem(uid: string, itemId: string, _price: number): Promise<void> {
  // SECURITY: All purchases must go through the server API route /api/economy/buy
  // This client-side function is kept for backward compat but should NOT be called.
  throw new Error("Use callBuyApi() from systems/economy.ts instead of purchaseItem()");
}

export async function applyRaceResult(
  _uid: string,
  _result: {
    cashEarned: number;
    repEarned: number;
    mode: RaceMode;
    score: number;
  }
): Promise<void> {
  // SECURITY: All race rewards must go through the server API route /api/economy/race
  throw new Error("Use callRaceApi() from systems/economy.ts instead of applyRaceResult()");
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
// SECURITY: All transfers must go through the server API route /api/economy/transfer
// This client-side function is kept for backward compat but should NOT be called.
export async function transferCash(
  _from: PlayerProfile,
  _recipientUsername: string,
  _amount: number,
  _note?: string
): Promise<{ recipientName: string; recipientUid: string }> {
  throw new Error("Use callTransferApi() from systems/economy.ts instead of transferCash()");
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

// SECURITY: All loan operations must go through the server API route /api/economy/loan
// The server writes activeLoan + cash. Clients cannot write either.
export async function takeMicroLoan(
  _profile: PlayerProfile,
  _amount: number
): Promise<void> {
  throw new Error("Use callLoanApi('take', amount) from systems/economy.ts instead");
}

export async function repayMicroLoan(
  _profile: PlayerProfile,
  _amount: number
): Promise<void> {
  throw new Error("Use callLoanApi('repay', amount) from systems/economy.ts instead");
}

// ---------- Lagos Life: Street interactions ----------
// Pickpocket: attacker tries to steal a percentage of victim's pocket cash.
// Success rate depends on attacker's street_cred vs victim's street_cred.
// On success: attacker gains cash, victim loses cash, victim gets a DM.
// On failure: attacker gets reported automatically, jailed for 5 minutes.
// SECURITY: All pickpocket/report operations must go through the server API route /api/economy/pickpocket
// The server handles cash transfers between players atomically.
export async function pickpocket(
  _attacker: PlayerProfile,
  _victimUid: string
): Promise<{ success: boolean; stolen: number; message: string }> {
  throw new Error("Use callPickpocketApi() from systems/economy.ts instead");
}

export async function reportToPolice(
  _reporter: PlayerProfile,
  _offenderUid: string
): Promise<{ success: boolean; message: string }> {
  throw new Error("Use callReportApi() from systems/economy.ts instead");
}
