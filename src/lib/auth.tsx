"use client";

// src/lib/auth.tsx — AuthProvider wraps the app and exposes the current
// Firebase user + their PlayerProfile + unlocked items.

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateAuthProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import {
  bootstrapProfile,
  fetchPlayerState,
  startPresenceHeartbeat,
  subscribeToProfile,
  subscribeToUnlocked,
  updateProfile,
} from "./firestore";
import {
  makeDefaultProfile,
  DEFAULT_AVATAR,
  DEFAULT_LOADOUT,
  DEFAULT_HIGH_SCORES,
  type PlayerProfile,
} from "./storage";

export interface AuthState {
  user: User | null;
  profile: PlayerProfile | null;
  unlocked: string[];
  loading: boolean; // initial auth bootstrap
  loadingProfile: boolean; // profile document fetch in flight
  error: string | null;
}

export interface AuthApi {
  state: AuthState;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopPresenceRef = useRef<(() => void) | null>(null);
  const unsubProfileRef = useRef<(() => void) | null>(null);
  const unsubUnlockedRef = useRef<(() => void) | null>(null);

  // 1. Subscribe to auth state changes.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        // Clean up subscriptions + presence on sign-out.
        if (stopPresenceRef.current) stopPresenceRef.current();
        if (unsubProfileRef.current) unsubProfileRef.current();
        if (unsubUnlockedRef.current) unsubUnlockedRef.current();
        stopPresenceRef.current = null;
        unsubProfileRef.current = null;
        unsubUnlockedRef.current = null;
        setProfile(null);
        setUnlocked([]);
      }
    });
    return () => unsub();
  }, [auth]);

  // 2. When user is set, load initial profile snapshot, then subscribe.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoadingProfile(true);

    (async () => {
      const { profile: existing, unlocked: existingUnlocked } = await fetchPlayerState(user.uid);
      if (cancelled) return;

      if (!existing) {
        // First-time login: create a profile document.
        const username = user.displayName ?? (user.email ? user.email.split("@")[0] : "Rider");
        const fresh = makeDefaultProfile(user.uid, user.email, username, user.photoURL);
        try {
          await bootstrapProfile(fresh);
          if (!cancelled) {
            setProfile(fresh);
            setUnlocked(existingUnlocked);
          }
        } catch (e) {
          if (!cancelled) setError((e as Error).message);
        }
      } else {
        // MIGRATE: Old profiles may be missing Phase 1+ fields (avatar, gold,
        // city, graphicsQuality, onboardingComplete, banned, etc.).
        // Patch any missing fields with defaults so the app doesn't crash.
        const migrated = migrateProfile(existing);
        if (migrated !== existing) {
          try { await updateProfile(user.uid, migrated); } catch { /* best-effort */ }
        }
        if (!cancelled) {
          setProfile(migrated);
          setUnlocked(existingUnlocked);
        }
      }

      if (cancelled) return;
      setLoadingProfile(false);

      // Subscribe to live profile + unlocked updates.
      unsubProfileRef.current = subscribeToProfile(user.uid, (p) => setProfile(p));
      unsubUnlockedRef.current = subscribeToUnlocked(user.uid, (ids) => setUnlocked(ids));
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // 3. Maintain presence heartbeat while profile is loaded.
  useEffect(() => {
    if (!user || !profile) return;
    if (stopPresenceRef.current) stopPresenceRef.current();
    stopPresenceRef.current = startPresenceHeartbeat(profile);
    return () => {
      if (stopPresenceRef.current) stopPresenceRef.current();
      stopPresenceRef.current = null;
    };
  }, [user, profile?.uid]); // re-arm only when user changes; profile refresh doesn't need to restart heartbeat

  // 4. Clear presence on tab close / page unload.
  useEffect(() => {
    const handler = () => {
      if (user) {
        // Fire-and-forget; best-effort.
        void import("./firestore").then(({ clearPresence }) => clearPresence(user.uid));
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [user]);

  // ----- Auth API -----

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (username) {
        await updateAuthProfile(cred.user, { displayName: username });
      }
      // The onAuthStateChanged effect will pick this up and bootstrap the profile.
    } catch (e) {
      const err = e as { code?: string; message?: string };
      const msg = err.code || err.message || "Sign-up failed";
      setError(prettyAuthError(msg));
      throw e;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      const msg = err.code || err.message || "Sign-in failed";
      setError(prettyAuthError(msg));
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      const msg = err.code || err.message || "Google sign-in failed";
      setError(prettyAuthError(msg));
      throw e;
    }
  };

  const signOutUser = async () => {
    if (stopPresenceRef.current) stopPresenceRef.current();
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { profile: p, unlocked: u } = await fetchPlayerState(user.uid);
    setProfile(p);
    setUnlocked(u);
  };

  const value = useMemo<AuthApi>(
    () => ({
      state: { user, profile, unlocked, loading, loadingProfile, error },
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOutUser,
      refreshProfile,
    }),
    [user, profile, unlocked, loading, loadingProfile, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function prettyAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("configuration-not-found")) return "Auth not enabled yet — see the in-app note below.";
  if (lower.includes("email-already-in-use")) return "That email is already registered. Try signing in.";
  if (lower.includes("invalid-email")) return "That email address doesn't look right.";
  if (lower.includes("weak-password")) return "Password should be at least 6 characters.";
  if (lower.includes("invalid-credential") || lower.includes("wrong-password")) return "Wrong email or password.";
  if (lower.includes("user-not-found")) return "No account found with that email.";
  if (lower.includes("popup-closed")) return "Google sign-in cancelled.";
  if (lower.includes("network")) return "Network error. Check your connection.";
  if (lower.includes("too-many-requests")) return "Too many attempts. Try again in a minute.";
  if (lower.includes("operation-not-allowed")) return "This sign-in method isn't enabled in Firebase yet.";
  return msg.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/g, "").trim() || "Something went wrong.";
}

// Migrate an old profile document to the current schema.
// Returns the SAME object if no migration was needed, or a NEW object
// with missing fields filled in from defaults.
export function migrateProfile(existing: Partial<PlayerProfile>): PlayerProfile {
  const defaults = makeDefaultProfile(
    existing.uid ?? "",
    existing.email ?? null,
    existing.username ?? "Rider",
    existing.photoURL ?? null
  );
  let changed = false;
  const merged: PlayerProfile = { ...defaults, ...existing } as PlayerProfile;

  // Ensure nested objects are present
  if (!existing.avatar) { merged.avatar = { ...DEFAULT_AVATAR }; changed = true; }
  if (!existing.loadout) { merged.loadout = { ...DEFAULT_LOADOUT }; changed = true; }
  if (!existing.highScores) { merged.highScores = { ...DEFAULT_HIGH_SCORES }; changed = true; }
  if (existing.gold === undefined) { merged.gold = 50; changed = true; }
  if (existing.city === undefined) { merged.city = "lagos"; changed = true; }
  if (existing.graphicsQuality === undefined) { merged.graphicsQuality = "medium"; changed = true; }
  if (existing.onboardingComplete === undefined) { merged.onboardingComplete = false; changed = true; }
  if (existing.banned === undefined) { merged.banned = false; changed = true; }
  if (existing.banReason === undefined) { merged.banReason = null; changed = true; }
  if (existing.banExpires === undefined) { merged.banExpires = null; changed = true; }
  if (existing.mutedUntil === undefined) { merged.mutedUntil = null; changed = true; }
  if (existing.warnings === undefined) { merged.warnings = 0; changed = true; }
  if (existing.role === undefined) { merged.role = "player"; changed = true; }
  // Grant admin role to the hard-coded owner UID
  if (existing.uid === "1rf7yswl35QuUyfdQehMs1qdlIy2" && merged.role !== "admin") {
    merged.role = "admin"; changed = true;
  }
  // Needs + daily loop migration
  if (!existing.needs) { merged.needs = { food: 80, energy: 80, fun: 80, social: 80, hygiene: 80, toilet: 80 }; changed = true; }
  if (existing.needsUpdatedAt === undefined) { merged.needsUpdatedAt = Date.now(); changed = true; }
  if (existing.loginStreak === undefined) { merged.loginStreak = 0; changed = true; }
  if (existing.lastLoginDate === undefined) { merged.lastLoginDate = null; changed = true; }
  if (existing.dailyTasks === undefined) { merged.dailyTasks = []; changed = true; }
  if (existing.gemsFound === undefined) { merged.gemsFound = []; changed = true; }
  if (existing.homeType === undefined) { merged.homeType = "room"; changed = true; }
  if (existing.homeLayout === undefined) { merged.homeLayout = []; changed = true; }

  // Decay needs based on real time elapsed
  if (merged.needs && merged.needsUpdatedAt) {
    const now = Date.now();
    const elapsedMin = Math.max(0, (now - merged.needsUpdatedAt) / 60000);
    const decayPerMin = 0.15; // ~1 point per 6.6 min
    const decay = elapsedMin * decayPerMin;
    merged.needs.food = Math.max(0, Math.min(100, (merged.needs.food ?? 80) - decay));
    merged.needs.energy = Math.max(0, Math.min(100, (merged.needs.energy ?? 80) - decay * 0.8));
    merged.needs.fun = Math.max(0, Math.min(100, (merged.needs.fun ?? 80) - decay * 0.6));
    merged.needs.social = Math.max(0, Math.min(100, (merged.needs.social ?? 80) - decay * 0.5));
    merged.needs.hygiene = Math.max(0, Math.min(100, (merged.needs.hygiene ?? 80) - decay * 0.7));
    merged.needs.toilet = Math.max(0, Math.min(100, (merged.needs.toilet ?? 80) - decay * 0.4));
    if (elapsedMin > 1) {
      merged.needsUpdatedAt = now;
      changed = true;
    }
  }

  // ---------- Lagos Life layer migration + decay ----------
  if (existing.birthClass === undefined) {
    // Existing players become Lapo by default (they had 500 cash before; treat
    // them as Lapo with a small grace top-up so they're not stranded instantly)
    merged.birthClass = "lapo";
    changed = true;
  }
  if (!existing.vitals) {
    merged.vitals = { stamina: 80, hunger: 20, street_cred: 10 };
    changed = true;
  }
  if (existing.vitalsUpdatedAt === undefined) {
    merged.vitalsUpdatedAt = Date.now();
    changed = true;
  }
  if (existing.activeLoan === undefined) { merged.activeLoan = null; changed = true; }
  if (existing.lastBillDate === undefined) { merged.lastBillDate = null; changed = true; }
  if (existing.jailedUntil === undefined) { merged.jailedUntil = null; changed = true; }
  if (existing.jailedReason === undefined) { merged.jailedReason = null; changed = true; }

  // Vitals decay over real time — stamina drains, hunger rises.
  if (merged.vitals && merged.vitalsUpdatedAt) {
    const now = Date.now();
    const elapsedMin = Math.max(0, (now - merged.vitalsUpdatedAt) / 60000);
    if (elapsedMin > 1) {
      const staminaDrainPerMin = 0.05;  // ~1 point per 20 min
      const hungerRisePerMin = 0.07;    // ~1 point per 14 min
      merged.vitals.stamina = Math.max(0, Math.min(100, (merged.vitals.stamina ?? 80) - elapsedMin * staminaDrainPerMin));
      merged.vitals.hunger = Math.max(0, Math.min(100, (merged.vitals.hunger ?? 20) + elapsedMin * hungerRisePerMin));
      merged.vitalsUpdatedAt = now;
      changed = true;
    }
  }

  // Saturday bills — rent + electricity. Runs once per week per player.
  // We compute this client-side on profile load (no Cloud Function needed).
  // Bills: ₦2,500 rent + ₦500 electricity = ₦3,000 total (Lagos-shaped number)
  if (merged.lastBillDate === null || isSaturdayBillDue(merged.lastBillDate)) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    // Only deduct if today is Saturday AND we haven't billed this Saturday yet
    if (today.getDay() === 6 && merged.lastBillDate !== todayStr && merged.createdAt < Date.now() - 24 * 3600 * 1000) {
      // Skip the very first day after signup (24h grace)
      const billTotal = 3000;
      const newCash = Math.max(-5000, (merged.cash ?? 0) - billTotal); // allow going negative up to -5000
      merged.cash = newCash;
      merged.lastBillDate = todayStr;
      changed = true;
    } else if (merged.lastBillDate !== todayStr) {
      // Not Saturday — keep lastBillDate updated so we don't re-check every render
      // (but only persist if we actually billed; otherwise it'll drift)
    }
  }

  // Loan interest compounding — runs hourly (or on every profile load if >1h elapsed)
  if (merged.activeLoan) {
    const now = Date.now();
    const loan = merged.activeLoan;
    const hoursElapsed = (now - loan.takenAt) / (60 * 60 * 1000);
    if (hoursElapsed >= 1) {
      // Compound interest: totalOwed = principal * (1 + rate) ^ hoursElapsed
      const newOwed = Math.round(loan.principal * Math.pow(1 + loan.interestRate, hoursElapsed));
      if (newOwed !== loan.totalOwed) {
        merged.activeLoan = {
          ...loan,
          totalOwed: newOwed,
          // Move takenAt forward by the elapsed hours so we don't recompute
          takenAt: loan.takenAt + Math.floor(hoursElapsed) * 60 * 60 * 1000,
        };
        changed = true;
      }
    }
    // Auto-deduct from cash if player has money (best-effort repayment)
    if (merged.cash > 0 && merged.activeLoan.totalOwed > 0) {
      const autoPay = Math.min(merged.cash, Math.ceil(merged.activeLoan.totalOwed * 0.05));
      if (autoPay > 0) {
        merged.cash -= autoPay;
        const newOwed = Math.max(0, merged.activeLoan.totalOwed - autoPay);
        if (newOwed === 0) {
          merged.activeLoan = null;
        } else {
          merged.activeLoan = { ...merged.activeLoan, totalOwed: newOwed };
        }
        changed = true;
      }
    }
  }

  // Clear jail if sentence is over
  if (merged.jailedUntil && merged.jailedUntil < Date.now()) {
    merged.jailedUntil = null;
    merged.jailedReason = null;
    changed = true;
  }

  return changed ? merged : (existing as PlayerProfile);
}

// Helper: is the player's lastBillDate a Saturday that's older than today?
function isSaturdayBillDue(lastBill: string): boolean {
  try {
    const last = new Date(lastBill + "T00:00:00Z");
    const today = new Date();
    // If today is Saturday AND the last bill wasn't today, bill is due
    return today.getDay() === 6 && last.toISOString().slice(0, 10) !== today.toISOString().slice(0, 10);
  } catch {
    return false;
  }
}
