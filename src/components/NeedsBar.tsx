"use client";

// src/components/NeedsBar.tsx — Compact life-sim need bars.
// Semi-transparent so the 3D room shows through.

import type { PlayerProfile } from "@/lib/storage";

const NEEDS = [
  { key: "food" as const, label: "Food", icon: "🍽️", color: "#ff6a1a" },
  { key: "energy" as const, label: "Energy", icon: "⚡", color: "#ffc531" },
  { key: "fun" as const, label: "Fun", icon: "🎉", color: "#7c3aed" },
  { key: "social" as const, label: "Social", icon: "💬", color: "#16a3b1" },
  { key: "hygiene" as const, label: "Wash", icon: "🚿", color: "#1fb86f" },
  { key: "toilet" as const, label: "WC", icon: "🚽", color: "#0ea5e9" },
];

export default function NeedsBar({ profile }: { profile: PlayerProfile }) {
  const needs = profile.needs ?? { food: 80, energy: 80, fun: 80, social: 80, hygiene: 80, toilet: 80 };

  return (
    <div className="rounded-2xl bg-white/60 p-2.5 backdrop-blur-md">
      <div className="grid grid-cols-6 gap-1.5">
        {NEEDS.map((n) => {
          const val = Math.round(needs[n.key] ?? 80);
          const isLow = val < 30;
          return (
            <div key={n.key} className="flex flex-col items-center gap-0.5">
              <span className="text-xs">{n.icon}</span>
              <div className="h-1 w-full overflow-hidden rounded-full bg-rush-cream">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${val}%`, background: isLow ? "#ef4444" : n.color }}
                />
              </div>
              <span className={`text-[7px] font-bold ${isLow ? "text-red-500" : "text-rush-navy/40"}`}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
