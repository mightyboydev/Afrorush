"use client";

// src/components/PhoneScreen.tsx — Smartphone interface with app grid.
// Apps: Jobs, Messages, Bank, Crew, Leaderboard, Settings, Camera, Ride, Health, etc.

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { formatNaira, type PlayerProfile } from "@/lib/storage";

interface App {
  id: string;
  label: string;
  icon: string;
  from: string;
  to: string;
  badge?: number;
  locked?: boolean;
}

const APPS: App[] = [
  { id: "jobs", label: "Jobs", icon: "💼", from: "#1fb86f", to: "#178a55" },
  { id: "messages", label: "Messages", icon: "💬", from: "#16a3b1", to: "#0d9488", badge: 3 },
  { id: "bank", label: "Bank", icon: "🏦", from: "#ffc531", to: "#e8a217" },
  { id: "crew", label: "Crew", icon: "👥", from: "#7c3aed", to: "#5b21b6" },
  { id: "leaderboard", label: "Ranks", icon: "🏆", from: "#ff6a1a", to: "#c2410c" },
  { id: "ride", label: "Ride", icon: "🛺", from: "#1fb86f", to: "#16a34a" },
  { id: "health", label: "Health", icon: "❤️", from: "#ef4444", to: "#dc2626" },
  { id: "camera", label: "Camera", icon: "📷", from: "#14213d", to: "#1e293b" },
  { id: "games", label: "Games", icon: "🎮", from: "#c026d3", to: "#a21caf" },
  { id: "nollywood", label: "Nollywood", icon: "🎬", from: "#ff6a1a", to: "#ea580c", locked: true },
  { id: "settings", label: "Settings", icon: "⚙️", from: "#6b7280", to: "#4b5563" },
  { id: "more", label: "More", icon: "•••", from: "#9ca3af", to: "#6b7280" },
];

export default function PhoneScreen({ profile }: { profile: PlayerProfile }) {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const [battery] = useState(78);

  return (
    <div className="rush-slide-up min-h-screen pb-4">
      {/* Phone status bar */}
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-rush-navy px-4 py-2 text-white">
        <span className="text-xs font-bold">{time}</span>
        <div className="flex items-center gap-2 text-[10px]">
          <span>📶 4G</span>
          <span>🔋 {battery}%</span>
        </div>
      </div>

      {/* If app is open, show its content */}
      {openApp ? (
        <AppContent appId={openApp} profile={profile} onClose={() => setOpenApp(null)} />
      ) : (
        <>
          {/* Wallet card */}
          <div className="mb-4 overflow-hidden rounded-3xl rush-gradient rush-soft-shadow">
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">AfroRush Wallet</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">PREMIUM</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">Balance</div>
                  <div className="font-display text-2xl text-white">{formatNaira(profile.cash)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-white/70">Gold</div>
                  <div className="font-display text-xl text-white">🪙 {profile.gold}</div>
                </div>
              </div>
            </div>
          </div>

          {/* App grid */}
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Apps</div>
          <div className="grid grid-cols-4 gap-3">
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => !app.locked && setOpenApp(app.id)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="relative">
                  <div
                    className="rush-squircle flex h-14 w-14 items-center justify-center text-2xl"
                    style={{ "--icon-from": app.from, "--icon-to": app.to } as React.CSSProperties}
                  >
                    {app.locked ? "🔒" : app.icon}
                  </div>
                  {app.badge && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rush-orange px-1 text-[10px] font-bold text-white">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-rush-navy">{app.label}</span>
              </button>
            ))}
          </div>

          {/* Recent activity */}
          <div className="mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Recent</div>
          <div className="space-y-2">
            <ActivityItem icon="🏁" text="Finished Street Race" sub="Earned ₦250 + 15 rep" time="2m ago" />
            <ActivityItem icon="👥" text="Joined crew 'Lagos Bolt Riders'" sub="Tag [LBR]" time="1h ago" />
            <ActivityItem icon="🎁" text="Claimed daily reward" sub="₦500 + 10 gold" time="1d ago" />
          </div>
        </>
      )}
    </div>
  );
}

function AppContent({ appId, profile, onClose }: { appId: string; profile: PlayerProfile; onClose: () => void }) {
  const app = APPS.find((a) => a.id === appId);
  if (!app) return null;
  return (
    <div className="rush-bounce-in">
      {/* App header */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">
          ←
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
          style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}
        >
          {app.icon}
        </div>
        <h2 className="font-display text-xl text-rush-navy">{app.label}</h2>
      </div>

      {/* App body — placeholder content per app */}
      <div className="rush-glass rounded-3xl p-5 text-center">
        <div className="mb-3 text-5xl">{app.icon}</div>
        <div className="font-display text-lg text-rush-navy">{app.label} app</div>
        <p className="mt-1 text-sm text-rush-navy/60">
          {appId === "jobs" && "Find missions and earn Naira. 3 jobs available today."}
          {appId === "messages" && "3 unread messages from your crew."}
          {appId === "bank" && `Balance: ${formatNaira(profile.cash)} · ${profile.gold} gold`}
          {appId === "crew" && "Your crew: Lagos Bolt Riders [LBR] · 4 members"}
          {appId === "leaderboard" && "You're ranked #12 in Lagos this week."}
          {appId === "ride" && "Call an okada, danfo, or cab to travel."}
          {appId === "health" && "Energy 85% · Mood 72% · Hunger 58%"}
          {appId === "camera" && "Take photos in the world to earn rep."}
          {appId === "games" && "Mini-games: Suya Dice, Ludo, Ayo. Coming soon!"}
          {appId === "settings" && "Sound, graphics, account, log out."}
          {appId === "more" && "More apps coming soon."}
        </p>
        <button className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
          Open
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ icon, text, sub, time }: { icon: string; text: string; sub: string; time: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rush-cream text-base">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="truncate text-xs font-bold text-rush-navy">{text}</div>
        <div className="truncate text-[10px] text-rush-navy/50">{sub}</div>
      </div>
      <span className="text-[10px] text-rush-navy/40">{time}</span>
    </div>
  );
}
