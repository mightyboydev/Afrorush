"use client";

// src/app/page.tsx — AfroRush entry point.
// Orchestrates: AuthScreen → Lobby → Race → Results.
// State is fully derived from auth + a single "phase" variable that
// user-driven transitions (start race / finish race / back to lobby) update.

import { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { applyRaceResult } from "@/lib/firestore";
import { getItem, type RaceMode } from "@/lib/storage";
import type { RaceResult } from "@/game/AfroRushScene";
import AuthScreen from "@/components/AuthScreen";
import Lobby from "@/components/Lobby";
import AfroRushGame from "@/components/AfroRushGame";

type Phase = "lobby" | { kind: "race"; mode: RaceMode } | { kind: "results"; result: RaceResult };

export default function AfroRushPage() {
  return (
    <AuthProvider>
      <AfroRushRoot />
    </AuthProvider>
  );
}

function AfroRushRoot() {
  const { state, refreshProfile } = useAuth();
  const { user, profile, loading, loadingProfile } = state;
  const [phase, setPhase] = useState<Phase>("lobby");

  // ---- Auth gates (no setState-in-effect; pure derivation) ----

  if (loading) return <Fullscreen message="Loading AfroRush…" />;
  if (!user) return <AuthScreen />;
  if (loadingProfile || !profile) return <Fullscreen message="Loading your profile…" />;

  // ---- Phase routing ----

  if (phase.kind === "race") {
    const bike = getItem(profile.loadout.bikeId);
    const outfit = getItem(profile.loadout.outfitId);
    const exhaust = getItem(profile.loadout.exhaustId);
    return (
      <div className="fixed inset-0 z-50">
        <AfroRushGame
          mode={phase.mode}
          loadout={profile.loadout}
          soundOn={profile.soundOn}
          bikeColorFallback={bike?.color ?? "#d2601a"}
          outfitColorFallback={outfit?.color ?? "#f5f5f5"}
          exhaustColorFallback={exhaust?.color ?? "#9ca3af"}
          onExit={() => setPhase({ kind: "results", result: makeQuitResult(phase.mode) })}
          onFinish={async (result) => {
            // Persist to Firestore, then transition to results.
            const prevHigh = profile.highScores[result.mode] ?? 0;
            try {
              await applyRaceResult(profile.uid, {
                cashEarned: result.cashEarned,
                repEarned: result.repEarned,
                mode: result.mode,
                score: result.score,
              });
              await refreshProfile();
            } catch (e) {
              console.error("Failed to save race result:", e);
            }
            result.newHighScore = result.score > prevHigh;
            result.prevHighScore = prevHigh;
            setPhase({ kind: "results", result });
          }}
        />
      </div>
    );
  }

  if (phase.kind === "results") {
    return (
      <ResultsScreen
        result={phase.result}
        profile={profile}
        onHome={() => setPhase("lobby")}
        onRetry={() => setPhase({ kind: "race", mode: phase.result.mode })}
      />
    );
  }

  return <Lobby onStartRace={(mode) => setPhase({ kind: "race", mode })} />;
}

function makeQuitResult(mode: RaceMode): RaceResult {
  return {
    mode,
    finished: false,
    distance: 0,
    score: 0,
    style: 0,
    cashEarned: 0,
    repEarned: 0,
    durationMs: 0,
    reason: "quit",
    newHighScore: false,
    prevHighScore: 0,
    packages: 0,
  };
}

// ---------- Results ----------

function ResultsScreen({
  result,
  profile,
  onHome,
  onRetry,
}: {
  result: RaceResult;
  profile: { username: string; cash: number; rep: number };
  onHome: () => void;
  onRetry: () => void;
}) {
  const won = result.finished;
  const isQuit = result.reason === "quit";
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden bg-[#1a0f33] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 rush-pattern opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2b1055]/30 via-[#1a0f33]/50 to-[#1a0f33]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-rush-gold">
            {isQuit ? "Race Abandoned" : "Race Complete"}
          </div>
          <h2
            className="mt-2 text-5xl font-black uppercase text-stroke sm:text-7xl"
            style={{ color: won ? "#1f9d55" : result.reason === "caught" ? "#e94f37" : "#e94f37" }}
          >
            {isQuit ? "Back to Lobby" : won ? "Victory!" : result.reason === "caught" ? "Busted!" : "Wrecked!"}
          </h2>
          {result.newHighScore && (
            <div className="mt-2 inline-block rounded-full bg-rush-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
              ★ New Personal Best!
            </div>
          )}
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Final Score</div>
          <div className="font-mono text-5xl font-black text-rush-gold sm:text-6xl">
            {result.score.toLocaleString()}
          </div>
          {result.prevHighScore > 0 && !result.newHighScore && (
            <div className="mt-1 text-xs text-white/40">
              Best: {result.prevHighScore.toLocaleString()}
            </div>
          )}
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Distance" value={`${result.distance}m`} accent="white" />
          <Stat label="Style" value={result.style} accent="jade" />
          <Stat label="Cash" value={`+₦${result.cashEarned}`} accent="gold" />
          <Stat label="Rep" value={`+${result.repEarned}`} accent="jade" />
        </div>

        <div className="text-xs text-white/40">
          New totals: ₦{profile.cash.toLocaleString()} cash · {profile.rep.toLocaleString()} rep
        </div>

        <div className="flex w-full max-w-md gap-2">
          <button
            onClick={onHome}
            className="flex-1 rounded-xl bg-black/40 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-black/60"
          >
            Lobby
          </button>
          {!isQuit && (
            <button
              onClick={onRetry}
              className="flex-1 rounded-xl bg-gradient-to-r from-rush-flame to-rush-gold px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-rush-flame/30 hover:opacity-90"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: "white" | "gold" | "jade" }) {
  const colors: Record<string, string> = {
    white: "text-white",
    gold: "text-rush-gold",
    jade: "text-rush-jade",
  };
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className={`font-mono text-lg font-bold ${colors[accent]}`}>{value}</div>
    </div>
  );
}

function Fullscreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1a0f33] text-white">
      <div className="text-center">
        <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-rush-gold border-t-transparent" />
        <div className="text-sm uppercase tracking-widest text-white/60">{message}</div>
      </div>
    </main>
  );
}
