"use client";

// src/app/page.tsx — AfroRush entry point.
// Phase 1 flow: LoadingScreen → Landing → Onboarding → 3D World.
// Phaser race game runs as a mini-game when entering the Race Track (Phase 2).

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { AuthProvider, useAuth } from "@/lib/auth";
import LoadingScreen from "@/components/LoadingScreen";
import Landing from "@/components/Landing";
import Onboarding from "@/components/Onboarding";
import Joystick from "@/components/Joystick";
import WorldUI from "@/components/WorldUI";
import DialogueBox from "@/components/DialogueBox";
import MissionTracker, { type Mission } from "@/components/MissionTracker";
import type { NPCData } from "@/world/NPCs";
import type { RaceMode } from "@/lib/storage";
import type { RaceResult } from "@/game/AfroRushScene";

// 3D City is heavy and uses `window` (THREE). Load with ssr:false.
const City = dynamic(() => import("@/world/City"), { ssr: false });
// Phaser race game — also needs `window`.
const AfroRushGame = dynamic(() => import("@/components/AfroRushGame"), { ssr: false });

export default function AfroRushPage() {
  return (
    <AuthProvider>
      <AfroRushRoot />
    </AuthProvider>
  );
}

type Phase =
  | { kind: "loading" }
  | { kind: "auth" }
  | { kind: "onboarding" }
  | { kind: "world" };

function AfroRushRoot() {
  const { state } = useAuth();
  const { user, profile, loading, loadingProfile } = state;
  const [booted, setBooted] = useState(false);

  // Show loading screen for a minimum branding time on first load.
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Derive the current phase from auth state — no setState-in-effect needed.
  function derivePhase(): Phase {
    if (!booted || loading) return { kind: "loading" };
    if (!user) return { kind: "auth" };
    if (loadingProfile || !profile) return { kind: "loading" };
    if (!profile.onboardingComplete) return { kind: "onboarding" };
    return { kind: "world" };
  }
  const phase = derivePhase();

  // ---- Render gates ----

  if (phase.kind === "loading") {
    return loadingProfile
      ? <LoadingScreen message="Loading your rider…" />
      : <LoadingScreen />;
  }
  if (phase.kind === "auth") return <Landing />;
  if (phase.kind === "onboarding") return <Onboarding />;

  return <WorldShell profile={profile!} />;
}

// ---------- 3D World Shell ----------

function WorldShell({ profile }: { profile: NonNullable<ReturnType<typeof useAuth>["state"]["profile"]> }) {
  const inputRef = useRef({ x: 0, y: 0, boost: false });
  const [riding, setRiding] = useState(false);
  const [cityReady, setCityReady] = useState(false);
  const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [raceMode, setRaceMode] = useState<RaceMode | null>(null);
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);
  const [weather, setWeather] = useState<"clear" | "rain" | "harmattan">("clear");

  // Keyboard input (desktop)
  useEffect(() => {
    const keys: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " || e.key === "Shift") inputRef.current.boost = true;
      // Weather toggle for demo (W key + Shift)
      if (e.key.toLowerCase() === "w" && e.shiftKey) {
        setWeather((w) => w === "clear" ? "rain" : w === "rain" ? "harmattan" : "clear");
      }
    };
    const up = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
      if (e.key === " " || e.key === "Shift") inputRef.current.boost = false;
    };
    const tick = () => {
      let x = 0, y = 0;
      if (keys["w"] || keys["arrowup"]) y -= 1;
      if (keys["s"] || keys["arrowdown"]) y += 1;
      if (keys["a"] || keys["arrowleft"]) x -= 1;
      if (keys["d"] || keys["arrowright"]) x += 1;
      const mag = Math.sqrt(x * x + y * y);
      if (mag > 1) { x /= mag; y /= mag; }
      inputRef.current.x = x;
      inputRef.current.y = y;
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Pause rendering when tab is hidden
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        inputRef.current.x = 0;
        inputRef.current.y = 0;
        inputRef.current.boost = false;
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Accept a mission from an NPC
  const handleAcceptMission = (missionId: string) => {
    // Find the mission in NPC data
    const npc = activeNPC;
    if (!npc?.missions?.[0]) return;
    const m = npc.missions[0];
    setMissions((prev) => {
      if (prev.some((x) => x.id === missionId)) return prev;
      return [...prev, { id: m.id, title: m.title, desc: m.desc, reward: m.reward, progress: 0 }];
    });
  };

  // Race Track opens Phaser
  const handleOpenPlace = (id: string) => {
    if (id === "race-track") {
      setRaceMode("street-race");
    }
  };

  // Race finished
  const handleRaceFinish = (result: RaceResult) => {
    setRaceResult(result);
    setRaceMode(null);
    // TODO Phase 4: persist to Firestore via server route
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-rush-sky">
      {/* 3D Canvas */}
      <City
        avatar={profile.avatar}
        quality={profile.graphicsQuality}
        riding={riding}
        inputRef={inputRef}
        weather={weather}
        onTalkToNPC={(npc) => setActiveNPC(npc)}
        onReady={() => setCityReady(true)}
      />

      {/* Loading overlay until city is ready */}
      {!cityReady && <LoadingScreen message="Building the city…" />}

      {/* HUD overlays */}
      {cityReady && (
        <>
          <WorldUI
            profile={profile}
            riding={riding}
            onToggleRide={() => setRiding((r) => !r)}
            onHorn={() => {}}
            onBoost={(active) => { inputRef.current.boost = active; }}
            onEmote={() => {}}
            onOpenPlace={handleOpenPlace}
            onOpenMenu={() => {}}
            onOpenNotifications={() => {}}
          />
          <Joystick inputRef={inputRef} />
          <MissionTracker missions={missions} />
          <DialogueBox
            npc={activeNPC}
            onClose={() => setActiveNPC(null)}
            onAcceptMission={handleAcceptMission}
          />

          {/* Weather indicator */}
          {weather !== "clear" && (
            <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2">
              <div className="rounded-full bg-rush-navy/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {weather === "rain" ? "🌧️ Rain" : "🏜️ Harmattan"}
              </div>
            </div>
          )}
        </>
      )}

      {/* Phaser race game overlay (when entering Race Track) */}
      {raceMode && (
        <div className="fixed inset-0 z-50 bg-black">
          <AfroRushGame
            mode={raceMode}
            loadout={profile.loadout}
            soundOn={profile.soundOn}
            onExit={() => setRaceMode(null)}
            onFinish={handleRaceFinish}
          />
        </div>
      )}

      {/* Race results overlay */}
      {raceResult && (
        <RaceResultOverlay
          result={raceResult}
          profile={profile}
          onClose={() => setRaceResult(null)}
        />
      )}
    </div>
  );
}

// ---------- Race Result Overlay ----------

function RaceResultOverlay({
  result,
  profile,
  onClose,
}: {
  result: RaceResult;
  profile: { username: string; cash: number; rep: number };
  onClose: () => void;
}) {
  const won = result.finished;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="rush-card w-full max-w-sm p-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-rush-gold">Race Complete</div>
        <h2
          className="font-display text-3xl"
          style={{ color: won ? "#1fb86f" : "#ef4444" }}
        >
          {won ? "Victory!" : result.reason === "caught" ? "Busted!" : "Wrecked!"}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Score" value={result.score.toLocaleString()} />
          <Stat label="Distance" value={`${result.distance}m`} />
          <Stat label="Cash" value={`+₦${result.cashEarned}`} />
          <Stat label="Rep" value={`+${result.repEarned}`} />
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white"
        >
          Back to City
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-rush-cream/50 p-2">
      <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">{label}</div>
      <div className="font-mono text-sm font-bold text-rush-navy">{value}</div>
    </div>
  );
}
