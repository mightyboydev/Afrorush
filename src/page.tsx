"use client";

// src/app/page.tsx — AfroRush entry point.
// Flow: LoadingScreen → Landing → Onboarding → Main app (4-tab bottom nav).
// Tabs: Home (apartment), Map (3D world), Phone (smartphone), Buy (shop).
// Race mode launches as a full-screen Phaser overlay.

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AuthProvider, useAuth } from "@/lib/auth";
import LoadingScreen from "@/components/LoadingScreen";
import Landing from "@/components/Landing";
import Onboarding from "@/components/Onboarding";
import Joystick from "@/components/Joystick";
import WorldUI from "@/components/WorldUI";
import DialogueBox from "@/components/DialogueBox";
import MissionTracker, { type Mission } from "@/components/MissionTracker";
import BottomNav, { type Tab } from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import MapScreen from "@/components/MapScreen";
import PhoneScreen from "@/components/PhoneScreen";
import BuyScreen from "@/components/BuyScreen";
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
  | { kind: "redirect" };

function AfroRushRoot() {
  const { state } = useAuth();
  const { user, profile, loading, loadingProfile } = state;
  const [booted, setBooted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function derivePhase(): Phase {
    if (!booted || loading) return { kind: "loading" };
    if (!user) return { kind: "auth" };
    if (loadingProfile || !profile) return { kind: "loading" };
    if (!profile.onboardingComplete) return { kind: "onboarding" };
    return { kind: "redirect" };
  }
  const phase = derivePhase();

  // Redirect to /hub when authenticated + onboarded
  useEffect(() => {
    if (phase.kind === "redirect") {
      router.replace("/hub");
    }
  }, [phase.kind, router]);

  if (phase.kind === "loading") {
    return loadingProfile
      ? <LoadingScreen message="Loading your rider…" />
      : <LoadingScreen />;
  }
  if (phase.kind === "auth") return <Landing />;
  if (phase.kind === "onboarding") return <Onboarding />;
  if (phase.kind === "redirect") {
    return <LoadingScreen message="Entering the streets…" />;
  }
  return <LoadingScreen />;
}

// ---------- Main App Shell (4-tab bottom nav) ----------

function AppShell({ profile }: { profile: NonNullable<ReturnType<typeof useAuth>["state"]["profile"]> }) {
  const { state } = useAuth();
  const unlocked = state.unlocked;
  const inputRef = useRef({ x: 0, y: 0, boost: false });
  const [tab, setTabState] = useState<Tab>("map");
  const [riding, setRiding] = useState(false);
  const [cityReady, setCityReady] = useState(false);
  const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [raceMode, setRaceMode] = useState<RaceMode | null>(null);
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);
  const [weather, setWeather] = useState<"clear" | "rain" | "harmattan">("clear");

  // Tab change wrapper that pushes to history so the browser back button
  // navigates between tabs instead of leaving the site entirely.
  const setTab = (next: Tab) => {
    if (next === tab) return;
    setTabState(next);
    if (typeof window !== "undefined") {
      window.history.pushState({ tab: next, ts: Date.now() }, "", `#${next}`);
    }
  };

  // On mount, read the hash to restore the tab (handles back/forward).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "home" || hash === "map" || hash === "phone" || hash === "buy") {
      setTabState(hash as Tab);
    }
    // Seed initial history state
    window.history.replaceState({ tab: "map", ts: Date.now() }, "", "#map");

    const onPop = (e: PopStateEvent) => {
      const st = e.state as { tab?: Tab } | null;
      if (st?.tab) setTabState(st.tab);
      else {
        // No state — default to map
        setTabState("map");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keyboard input (desktop) — only active when on Map tab
  useEffect(() => {
    if (tab !== "map") return;
    const keys: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " || e.key === "Shift") inputRef.current.boost = true;
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
      // Reset input when leaving map tab
      inputRef.current.x = 0;
      inputRef.current.y = 0;
      inputRef.current.boost = false;
    };
  }, [tab]);

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

  const handleAcceptMission = (missionId: string) => {
    const npc = activeNPC;
    if (!npc?.missions?.[0]) return;
    const m = npc.missions[0];
    setMissions((prev) => {
      if (prev.some((x) => x.id === missionId)) return prev;
      return [...prev, { id: m.id, title: m.title, desc: m.desc, reward: m.reward, progress: 0 }];
    });
  };

  const handleRaceFinish = (result: RaceResult) => {
    setRaceResult(result);
    setRaceMode(null);
  };

  // Challenge a player to a 1v1 race
  const [challenge, setChallenge] = useState<{ uid: string; username: string } | null>(null);

  const handleChallengePlayer = (uid: string, username: string) => {
    setChallenge({ uid, username });
  };

  const startChallengeRace = () => {
    if (!challenge) return;
    setRaceMode("street-race");
    setChallenge(null);
  };

  // Visit a location from the Map screen → either start race or switch to map tab
  const handleVisitLocation = (id: string) => {
    if (id === "race-track") {
      setRaceMode("street-race");
    } else if (id === "garage") {
      // Garage opens the Buy tab for customization
      setTab("buy");
    } else {
      // Switch to 3D world view
      setTab("map");
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-rush-sky">
      {/* 3D Canvas — always rendered so it stays warm, but covered by other tabs */}
      <City
        avatar={profile.avatar}
        quality={profile.graphicsQuality}
        riding={riding}
        inputRef={inputRef}
        weather={weather}
        onTalkToNPC={(npc) => setActiveNPC(npc)}
        onReady={() => setCityReady(true)}
      />

      {/* Tab content overlays */}
      <div className="fixed inset-0 z-10 overflow-y-auto pb-20">
        {tab === "home" && (
          <div className="mx-auto max-w-md px-4 pt-4 safe-pt">
            <HomeScreen profile={profile} />
          </div>
        )}
        {tab === "map" && (
          <div className="mx-auto max-w-md px-4 pt-4 safe-pt">
            <MapScreen
              profile={profile}
              onVisitLocation={handleVisitLocation}
              onChallengePlayer={handleChallengePlayer}
              onlineCount={0}
            />
          </div>
        )}
        {tab === "phone" && (
          <div className="mx-auto max-w-md px-4 pt-4 safe-pt">
            <PhoneScreen profile={profile} />
          </div>
        )}
        {tab === "buy" && (
          <div className="mx-auto max-w-md px-4 pt-4 safe-pt">
            <BuyScreen profile={profile} unlocked={unlocked} />
          </div>
        )}
      </div>

      {/* HUD overlays — only on Map tab (when exploring the 3D world) */}
      {tab === "map" && cityReady && (
        <>
          <WorldUI
            profile={profile}
            riding={riding}
            onToggleRide={() => setRiding((r) => !r)}
            onHorn={() => {}}
            onBoost={(active) => { inputRef.current.boost = active; }}
            onEmote={() => {}}
            onOpenPlace={handleVisitLocation}
            onOpenMenu={() => setTab("phone")}
            onOpenNotifications={() => {}}
          />
          <Joystick inputRef={inputRef} />
          <MissionTracker missions={missions} />
          <DialogueBox
            npc={activeNPC}
            onClose={() => setActiveNPC(null)}
            onAcceptMission={handleAcceptMission}
          />
          {weather !== "clear" && (
            <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2">
              <div className="rounded-full bg-rush-navy/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {weather === "rain" ? "🌧️ Rain" : "🏜️ Harmattan"}
              </div>
            </div>
          )}
        </>
      )}

      {/* Challenge modal */}
      {challenge && (
        <ChallengeModal
          username={challenge.username}
          onClose={() => setChallenge(null)}
          onAccept={startChallengeRace}
        />
      )}

      {/* Phaser race game overlay */}
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

      {/* Bottom navigation — always visible */}
      <BottomNav active={tab} onChange={setTab} unreadNotifications={3} />
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="rush-card rush-bounce-in w-full max-w-sm p-6 text-center">
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
          className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 active:scale-95"
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

// ---------- Challenge Modal (1v1 race) ----------

function ChallengeModal({
  username,
  onClose,
  onAccept,
}: {
  username: string;
  onClose: () => void;
  onAccept: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="rush-card rush-bounce-in w-full max-w-sm p-6 text-center">
        <div className="mb-2 text-5xl">🏁</div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-rush-orange">Race Challenge</div>
        <h2 className="mt-1 font-display text-2xl text-rush-navy">
          vs {username}
        </h2>
        <p className="mt-2 text-sm text-rush-navy/60">
          Challenge {username} to a 1v1 Street Race. Winner takes the bragging rights + bonus rep.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-2xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="rounded-2xl bg-rush-orange px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-orange/30 active:scale-95"
          >
            Race! 🏁
          </button>
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-widest text-rush-navy/40">
          Mode: Street Race · 1v1
        </div>
      </div>
    </div>
  );
}
