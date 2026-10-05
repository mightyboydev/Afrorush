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

// 3D City is heavy and uses `window` (THREE). Load with ssr:false so it never
// runs during Next.js prerender.
const City = dynamic(() => import("@/world/City"), { ssr: false });

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

  // Keyboard input (desktop)
  useEffect(() => {
    const keys: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      // Boost on space / shift
      if (e.key === " " || e.key === "Shift") inputRef.current.boost = true;
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
      // Normalize diagonal
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
      // Pause input when tab hidden
      if (document.hidden) {
        inputRef.current.x = 0;
        inputRef.current.y = 0;
        inputRef.current.boost = false;
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-rush-sky">
      {/* 3D Canvas */}
      <City
        avatar={profile.avatar}
        quality={profile.graphicsQuality}
        riding={riding}
        inputRef={inputRef}
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
            onHorn={() => {
              // Phase 2: hook into horn sound
            }}
            onBoost={(active) => { inputRef.current.boost = active; }}
            onEmote={() => { /* Phase 3 */ }}
            onOpenPlace={(id) => {
              if (id === "race-track") {
                // Phase 2: open Phaser race game
              }
            }}
            onOpenMenu={() => { /* Phase 4: settings sheet */ }}
            onOpenNotifications={() => { /* Phase 3: notifications */ }}
          />
          <Joystick inputRef={inputRef} />
        </>
      )}
    </div>
  );
}
