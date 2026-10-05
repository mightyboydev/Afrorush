"use client";

// src/components/HomeScreen.tsx — Player's apartment (Home tab).
// Status bars, apartment preview, quick actions, daily reward.

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  formatNaira,
  levelFromRep,
  levelTitle,
  type PlayerProfile,
} from "@/lib/storage";

export default function HomeScreen({ profile }: { profile: PlayerProfile }) {
  const lvl = levelFromRep(profile.rep);
  const [streak, setStreak] = useState(3);
  const [energy, setEnergy] = useState(85);
  const [mood, setMood] = useState(72);
  const [hunger, setHunger] = useState(58);
  const [claimedToday, setClaimedToday] = useState(false);

  // Animate streak + energy decay (demo — Phase 5 will persist these)
  useEffect(() => {
    const id = setInterval(() => {
      setEnergy((e) => Math.max(0, e - 0.1));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rush-slide-up min-h-screen pb-4">
      {/* Apartment preview */}
      <div className="relative mb-4 overflow-hidden rounded-3xl rush-soft-shadow">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff1d6] via-[#ffe5b8] to-[#ffc531]/30" />
        {/* Stylized apartment (CSS) */}
        <div className="relative px-5 pb-5 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Your Apartment</div>
              <div className="font-display text-xl text-rush-navy">Studio Flat</div>
            </div>
            <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-rush-navy backdrop-blur">
              🔥 {streak} day streak
            </div>
          </div>

          {/* Isometric room illustration */}
          <div className="relative mx-auto h-32 w-full max-w-[280px]">
            {/* Floor */}
            <div className="absolute bottom-0 left-1/2 h-12 w-[80%] -translate-x-1/2 rounded-lg bg-[#8b5a2b]/30" />
            {/* Bed */}
            <div className="absolute bottom-6 left-[15%] flex h-10 w-20 items-center justify-center rounded-lg bg-[#1fb86f]/40 backdrop-blur">
              <span className="text-xs">🛏️</span>
            </div>
            {/* Table */}
            <div className="absolute bottom-6 right-[15%] flex h-10 w-16 items-center justify-center rounded-lg bg-[#ff6a1a]/30 backdrop-blur">
              <span className="text-xs">🪑</span>
            </div>
            {/* Window */}
            <div className="absolute right-[20%] top-2 h-12 w-16 rounded-lg border-4 border-white/60 bg-[#b3e5fc]/40 backdrop-blur" />
            {/* Player avatar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-3xl">🧍</div>
          </div>
        </div>
      </div>

      {/* Status bars */}
      <div className="mb-4 space-y-2.5">
        <StatusBar label="Energy" value={energy} icon="⚡" color="#ffc531" />
        <StatusBar label="Mood" value={mood} icon="😊" color="#1fb86f" />
        <StatusBar label="Hunger" value={hunger} icon="🍽️" color="#ff6a1a" />
      </div>

      {/* Daily reward */}
      <button
        onClick={() => { if (!claimedToday) { setClaimedToday(true); setStreak((s) => s + 1); } }}
        disabled={claimedToday}
        className={`mb-4 flex w-full items-center gap-3 rounded-2xl p-4 transition-all ${
          claimedToday ? "bg-rush-cream/50 opacity-60" : "rush-glow-green bg-white active:scale-[0.98]"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rush-gold/20 text-2xl">🎁</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-bold text-rush-navy">Daily Reward</div>
          <div className="text-xs text-rush-navy/60">
            {claimedToday ? "Claimed — come back tomorrow!" : "Claim ₦500 + 10 gold now"}
          </div>
        </div>
        {!claimedToday && (
          <span className="rounded-full bg-rush-green px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Claim</span>
        )}
      </button>

      {/* Quick stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatBox label="Cash" value={formatNaira(profile.cash)} icon="💵" />
        <StatBox label="Gold" value={String(profile.gold)} icon="🪙" />
        <StatBox label="Rep" value={profile.rep.toLocaleString()} icon="🏆" />
      </div>

      {/* Quick actions */}
      <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Quick Actions</div>
      <div className="grid grid-cols-4 gap-2">
        <QuickAction icon="🏁" label="Race" />
        <QuickAction icon="🔧" label="Garage" />
        <QuickAction icon="👥" label="Crew" />
        <QuickAction icon="🍢" label="Suya" />
      </div>
    </div>
  );
}

function StatusBar({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2 backdrop-blur">
      <span className="text-base">{icon}</span>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-bold text-rush-navy">{label}</span>
          <span className="text-xs font-bold text-rush-navy/60">{Math.round(pct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-rush-cream">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-2 text-center backdrop-blur">
      <div className="text-base">{icon}</div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-rush-navy/50">{label}</div>
      <div className="text-xs font-bold text-rush-navy">{value}</div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-2xl bg-white/80 py-3 backdrop-blur active:scale-95">
      <span className="text-xl">{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-rush-navy">{label}</span>
    </button>
  );
}
