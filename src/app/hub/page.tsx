"use client";

// src/app/hub/page.tsx — The main hub after login.
// Vibrant African motor park with 6 location cards, top bar, welcome okada animation.

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  formatNaira,
  levelFromRep,
  nextRepTarget,
  levelTitle,
  type RaceMode,
} from "@/lib/storage";
import { subscribeToOnlinePlayers } from "@/lib/firestore";

const LOCATIONS = [
  { id: "motor-park", name: "Motor Park", emoji: "🛺", color: "#1fb86f", desc: "Social hub. Find crews, okadas, danfos." },
  { id: "garage", name: "Garage", emoji: "🏍️", color: "#ff6a1a", desc: "Customize your bike & outfit." },
  { id: "race-track", name: "Race Track", emoji: "🏁", color: "#ffc531", desc: "Street, Delivery, Police Chase, Freestyle." },
  { id: "market", name: "Market", emoji: "🛍️", color: "#c026d3", desc: "Buy items with Naira and gold." },
  { id: "suya-spot", name: "Suya Spot", emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward + food buffs." },
  { id: "crew-hq", name: "Crew HQ", emoji: "👥", color: "#7c3aed", desc: "Manage crew, crew wars." },
];

export default function HubPage() {
  return (
    <AuthProvider>
      <HubContent />
    </AuthProvider>
  );
}

function HubContent() {
  const router = useRouter();
  const { state, signOutUser } = useAuth();
  const { user, profile, loading, loadingProfile } = state;
  const [onlineCount, setOnlineCount] = useState(1247);
  const [showOkada, setShowOkada] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Subscribe to real online count
  useEffect(() => {
    return subscribeToOnlinePlayers((players) => {
      setOnlineCount(1200 + players.length + Math.floor(Math.random() * 50));
    });
  }, []);

  // Hide welcome okada after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setShowOkada(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || loadingProfile || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7]">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-rush-green border-t-transparent" />
          <div className="text-sm uppercase tracking-widest text-rush-navy/60">Loading the streets…</div>
        </div>
      </main>
    );
  }

  const lvl = levelFromRep(profile.rep);
  const next = nextRepTarget(profile.rep);
  const base = Math.pow(lvl - 1, 2) * 100;
  const repPct = Math.min(100, ((profile.rep - base) / (next - base)) * 100);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7]">
      {/* Decorative clouds */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-16 w-32 rounded-full bg-white/80 blur-md animate-pulse" />
        <div className="absolute right-[15%] top-[15%] h-12 w-24 rounded-full bg-white/70 blur-md animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Welcome okada animation */}
      {showOkada && (
        <div className="pointer-events-none fixed inset-x-0 top-1/3 z-40 flex justify-center">
          <div className="animate-[okada-drive_2.5s_ease-in-out_forwards] text-6xl">
            🏍️💨
          </div>
          <style>{`
            @keyframes okada-drive {
              0% { transform: translateX(-100vw) rotate(-5deg); opacity: 0; }
              30% { opacity: 1; }
              70% { transform: translateX(0) rotate(0deg); opacity: 1; }
              100% { transform: translateX(100vw) rotate(5deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-md px-4 pb-8 pt-4 safe-pt">
        {/* Top bar */}
        <header className="mb-5 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 rounded-2xl rush-glass-pill px-3 py-2 active:scale-95"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: profile.avatar?.skinTone ?? "#c68642" }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-rush-navy">{profile.username}</div>
              <div className="text-[9px] uppercase tracking-wider text-rush-navy/60">
                {levelTitle(lvl)} · Lvl {lvl}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl rush-glass-pill px-3 py-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Rep</div>
              <div className="text-xs font-bold text-rush-jade">{profile.rep.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl rush-glass-pill px-3 py-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Cash</div>
              <div className="text-xs font-bold text-rush-gold">{formatNaira(profile.cash)}</div>
            </div>
          </div>
        </header>

        {/* Rep progress ring */}
        <div className="mb-5 rounded-3xl rush-glass p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rush-navy/60">Street Rank</span>
            <span className="text-xs font-bold text-rush-green">{levelTitle(lvl)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-rush-cream">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rush-green via-rush-gold to-rush-orange transition-all duration-500"
              style={{ width: `${repPct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-rush-navy/40">
            <span>{profile.rep.toLocaleString()} rep</span>
            <span>{next.toLocaleString()} → {levelTitle(lvl + 1)}</span>
          </div>
        </div>

        {/* Online count banner */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full rush-glass-pill px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-rush-green animate-pulse" />
          <span className="text-xs font-bold text-rush-navy">{onlineCount.toLocaleString()} riders online</span>
        </div>

        {/* Weekend race promo with countdown */}
        <WeekendPromo />

        {/* Location cards grid */}
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Where to?</div>
        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map((loc, i) => (
            <button
              key={loc.id}
              onClick={() => router.push(`/location?id=${loc.id}`)}
              className="group relative overflow-hidden rounded-3xl border-2 bg-white/80 p-4 text-left backdrop-blur transition-all active:scale-95"
              style={{ borderColor: `${loc.color}33` }}
            >
              {/* Accent bar */}
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: loc.color }} />
              {/* Icon */}
              <div
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6"
                style={{ background: `${loc.color}22` }}
              >
                {loc.emoji}
              </div>
              <div className="font-display text-sm text-rush-navy">{loc.name}</div>
              <p className="mt-0.5 text-[10px] leading-tight text-rush-navy/50">{loc.desc}</p>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: loc.color }}>
                Enter →
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-3 text-[10px] text-rush-navy/40">
            <a href="/privacy" className="hover:text-rush-navy">Privacy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-rush-navy">Terms</a>
            <span>·</span>
            <a href="/admin" className="hover:text-rush-navy">Admin</a>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-rush-navy/30">
            AfroRush · Built with ❤️ in Lagos
          </div>
        </footer>
      </div>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="rush-bounce-in rush-card w-full max-w-xs p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-4xl">🚪</div>
            <div className="font-display text-lg text-rush-navy">Log out?</div>
            <p className="mt-1 text-xs text-rush-navy/60">You can always come back to the streets.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-2xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy">
                Stay
              </button>
              <button onClick={() => signOutUser().then(() => router.replace("/"))} className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Weekend promo with live countdown
function WeekendPromo() {
  const [timeLeft, setTimeLeft] = useState("");
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      const weekend = day === 0 || day === 6;
      setIsWeekend(weekend);
      if (weekend) {
        // Countdown to end of weekend (Sunday midnight)
        const end = new Date(now);
        end.setDate(now.getDate() + (day === 0 ? 1 : 2));
        end.setHours(0, 0, 0, 0);
        const diff = end.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else {
        // Countdown to Saturday
        const sat = new Date(now);
        sat.setDate(now.getDate() + ((6 - day + 7) % 7 || 7));
        sat.setHours(0, 0, 0, 0);
        const diff = sat.getTime() - now.getTime();
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        setTimeLeft(`${d}d ${h}h`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-r from-rush-orange to-rush-gold p-0.5">
      <div className="rounded-[22px] bg-white/90 p-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div className="flex-1">
            <div className="text-xs font-bold text-rush-navy">Weekend Race: Double Rep!</div>
            <div className="text-[10px] text-rush-navy/60">
              {isWeekend ? `Ends in ${timeLeft}` : `Starts in ${timeLeft}`}
            </div>
          </div>
          <div className="rounded-full bg-rush-orange px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
            {isWeekend ? "LIVE" : "SOON"}
          </div>
        </div>
      </div>
    </div>
  );
}
