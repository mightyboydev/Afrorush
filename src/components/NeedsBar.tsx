"use client";

// src/components/NeedsBar.tsx — Compact life-sim need rings.
// Tight horizontal row of circular icons with thin SVG progress rings,
// inspired by Lagos Life. Sits under the character, doesn't dominate the screen.

import type { PlayerProfile } from "@/lib/storage";

const NEEDS = [
  { key: "food" as const, icon: "🍽️", color: "#ff6a1a" },
  { key: "energy" as const, icon: "⚡", color: "#ffc531" },
  { key: "fun" as const, icon: "🎉", color: "#7c3aed" },
  { key: "social" as const, icon: "💬", color: "#16a3b1" },
  { key: "hygiene" as const, icon: "🚿", color: "#1fb86f" },
  { key: "toilet" as const, icon: "🚽", color: "#0ea5e9" },
];

// SVG ring constants
const RADIUS = 14;
const CIRC = 2 * Math.PI * RADIUS;

export default function NeedsBar({ profile }: { profile: PlayerProfile }) {
  const needs = profile.needs ?? {
    food: 80, energy: 80, fun: 80, social: 80, hygiene: 80, toilet: 80,
  };

  return (
    <div className="flex items-center justify-between gap-1 rounded-2xl bg-white/65 px-2 py-1.5 backdrop-blur-md">
      {NEEDS.map((n) => {
        const val = Math.max(0, Math.min(100, Math.round(needs[n.key] ?? 80)));
        const isLow = val < 30;
        const color = isLow ? "#ef4444" : n.color;
        const offset = CIRC - (val / 100) * CIRC;
        return (
          <div key={n.key} className="flex flex-col items-center gap-0.5">
            <div className="relative h-9 w-9">
              <svg
                viewBox="0 0 36 36"
                className="h-full w-full -rotate-90"
                aria-hidden="true"
              >
                {/* Track */}
                <circle
                  cx="18"
                  cy="18"
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(20,33,61,0.12)"
                  strokeWidth="2.5"
                />
                {/* Progress */}
                <circle
                  cx="18"
                  cy="18"
                  r={RADIUS}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 0.4s ease-out, stroke 0.3s" }}
                />
              </svg>
              {/* Icon centered on top of ring */}
              <div className="absolute inset-0 flex items-center justify-center text-[13px] leading-none">
                <span>{n.icon}</span>
              </div>
              {/* Pulse ring when low */}
              {isLow && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: `0 0 0 2px ${color}33`,
                    animation: "rush-pulse 1.6s ease-in-out infinite",
                  }}
                />
              )}
            </div>
            <span
              className={`text-[8px] font-bold ${isLow ? "text-red-500" : "text-rush-navy/55"}`}
            >
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}
