// src/lib/firestore.ts — Firestore data layer for AfroRush.
// Profiles, crews, presence, leaderboards — all reactive via onSnapshot.

import {
  collection,
  doc,
  getDoc,
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
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import {
  DEFAULT_UNLOCKED,
  type Crew,
  type Loadout,
  type PlayerProfile,
  type RaceMode,
} from "./storage";

// ---------- Collections ----------
const USERS = "users";
const CREWS = "crews";
const PRESENCE = "presence";

// We store the unlocked items list as a sub-doc to keep profile doc small.
const UNLOCKED_KEY = "unlocked";

// ---------- Profiles ----------

export async function fetchProfile(uid: string): Promise<PlayerProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as PlayerProfile;
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
    cb(snap.exists() ? (snap.data() as PlayerProfile) : null);
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
