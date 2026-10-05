"use client";

// src/components/MissionTracker.tsx — quest tracker overlay (top-right).

import { useState, useEffect } from "react";

export interface Mission {
  id: string;
  title: string;
  desc: string;
  progress: number; // 0..1
  reward: number;
}

export default function MissionTracker({ missions }: { missions: Mission[] }) {
  const [minimized, setMinimized] = useState(false);

  if (missions.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute right-3 top-24 z-20 w-56 sm:right-4 sm:top-28">
      <div className="rush-card overflow-hidden">
        <button
          onClick={() => setMinimized(!minimized)}
          className="flex w-full items-center justify-between px-3 py-2"
        >
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rush-navy">
            📋 Missions
          </span>
          <span className="text-xs text-rush-navy/50">{minimized ? "▼" : "▲"}</span>
        </button>
        {!minimized && (
          <div className="space-y-2 px-3 pb-3">
            {missions.map((m) => (
              <div key={m.id} className="rounded-2xl bg-rush-cream/50 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rush-navy">{m.title}</span>
                  <span className="text-[10px] font-bold text-rush-gold">₦{m.reward}</span>
                </div>
                <p className="mb-1 text-[10px] text-rush-navy/60">{m.desc}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rush-gradient rounded-full transition-[width] duration-300"
                    style={{ width: `${Math.round(m.progress * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
