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

  return changed ? merged : (existing as PlayerProfile);
}
