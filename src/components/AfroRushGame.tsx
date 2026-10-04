"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Phaser from "phaser";
import AfroRushScene, {
  type HudState,
  type RaceResult,
  type RaceConfig,
} from "@/game/AfroRushScene";
import {
  getItem,
  type Loadout,
  type RaceMode,
} from "@/lib/storage";

export interface AfroRushGameProps {
  mode: RaceMode;
  loadout: Loadout;
  soundOn: boolean;
  bikeColorFallback?: string;
  outfitColorFallback?: string;
  exhaustColorFallback?: string;
  onExit: () => void;
  onFinish: (result: RaceResult) => void;
}

export default function AfroRushGame({
  mode,
  loadout,
  soundOn,
  bikeColorFallback = "#d2601a",
  outfitColorFallback = "#f5f5f5",
  exhaustColorFallback = "#9ca3af",
  onExit,
  onFinish,
}: AfroRushGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<AfroRushScene | null>(null);
  const onFinishRef = useRef(onFinish);

  const [hud, setHud] = useState<HudState | null>(null);
  const [banner, setBanner] = useState<{ text: string; color: string; id: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const bannerIdRef = useRef(0);

  // Keep latest onFinish in a ref without touching it during render.
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const sendControl = useCallback(
    (name: "left" | "right" | "boost" | "brake", pressed: boolean) => {
      sceneRef.current?.setControl(name, pressed);
    },
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const bike = getItem(loadout.bikeId);
    const outfit = getItem(loadout.outfitId);
    const exhaust = getItem(loadout.exhaustId);

    const bikeColor = bike?.color ?? bikeColorFallback;
    const outfitColor = outfit?.color ?? outfitColorFallback;
    const exhaustColor = exhaust?.color ?? exhaustColorFallback;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#120716",
      pixelArt: false,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: "100%",
        height: "100%",
      },
      physics: {
        default: "arcade",
        arcade: { debug: false, gravity: { x: 0, y: 0 } },
      },
      // No scenes in initial list — we add and start the scene
      // manually with init data, so init() never runs with undefined.
      scene: [],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const raceConfig: RaceConfig = {
      mode,
      loadout,
      bikeColor,
      outfitColor,
      exhaustColor,
      soundOn,
      onHud: (h) => setHud(h),
      onBanner: (text, color) => {
        bannerIdRef.current++;
        setBanner({ text, color: color ?? "#ffffff", id: bannerIdRef.current });
      },
      onEnd: (result) => onFinishRef.current(result),
    };

    // Add the scene with init data + autoStart. Phaser boots asynchronously,
    // but scene.add is safe to call here — the scene will start on the next
    // animation frame after the game finishes bootstrapping.
    game.scene.add("afrorush", AfroRushScene, true, raceConfig);
    sceneRef.current = game.scene.getScene("afrorush") as AfroRushScene;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [mode, loadout, soundOn, bikeColorFallback, outfitColorFallback, exhaustColorFallback]);

  // Banner auto-clear
  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 1100);
    return () => clearTimeout(id);
  }, [banner]);

  const togglePause = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (paused) {
      scene.scene.resume();
      setPaused(false);
    } else {
      scene.scene.pause();
      setPaused(true);
    }
  };

  const handleQuit = () => {
    sceneRef.current?.quit();
    onExit();
  };

  // Touch button helpers
  const press = (name: "left" | "right" | "boost" | "brake") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      sendControl(name, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      sendControl(name, false);
    },
    onPointerLeave: () => sendControl(name, false),
    onPointerCancel: () => sendControl(name, false),
  });

  const nitroPct = Math.round((hud?.nitro ?? 1) * 100);
  const goalPct = Math.round((hud?.goalProgress ?? 0) * 100);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#120716] select-none">
      <div ref={containerRef} className="phaser-wrap absolute inset-0" />

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-stretch gap-2">
          {/* Speed */}
          <div className="flex-1 rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Speed</div>
            <div className="font-mono text-xl font-bold text-rush-flame tabular-nums sm:text-2xl">
              {hud?.speedKmh ?? 0}
              <span className="ml-1 text-[10px] text-white/60">km/h</span>
            </div>
          </div>
          {/* Score */}
          <div className="flex-1 rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Score</div>
            <div className="font-mono text-xl font-bold text-rush-gold tabular-nums sm:text-2xl">
              {(hud?.score ?? 0).toLocaleString()}
            </div>
          </div>
          {/* Distance */}
          <div className="flex-1 rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Dist</div>
            <div className="font-mono text-xl font-bold text-white tabular-nums sm:text-2xl">
              {hud?.distance ?? 0}
              <span className="ml-1 text-[10px] text-white/60">m</span>
            </div>
          </div>
        </div>

        {/* Secondary HUD row */}
        <div className="mx-auto mt-2 flex max-w-3xl items-center gap-2">
          {/* Nitro bar */}
          <div className="flex-1 rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
              <span>Nitro</span>
              <span className="text-rush-jade">{nitroPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rush-jade to-rush-flame transition-[width] duration-100"
                style={{ width: `${nitroPct}%` }}
              />
            </div>
          </div>
          {/* Goal bar */}
          {mode !== "freestyle-run" && (
            <div className="flex-1 rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
                <span>
                  {mode === "police-chase" ? "Survive" : mode === "delivery-rush" ? "Delivery" : "Goal"}
                </span>
                <span className="text-rush-gold">
                  {mode === "police-chase"
                    ? `${hud?.chaseTime ?? 60}s`
                    : mode === "delivery-rush"
                      ? `${hud?.packages ?? 0}/${hud?.packagesTarget ?? 6}`
                      : `${goalPct}%`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rush-gold to-rush-flame transition-[width] duration-200"
                  style={{
                    width: `${
                      mode === "police-chase"
                        ? Math.max(0, ((hud?.chaseTime ?? 60) / 60) * 100)
                        : goalPct
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
          {/* Combo */}
          {hud && hud.combo > 1 && (
            <div className="rounded-lg bg-rush-magenta/80 px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-widest text-white/80">Combo</div>
              <div className="font-mono text-xl font-bold text-white">x{hud.combo}</div>
            </div>
          )}
        </div>
      </div>

      {/* Top-right controls */}
      <div className="absolute right-3 top-3 z-30 flex gap-2 sm:right-4 sm:top-4">
        <button
          onClick={togglePause}
          className="pointer-events-auto touch-btn rounded-full bg-black/55 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm hover:bg-black/70"
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <button
          onClick={() => setShowQuit(true)}
          className="pointer-events-auto touch-btn rounded-full bg-black/55 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm hover:bg-rush-flame/70"
        >
          Exit
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center">
          <div
            className="rounded-lg bg-black/40 px-6 py-3 text-2xl font-black uppercase tracking-wider text-stroke backdrop-blur-sm sm:text-4xl"
            style={{ color: banner.color }}
            key={banner.id}
          >
            {banner.text}
          </div>
        </div>
      )}

      {/* Active event indicator */}
      {hud?.event && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-30 -translate-x-1/2">
          <div className="rounded-full bg-rush-flame/90 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
            ⚡ {hud.event}
          </div>
        </div>
      )}

      {/* Countdown overlay */}
      {hud && hud.countdown !== null && hud.countdown > 0 && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="text-8xl font-black text-rush-gold text-stroke sm:text-9xl">
            {hud.countdown}
          </div>
        </div>
      )}

      {/* Touch controls — always show on small screens, optional on desktop */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-end justify-between gap-3">
          {/* Left/Right cluster */}
          <div className="flex gap-2">
            <button
              {...press("left")}
              className="touch-btn pointer-events-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black text-white backdrop-blur-md active:bg-rush-flame/70 sm:h-14 sm:w-14"
              aria-label="Steer left"
            >
              ◀
            </button>
            <button
              {...press("right")}
              className="touch-btn pointer-events-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black text-white backdrop-blur-md active:bg-rush-flame/70 sm:h-14 sm:w-14"
              aria-label="Steer right"
            >
              ▶
            </button>
          </div>

          {/* Boost & Brake cluster */}
          <div className="flex flex-col items-end gap-2">
            <button
              {...press("brake")}
              className="touch-btn pointer-events-auto flex h-12 w-24 items-center justify-center rounded-2xl bg-white/15 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md active:bg-rush-magenta/70"
              aria-label="Brake"
            >
              Brake
            </button>
            <button
              {...press("boost")}
              className="touch-btn pointer-events-auto flex h-20 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-rush-flame to-rush-gold text-base font-black uppercase tracking-widest text-white shadow-lg shadow-rush-flame/30 active:scale-95 sm:h-16 sm:w-28"
              aria-label="Boost"
            >
              ⚡ Boost
            </button>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-md">
          <div className="text-4xl font-black uppercase tracking-widest text-rush-gold text-stroke">
            Paused
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={togglePause}
              className="rounded-xl bg-rush-jade px-8 py-3 text-sm font-bold uppercase tracking-widest text-white hover:opacity-90"
            >
              Resume
            </button>
            <button
              onClick={() => setShowQuit(true)}
              className="rounded-xl bg-rush-flame px-8 py-3 text-sm font-bold uppercase tracking-widest text-white hover:opacity-90"
            >
              Quit Race
            </button>
          </div>
          <div className="mt-4 text-center text-xs text-white/50">
            Keyboard: ←/→ steer · ↑/Space boost · Shift brake · P pause · H horn
          </div>
        </div>
      )}

      {/* Quit confirm modal */}
      {showQuit && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
            <div className="text-lg font-bold text-foreground">Quit this race?</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Your run will end here. Progress from this race will be saved.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowQuit(false)}
                className="flex-1 rounded-xl bg-muted px-4 py-2 text-sm font-bold uppercase tracking-widest text-foreground hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={handleQuit}
                className="flex-1 rounded-xl bg-rush-flame px-4 py-2 text-sm font-bold uppercase tracking-widest text-white hover:opacity-90"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
