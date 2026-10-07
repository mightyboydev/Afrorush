"use client";

// src/components/MultiplayerRace.tsx — Serverless multiplayer race on canvas.
// Each player writes their own `players[uid]` sub-object to Firestore
// (throttled to ~12 writes/sec), and listens via onSnapshot for opponents.
// 3-lane runner: arrow keys / swipe to change lane, space / tap to jump.
// Nigerian street identity: okada riders weaving through traffic, with
// danfo buses, agberos, suya carts, and pure-water sellers as obstacles.

import { useEffect, useRef, useState, useCallback } from "react";
import {
  subscribeToRaceRoom,
  updateRacePlayerState,
  leaveRaceRoom,
  startRaceRoom,
  type RaceRoom,
  type RaceRoomPlayer,
} from "@/lib/firestore";
import { callRaceApi } from "@/systems/economy";
import type { PlayerProfile } from "@/lib/storage";

export interface MultiplayerRaceProps {
  roomCode: string;
  profile: PlayerProfile;
  onExit: () => void;
}

// Obstacle types — Lagos-flavoured
type ObstacleType = "danfo" | "agbero" | "pothole" | "suya_cart" | "pure_water";
interface Obstacle {
  lane: number;
  y: number;       // world Y position (negative = further away from player)
  type: ObstacleType;
  hit: boolean;
}

// Track themes
const TRACK_THEMES: Record<RaceRoom["track_theme"], { name: string; bg: string; lane: string; accent: string }> = {
  third_mainland: { name: "Third Mainland Bridge", bg: "#0c1e3e", lane: "#1e3a5f", accent: "#ffc531" },
  ikeja_traffic: { name: "Ikeja Traffic", bg: "#2d2415", lane: "#5a4828", accent: "#ff6a1a" },
  vi_beach: { name: "V/I Beach Road", bg: "#0d3b3e", lane: "#1a5256", accent: "#1fb86f" },
};

const TARGET_DISTANCE = 2000; // first to 2000m wins

export default function MultiplayerRace({ roomCode, profile, onExit }: MultiplayerRaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [room, setRoom] = useState<RaceRoom | null>(null);
  const [eliminated, setEliminated] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalPlace, setFinalPlace] = useState<number | null>(null);

  // Local player state — kept in a ref so the animation loop reads/writes
  // without re-rendering React.
  const playerState = useRef({
    lane: 1,
    distance: 0,
    speed: 6,
    yOffset: 0,
    isJumping: false,
    jumpVelocity: 0,
  });

  // Obstacles — generated locally per-player (so each player has their own
  // challenge; sync would be too bandwidth-heavy at this scale).
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextObstacleY = useRef(-200);
  const tickCount = useRef(0);
  const startTime = useRef<number | null>(null);
  const isHost = room?.host_uid === profile.uid;

  // Subscribe to room state
  useEffect(() => {
    const unsub = subscribeToRaceRoom(roomCode, (r) => setRoom(r));
    return () => unsub();
  }, [roomCode]);

  // Cleanup on unmount: leave the room
  useEffect(() => {
    return () => {
      leaveRaceRoom(roomCode, profile.uid, isHost).catch(() => {});
    };
  }, [roomCode, profile.uid, isHost]);

  // Input handlers — keyboard
  const handleInput = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" && playerState.current.lane > 0) {
      playerState.current.lane -= 1;
    } else if (e.key === "ArrowRight" && playerState.current.lane < 2) {
      playerState.current.lane += 1;
    } else if ((e.key === " " || e.key === "ArrowUp") && !playerState.current.isJumping) {
      playerState.current.isJumping = true;
      playerState.current.jumpVelocity = 14;
    }
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleInput);
    return () => window.removeEventListener("keydown", handleInput);
  }, [handleInput]);

  // Touch handlers — swipe left/right to change lane, tap to jump
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const elapsed = Date.now() - touchStart.current.time;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      // Swipe
      if (dx < 0 && playerState.current.lane > 0) playerState.current.lane -= 1;
      else if (dx > 0 && playerState.current.lane < 2) playerState.current.lane += 1;
    } else if (elapsed < 200 && Math.abs(dx) < 30 && Math.abs(dy) < 30) {
      // Tap → jump
      if (!playerState.current.isJumping) {
        playerState.current.isJumping = true;
        playerState.current.jumpVelocity = 14;
      }
    }
    touchStart.current = null;
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frameId: number;

    const theme = TRACK_THEMES[room?.track_theme ?? "third_mainland"];

    const loop = () => {
      // Only run physics if race has started
      if (room?.room_status !== "racing" || eliminated || finished) {
        // Still render the waiting / finished state
        renderWaiting(ctx, canvas, theme, room);
        frameId = requestAnimationFrame(loop);
        return;
      }

      if (startTime.current === null) startTime.current = Date.now();

      // === PHYSICS ===
      // Increase speed slowly over time (Lagos traffic intensifies)
      playerState.current.speed = Math.min(12, playerState.current.speed + 0.001);
      playerState.current.distance += playerState.current.speed * 0.06;

      // Jump physics
      if (playerState.current.isJumping) {
        playerState.current.yOffset += playerState.current.jumpVelocity;
        playerState.current.jumpVelocity -= 0.8;
        if (playerState.current.yOffset <= 0) {
          playerState.current.yOffset = 0;
          playerState.current.isJumping = false;
        }
      }

      // === OBSTACLES ===
      // Spawn new obstacles ahead of player
      const playerScreenY = canvas.height - 120 - playerState.current.yOffset;
      while (nextObstacleY.current > playerState.current.distance - 800) {
        const types: ObstacleType[] = ["danfo", "agbero", "pothole", "suya_cart", "pure_water"];
        obstaclesRef.current.push({
          lane: Math.floor(Math.random() * 3),
          y: nextObstacleY.current,
          type: types[Math.floor(Math.random() * types.length)],
          hit: false,
        });
        nextObstacleY.current -= 100 + Math.random() * 100;
      }

      // Check collisions (only when not jumping over pothole/suya_cart)
      for (const obs of obstaclesRef.current) {
        if (obs.hit) continue;
        const obsScreenY = canvas.height - ((obs.y - playerState.current.distance) * -1) - 80;
        // Close to player?
        if (Math.abs(obsScreenY - playerScreenY) < 50 && obs.lane === playerState.current.lane) {
          // Potholes and suya carts can be jumped over
          const jumpable = obs.type === "pothole" || obs.type === "suya_cart" || obs.type === "pure_water";
          if (jumpable && playerState.current.yOffset > 20) continue;
          obs.hit = true;
          // Collision — slow player down (don't eliminate, that's harsh)
          playerState.current.speed = Math.max(3, playerState.current.speed - 1.5);
        }
      }

      // Cleanup old obstacles
      obstaclesRef.current = obstaclesRef.current.filter(
        (o) => o.y < playerState.current.distance + 200
      );

      // === RENDER ===
      render(ctx, canvas, theme, room!);

      // Check finish
      if (playerState.current.distance >= TARGET_DISTANCE && !finished) {
        setFinished(true);
        // Compute placement based on opponents
        const opps = Object.entries(room?.players ?? {})
          .filter(([id]) => id !== profile.uid)
          .map(([_, p]) => p.distance);
        const place = 1 + opps.filter((d) => d >= TARGET_DISTANCE).length;
        setFinalPlace(place);
        // Mark finished in Firestore
        updateRacePlayerState(roomCode, profile.uid, {
          finished: true,
          distance: playerState.current.distance,
          lane: playerState.current.lane,
          yOffset: playerState.current.yOffset,
          isJumping: playerState.current.isJumping,
          isEliminated: false,
          lastUpdated: Date.now(),
        }).catch(() => {});
        // Call server API to claim race reward (server computes cash + rep)
        callRaceApi(playerState.current.distance, 0, place, "multiplayer").catch(() => {});
      }

      // === THROTTLED FIRESTORE WRITE (1 write per 5 frames ≈ 12 writes/sec) ===
      tickCount.current++;
      if (tickCount.current >= 5 && !finished) {
        tickCount.current = 0;
        updateRacePlayerState(roomCode, profile.uid, {
          lane: playerState.current.lane,
          distance: playerState.current.distance,
          speed: playerState.current.speed,
          isJumping: playerState.current.isJumping,
          yOffset: playerState.current.yOffset,
          isEliminated: false,
          finished: false,
          lastUpdated: Date.now(),
        }).catch(() => {});
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [room, roomCode, profile.uid, eliminated, finished]);

  // === RENDER FUNCTIONS ===
  function render(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    theme: typeof TRACK_THEMES[keyof typeof TRACK_THEMES],
    currentRoom: RaceRoom
  ) {
    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lane lines
    const laneW = canvas.width / 3;
    ctx.strokeStyle = theme.lane;
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * laneW, 0);
      ctx.lineTo(i * laneW, canvas.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw obstacles (relative to player's distance)
    for (const obs of obstaclesRef.current) {
      const obsScreenY = canvas.height - ((obs.y - playerState.current.distance) * -1) - 80;
      if (obsScreenY < -100 || obsScreenY > canvas.height + 100) continue;
      if (obs.hit) continue;
      drawObstacle(ctx, obs.type, obs.lane * laneW + laneW / 2, obsScreenY);
    }

    // Draw opponents (relative to player)
    const opponents = Object.entries(currentRoom.players).filter(([id]) => id !== profile.uid);
    for (const [_, opp] of opponents) {
      const relativeY = canvas.height - (opp.distance - playerState.current.distance) - 120 - opp.yOffset;
      if (relativeY < -100 || relativeY > canvas.height + 100) continue;
      const oppX = opp.lane * laneW + laneW / 2 - 22;
      drawOkada(ctx, oppX, relativeY, "#EF4444", opp.username);
    }

    // Draw self (player's okada)
    const myX = playerState.current.lane * laneW + laneW / 2 - 22;
    const myY = canvas.height - 120 - playerState.current.yOffset;
    drawOkada(ctx, myX, myY, "#1fb86f", profile.username);
  }

  function renderWaiting(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    theme: typeof TRACK_THEMES[keyof typeof TRACK_THEMES],
    currentRoom: RaceRoom | null
  ) {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    if (!currentRoom) {
      ctx.fillText("Connecting to room…", canvas.width / 2, canvas.height / 2);
      return;
    }
    if (currentRoom.room_status === "lobby") {
      ctx.fillText("Waiting for host to start…", canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = "12px sans-serif";
      ctx.fillText(`${Object.keys(currentRoom.players).length} player(s) in room`, canvas.width / 2, canvas.height / 2 + 10);
    } else if (currentRoom.room_status === "finished") {
      ctx.fillText("Race finished!", canvas.width / 2, canvas.height / 2);
    }
  }

  function drawOkada(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 44, 28);
    // Seat (smaller box on top)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 6, y + 4, 32, 8);
    // Wheel hint (small dark rect below)
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 4, y + 28, 6, 4);
    ctx.fillRect(x + 34, y + 28, 6, 4);
    // Label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label.slice(0, 12), x + 22, y - 6);
  }

  function drawObstacle(ctx: CanvasRenderingContext2D, type: ObstacleType, x: number, y: number) {
    ctx.textAlign = "center";
    switch (type) {
      case "danfo":
        ctx.fillStyle = "#ffc531"; // yellow danfo
        ctx.fillRect(x - 28, y - 10, 56, 40);
        ctx.fillStyle = "#000";
        ctx.fillRect(x - 24, y - 6, 48, 6); // windscreen stripe
        ctx.font = "10px sans-serif";
        ctx.fillText("DANFO", x, y + 18);
        break;
      case "agbero":
        ctx.font = "28px sans-serif";
        ctx.fillText("🧍", x, y + 10);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText("AGBERO", x, y + 22);
        break;
      case "pothole":
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(x, y + 10, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "suya_cart":
        ctx.font = "24px sans-serif";
        ctx.fillText("🍢", x, y + 10);
        break;
      case "pure_water":
        ctx.font = "22px sans-serif";
        ctx.fillText("💧", x, y + 10);
        break;
    }
  }

  // === UI overlays ===
  const playerCount = Object.keys(room?.players ?? {}).length;
  const myDistance = Math.floor(playerState.current.distance);
  const progress = Math.min(100, (myDistance / TARGET_DISTANCE) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950 p-4">
      {/* Top bar — room code, track name, exit */}
      <div className="mb-3 flex w-full max-w-md items-center justify-between gap-2">
        <button onClick={onExit} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white active:scale-95">
          ← Exit
        </button>
        <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-emerald-400">
          ROOM: <span className="font-mono tracking-widest">{roomCode}</span>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white">
          {playerCount} 👥
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-emerald-400 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Track label */}
      <div className="mb-2 text-[10px] uppercase tracking-widest text-white/50">
        {TRACK_THEMES[room?.track_theme ?? "third_mainland"].name} · {myDistance}m / {TARGET_DISTANCE}m
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={360}
        height={520}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="rounded-xl border border-slate-700 shadow-inner"
        style={{ touchAction: "none", maxWidth: "100%" }}
      />

      {/* Controls hint */}
      <div className="mt-3 text-center text-[10px] text-white/50">
        ← → arrows or swipe to change lane · Space / tap to jump (jump over potholes, suya carts, pure water)
      </div>

      {/* Host controls */}
      {isHost && room?.room_status === "lobby" && (
        <button
          onClick={() => startRaceRoom(roomCode, profile.uid).catch(() => {})}
          className="mt-4 rounded-2xl bg-rush-green px-8 py-3 text-sm font-bold uppercase tracking-wider text-white active:scale-95"
        >
          🏁 Start Race ({playerCount} player{playerCount !== 1 ? "s" : ""})
        </button>
      )}

      {/* Finished overlay */}
      {finished && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-4">
          <div className="rush-card w-full max-w-sm p-6 text-center">
            <div className="mb-2 text-5xl">{finalPlace === 1 ? "🏆" : finalPlace === 2 ? "🥈" : "🥉"}</div>
            <h2 className="font-display text-2xl text-rush-ink">
              {finalPlace === 1 ? "You win!" : `You finish #${finalPlace}`}
            </h2>
            <p className="mt-2 text-xs text-rush-ink/60">
              Distance: {myDistance}m · +₦{finalPlace === 1 ? 1000 : finalPlace === 2 ? 500 : 250} · +{finalPlace === 1 ? 50 : 25} rep
            </p>
            <button
              onClick={onExit}
              className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
