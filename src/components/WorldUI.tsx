"use client";

// src/components/WorldUI.tsx — overlay HUD for the 3D world.
// Top bar (avatar, level, rep, Naira, gold, bell) + place pills on the city.
// Bottom action buttons (interact, ride, horn, boost, emote).

import { useState } from "react";
import {
  levelFromRep,
  nextRepTarget,
  levelTitle,
  formatNaira,
  DISTRICTS,
  type PlayerProfile,
} from "@/lib/storage";

export interface WorldUIProps {
  profile: PlayerProfile;
  riding: boolean;
  onToggleRide: () => void;
  onHorn: () => void;
  onBoost: (active: boolean) => void;
  onEmote: (emote: string) => void;
  onOpenPlace: (id: string) => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
}

export default function WorldUI({
  profile,
  riding,
  onToggleRide,
  onHorn,
  onBoost,
  onEmote,
  onOpenPlace,
  onOpenMenu,
  onOpenNotifications,
}: WorldUIProps) {
  const lvl = levelFromRep(profile.rep);
  const next = nextRepTarget(profile.rep);
  const base = Math.pow(lvl - 1, 2) * 100;
  const pct = Math.min(100, ((profile.rep - base) / (next - base)) * 100);
  const [showEmotes, setShowEmotes] = useState(false);
  const [boostHeld, setBoostHeld] = useState(false);

  const handleBoostDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setBoostHeld(true);
    onBoost(true);
  };
  const handleBoostUp = (e: React.PointerEvent) => {
    e.preventDefault();
    setBoostHeld(false);
    onBoost(false);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between safe-pt safe-pb">
      {/* ---------- Top bar ---------- */}
      <div className="pointer-events-auto flex items-center justify-between gap-2 px-3 py-2">
        {/* Avatar + level + rep bar */}
        <button
          onClick={onOpenMenu}
          className="flex items-center gap-2 rounded-full bg-white/95 px-2 py-1.5 rush-soft-shadow"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: profile.avatar?.skinTone ?? "#c68642" }}
          >
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="pr-1 text-left">
            <div className="text-[10px] font-bold leading-tight text-rush-navy">{profile.username}</div>
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/60">
              {levelTitle(lvl)} · Lvl {lvl}
            </div>
          </div>
        </button>

        {/* Rep progress (center, expands on desktop) */}
        <div className="hidden flex-1 max-w-[200px] sm:block">
          <div className="rounded-full bg-white/95 px-3 py-1.5 rush-soft-shadow">
            <div className="mb-0.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-rush-navy/60">
              <span>Rep</span>
              <span>{profile.rep.toLocaleString()} / {next.toLocaleString()}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-rush-cream">
              <div className="h-full rush-gradient rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Naira + Gold */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 rush-soft-shadow">
            <span className="text-xs">💵</span>
            <span className="text-xs font-bold text-rush-navy">{formatNaira(profile.cash)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 rush-soft-shadow">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-bold text-rush-navy">{profile.gold}</span>
          </div>
          <button
            onClick={onOpenNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/95 rush-soft-shadow"
            aria-label="Notifications"
          >
            <span className="text-base">🔔</span>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rush-orange rush-pulse" />
          </button>
        </div>
      </div>

      {/* ---------- Place pills (center, floating over the 3D world) ---------- */}
      <div className="pointer-events-none flex-1 px-4">
        <div className="relative mx-auto h-full max-w-md">
          {/* Visible place pills — only a few are shown initially */}
          {DISTRICTS.slice(0, 4).map((d, i) => {
            const positions = [
              { top: "8%", left: "0%" },
              { top: "20%", right: "0%" },
              { top: "55%", left: "0%" },
              { top: "70%", right: "5%" },
            ];
            const p = positions[i];
            return (
              <button
                key={d.id}
                onClick={() => onOpenPlace(d.id)}
                className="rush-pill rush-float pointer-events-auto absolute flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-bold text-rush-navy"
                style={{ ...p, animationDelay: `${i * 0.5}s` }}
              >
                <span className="text-base">{d.emoji}</span>
                <span style={{ color: d.color }}>{d.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Bottom action buttons ---------- */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-30 flex flex-col gap-2">
        {/* Emote wheel toggle */}
        {showEmotes && (
          <div className="pointer-events-auto mb-2 flex gap-1.5">
            {["👋", "🎉", "🕺", " horns"].map((e, i) => (
              <button
                key={i}
                onClick={() => {
                  onEmote(e.trim());
                  setShowEmotes(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg rush-soft-shadow"
              >
                {e.trim()}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowEmotes((s) => !s)}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-xl rush-soft-shadow"
          aria-label="Emotes"
        >
          😊
        </button>

        <button
          onClick={onHorn}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-xl rush-soft-shadow"
          aria-label="Horn"
        >
          📣
        </button>

        <button
          onClick={onToggleRide}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl rush-soft-shadow transition-all ${
            riding ? "bg-rush-orange text-white" : "bg-white/95"
          }`}
          aria-label={riding ? "Hop off bike" : "Hop on bike"}
        >
          {riding ? "🛑" : "🏍️"}
        </button>

        <button
          onPointerDown={handleBoostDown}
          onPointerUp={handleBoostUp}
          onPointerCancel={handleBoostUp}
          onPointerLeave={handleBoostUp}
          className={`pointer-events-auto flex h-16 w-16 touch-none items-center justify-center rounded-full text-2xl transition-all ${
            boostHeld ? "scale-95 bg-rush-gold text-white" : "bg-rush-green text-white"
          }`}
          style={{ touchAction: "none" }}
          aria-label="Boost"
        >
          ⚡
        </button>
      </div>

      {/* ---------- Riding indicator ---------- */}
      {riding && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-rush-orange px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white rush-soft-shadow">
            🏍️ Riding
          </div>
        </div>
      )}
    </div>
  );
}
