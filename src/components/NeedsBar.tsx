"use client";

// src/components/NeedsBar.tsx — Six life-sim need bars (food, energy, fun,
// social, hygiene, toilet). Compact horizontal bar with icon + color.

import type { PlayerProfile } from "@/lib/storage";

const NEEDS = [
  { key: "food" as const, label: "Food", icon: "🍽️", color: "#ff6a1a" },
  { key: "energy" as const, label: "Energy", icon: "⚡", color: "#ffc531" },
  { key: "fun" as const, label: "Fun", icon: "🎉", color: "#7c3aed" },
  { key: "social" as const, label: "Social", icon: "💬", color: "#16a3b1" },
  { key: "hygiene" as const, label: "Hygiene", icon: "🚿", color: "#1fb86f" },
  { key: "toilet" as const, label: "Toilet", icon: "🚽", color: "#0ea5e9" },
];

export default function NeedsBar({ profile }: { profile: PlayerProfile }) {
  const needs = profile.needs ?? { food: 80, energy: 80, fun: 80, social: 80, hygiene: 80, toilet: 80 };

  return (
    <div className="rounded-3xl rush-glass p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-rush-navy/50">Needs</span>
        <span className="text-[9px] text-rush-navy/30">Low bars reduce earnings</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {NEEDS.map((n) => {
          const val = Math.round(needs[n.key] ?? 80);
          const isLow = val < 30;
          return (
            <div key={n.key} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <span className="text-xs">{n.icon}</span>
                <span className={`text-[8px] font-bold uppercase ${isLow ? "text-red-500" : "text-rush-navy/40"}`}>{n.label}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-rush-cream">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${val}%`, background: isLow ? "#ef4444" : n.color }}
                />
              </div>
              <span className={`text-[8px] font-bold ${isLow ? "text-red-500" : "text-rush-navy/40"}`}>{val}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
