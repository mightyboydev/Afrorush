"use client";

// src/components/NeedsBar.tsx — Compact life-sim need rings with SVG icons.
// No emoji — uses custom AfroRush SVG icons from ui/icons.tsx.

import type { PlayerProfile } from "@/lib/storage";
import { FoodIcon, EnergyIcon, FunIcon, SocialIcon, HygieneIcon, ToiletIcon } from "@/ui/icons";

const NEEDS = [
  { key: "food" as const, Icon: FoodIcon, color: "#c87f3f" },
  { key: "energy" as const, Icon: EnergyIcon, color: "#d4a017" },
  { key: "fun" as const, Icon: FunIcon, color: "#7c3aed" },
  { key: "social" as const, Icon: SocialIcon, color: "#1e3a8a" },
  { key: "hygiene" as const, Icon: HygieneIcon, color: "#0d7c4a" },
  { key: "toilet" as const, Icon: ToiletIcon, color: "#2f7de1" },
];

const RADIUS = 14;
const CIRC = 2 * Math.PI * RADIUS;

export default function NeedsBar({ profile }: { profile: PlayerProfile }) {
  const needs = profile.needs ?? {
    food: 80, energy: 80, fun: 80, social: 80, hygiene: 80, toilet: 80,
  };

  return (
    <div
      className="flex items-center justify-between gap-1 rounded-2xl px-2 py-1.5"
      style={{
        background: "rgba(40, 24, 50, 0.65)",
        backdropFilter: "blur(12px) saturate(1.6)",
        WebkitBackdropFilter: "blur(12px) saturate(1.6)",
        border: "1px solid rgba(245, 234, 208, 0.12)",
        boxShadow: "inset 0 1px 0 rgba(245, 234, 208, 0.15), 0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      {NEEDS.map((n) => {
        const val = Math.max(0, Math.min(100, Math.round(needs[n.key] ?? 80)));
        const isLow = val < 30;
        const color = isLow ? "#c8463d" : n.color;
        const offset = CIRC - (val / 100) * CIRC;
        return (
          <div key={n.key} className="flex flex-col items-center gap-0.5">
            <div className="relative h-9 w-9">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="rgba(245,234,208,0.10)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r={RADIUS} fill="none"
                  stroke={color} strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 0.4s ease-out, stroke 0.3s", filter: `drop-shadow(0 0 3px ${color}88)` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-rush-ink">
                <n.Icon size={13} />
              </div>
            </div>
            <span className={`text-[8px] font-bold tabular-nums ${isLow ? "text-rush-rose" : "text-rush-ink-soft"}`}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}
