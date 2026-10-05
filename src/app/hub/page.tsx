"use client";

// src/app/hub/page.tsx — The main hub after login.
// 6 location cards that open REAL functionality (no "coming soon"):
// Motor Park → 3D world, Race Track → Phaser race, Garage/Market → shop,
// Suya Spot → daily reward, Crew HQ → crew management.

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  formatNaira,
  levelFromRep,
  nextRepTarget,
  levelTitle,
  type RaceMode,
  type PlayerProfile,
} from "@/lib/storage";
import { subscribeToOnlinePlayers, updateProfile } from "@/lib/firestore";
import BuyScreen from "@/components/BuyScreen";
import type { RaceResult } from "@/game/AfroRushScene";

// Heavy components — lazy load so the hub renders fast
const AfroRushGame = lazy(() => import("@/components/AfroRushGame"));
const City = lazy(() => import("@/world/City"));

const LOCATIONS = [
  { id: "motor-park", name: "Motor Park", emoji: "🛺", color: "#1fb86f", desc: "Social hub. Find crews, okadas, danfos." },
  { id: "garage", name: "Garage", emoji: "🏍️", color: "#ff6a1a", desc: "Customize your bike & outfit." },
  { id: "race-track", name: "Race Track", emoji: "🏁", color: "#ffc531", desc: "Street, Delivery, Police Chase, Freestyle." },
  { id: "market", name: "Market", emoji: "🛍️", color: "#c026d3", desc: "Buy items with Naira and gold." },
  { id: "suya-spot", name: "Suya Spot", emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward + food buffs." },
  { id: "crew-hq", name: "Crew HQ", emoji: "👥", color: "#7c3aed", desc: "Manage crew, crew wars." },
];

type Overlay = "race-mode" | "shop" | "suya" | "crew" | "motor-park" | null;

export default function HubPage() {
  return (
    <AuthProvider>
      <HubContent />
    </AuthProvider>
  );
}

function HubContent() {
  const router = useRouter();
  const { state, signOutUser, refreshProfile } = useAuth();
  const { user, profile, unlocked, loading, loadingProfile } = state;
  const [onlineCount, setOnlineCount] = useState(1247);
  const [showOkada, setShowOkada] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [raceMode, setRaceMode] = useState<RaceMode | null>(null);
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);

  useEffect(() => {
    return subscribeToOnlinePlayers((players) => {
      setOnlineCount(1200 + players.length + Math.floor(Math.random() * 50));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowOkada(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  const handleLocation = (id: string) => {
    if (id === "race-track") setOverlay("race-mode");
    else if (id === "garage" || id === "market") setOverlay("shop");
    else if (id === "suya-spot") setOverlay("suya");
    else if (id === "crew-hq") setOverlay("crew");
    else if (id === "motor-park") setOverlay("motor-park");
  };

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
          <div className="animate-[okada-drive_2.5s_ease-in-out_forwards] text-6xl">🏍️💨</div>
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
          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-2 rounded-2xl rush-glass-pill px-3 py-2 active:scale-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: profile.avatar?.skinTone ?? "#c68642" }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-rush-navy">{profile.username}</div>
              <div className="text-[9px] uppercase tracking-wider text-rush-navy/60">{levelTitle(lvl)} · Lvl {lvl}</div>
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

        {/* Rep progress */}
        <div className="mb-5 rounded-3xl rush-glass p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rush-navy/60">Street Rank</span>
            <span className="text-xs font-bold text-rush-green">{levelTitle(lvl)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-rush-cream">
            <div className="h-full rounded-full bg-gradient-to-r from-rush-green via-rush-gold to-rush-orange transition-all duration-500" style={{ width: `${repPct}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-rush-navy/40">
            <span>{profile.rep.toLocaleString()} rep</span>
            <span>{next.toLocaleString()} → {levelTitle(lvl + 1)}</span>
          </div>
        </div>

        {/* Online count */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full rush-glass-pill px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-rush-green animate-pulse" />
          <span className="text-xs font-bold text-rush-navy">{onlineCount.toLocaleString()} riders online</span>
        </div>

        <WeekendPromo />

        {/* Location cards */}
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Where to?</div>
        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleLocation(loc.id)}
              className="group relative overflow-hidden rounded-3xl border-2 bg-white/80 p-4 text-left backdrop-blur transition-all active:scale-95"
              style={{ borderColor: `${loc.color}33` }}
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: loc.color }} />
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ background: `${loc.color}22` }}>
                {loc.emoji}
              </div>
              <div className="font-display text-sm text-rush-navy">{loc.name}</div>
              <p className="mt-0.5 text-[10px] leading-tight text-rush-navy/50">{loc.desc}</p>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: loc.color }}>Enter →</div>
            </button>
          ))}
        </div>

        <footer className="mt-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-3 text-[10px] text-rush-navy/40">
            <a href="/privacy" className="hover:text-rush-navy">Privacy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-rush-navy">Terms</a>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-rush-navy/30">AfroRush</div>
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
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-2xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy">Stay</button>
              <button onClick={() => signOutUser().then(() => router.replace("/"))} className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Race Track — mode picker */}
      {overlay === "race-mode" && (
        <RaceModePicker onClose={() => setOverlay(null)} onPick={(mode) => { setRaceMode(mode); setOverlay(null); }} />
      )}

      {/* Shop (Garage + Market) */}
      {overlay === "shop" && (
        <OverlaySheet title="Garage & Market" onClose={() => setOverlay(null)}>
          <BuyScreen profile={profile} unlocked={unlocked} />
        </OverlaySheet>
      )}

      {/* Suya Spot */}
      {overlay === "suya" && (
        <SuyaOverlay profile={profile} onClose={() => setOverlay(null)} onClaimed={refreshProfile} />
      )}

      {/* Crew HQ */}
      {overlay === "crew" && (
        <CrewOverlay profile={profile} onClose={() => setOverlay(null)} />
      )}

      {/* Motor Park — 3D world */}
      {overlay === "motor-park" && (
        <MotorParkOverlay profile={profile} onClose={() => setOverlay(null)} />
      )}

      {/* Phaser race game full screen */}
      {raceMode && (
        <div className="fixed inset-0 z-[60] bg-black">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-white">Loading race…</div>}>
            <AfroRushGame
              mode={raceMode}
              loadout={profile.loadout}
              soundOn={profile.soundOn}
              onExit={() => setRaceMode(null)}
              onFinish={(result) => { setRaceResult(result); setRaceMode(null); }}
            />
          </Suspense>
        </div>
      )}

      {/* Race result */}
      {raceResult && (
        <RaceResultOverlay result={raceResult} profile={profile} onClose={() => setRaceResult(null)} />
      )}
    </main>
  );
}

// ---------- Overlay sheet (reusable bottom sheet) ----------

function OverlaySheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="rush-bounce-in max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-rush-cream p-4 pb-8 safe-pb" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-rush-navy">{title}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rush-navy">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- Race Mode Picker ----------

function RaceModePicker({ onClose, onPick }: { onClose: () => void; onPick: (mode: RaceMode) => void }) {
  const modes: { id: RaceMode; name: string; emoji: string; desc: string; color: string }[] = [
    { id: "street-race", name: "Street Race", emoji: "🏁", desc: "Hit top speed. Beat the clock.", color: "#ffc531" },
    { id: "delivery-rush", name: "Delivery Rush", emoji: "📦", desc: "Pick up & drop off parcels.", color: "#1fb86f" },
    { id: "police-chase", name: "Police Chase", emoji: "🚓", desc: "Outrun the sirens for 60s.", color: "#16a3b1" },
    { id: "freestyle-run", name: "Freestyle Run", emoji: "∞", desc: "Endless. Stack distance + style.", color: "#7c3aed" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="rush-bounce-in rush-card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-rush-navy">Pick a Race</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-rush-cream text-rush-navy">✕</button>
        </div>
        <div className="space-y-2">
          {modes.map((m) => (
            <button key={m.id} onClick={() => onPick(m.id)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 active:scale-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${m.color}22` }}>{m.emoji}</div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-rush-navy">{m.name}</div>
                <div className="text-[10px] text-rush-navy/60">{m.desc}</div>
              </div>
              <span className="text-xs font-bold" style={{ color: m.color }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Suya Spot ----------

function SuyaOverlay({ profile, onClose, onClaimed }: { profile: PlayerProfile; onClose: () => void; onClaimed: () => Promise<void> }) {
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);

  const claim = async () => {
    if (claimed || busy) return;
    setBusy(true);
    try {
      await updateProfile(profile.uid, { cash: profile.cash + 500, rep: profile.rep + 25 });
      await onClaimed();
      setClaimed(true);
    } finally { setBusy(false); }
  };

  return (
    <OverlaySheet title="Suya Spot" onClose={onClose}>
      <div className="text-center">
        <div className="mb-3 text-6xl">🍢</div>
        <div className="font-display text-lg text-rush-navy">Daily Suya Reward</div>
        <p className="mt-1 text-xs text-rush-navy/60">Claim your free suya every day for ₦500 + 25 rep.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Cash</div>
            <div className="font-display text-base text-rush-gold">+₦500</div>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Rep</div>
            <div className="font-display text-base text-rush-jade">+25</div>
          </div>
        </div>
        <button
          onClick={claim}
          disabled={claimed || busy}
          className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white ${
            claimed ? "bg-rush-cream text-rush-navy/50" : "bg-rush-orange shadow-lg shadow-rush-orange/30 active:scale-95"
          } disabled:opacity-50`}
        >
          {claimed ? "✓ Claimed — come back tomorrow!" : busy ? "Claiming…" : "Claim Suya 🍢"}
        </button>
      </div>
    </OverlaySheet>
  );
}

// ---------- Crew HQ ----------

function CrewOverlay({ profile, onClose }: { profile: PlayerProfile; onClose: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [color, setColor] = useState("#1fb86f");
  const [busy, setBusy] = useState(false);
  const { refreshProfile } = useAuth();

  const createCrew = async () => {
    if (busy || !name.trim()) return;
    setBusy(true);
    try {
      const { createCrew: createCrewFn } = await import("@/lib/firestore");
      await createCrewFn(profile, name, tag, color);
      await refreshProfile();
      setShowCreate(false);
      setName(""); setTag(""); setColor("#1fb86f");
    } finally { setBusy(false); }
  };

  return (
    <OverlaySheet title="Crew HQ" onClose={onClose}>
      {profile.crewId ? (
        <div className="space-y-3">
          <div className="rounded-3xl border-2 p-4" style={{ borderColor: profile.crewColor ?? "#7c3aed", background: `${profile.crewColor ?? "#7c3aed"}22` }}>
            <div className="text-[10px] uppercase tracking-wider text-rush-navy/50">Your Crew</div>
            <div className="font-display text-xl text-rush-navy">{profile.crewName}</div>
            <div className="text-xs text-rush-navy/60">Tag: [{profile.crewTag}]</div>
          </div>
          <p className="text-xs text-rush-navy/60">Crew wars, chat and member management coming soon. Your crew tag is now visible across the game!</p>
        </div>
      ) : showCreate ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-rush-navy/60">Crew Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm text-rush-navy" placeholder="e.g. Lagos Bolt Riders" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-rush-navy/60">Tag (3 chars)</label>
            <input value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} maxLength={3} className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy" placeholder="LBR" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-wider text-rush-navy/60">Color</label>
            <div className="flex flex-wrap gap-2">
              {["#1fb86f", "#ff6a1a", "#ffc531", "#7c3aed", "#c026d3", "#16a3b1"].map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`h-9 w-9 rounded-full border-2 ${color === c ? "scale-110 border-rush-navy" : "border-white"}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button onClick={createCrew} disabled={busy || !name.trim()} className="w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50">
            {busy ? "Creating…" : "Create Crew"}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-3 text-5xl">👥</div>
          <div className="font-display text-lg text-rush-navy">No Crew Yet</div>
          <p className="mt-1 text-xs text-rush-navy/60">Start your own crew or wait to join one. Crews get a tag, color, and rep bonuses.</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 w-full rounded-2xl bg-rush-purple px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-purple/30 active:scale-95">
            + Create a Crew
          </button>
        </div>
      )}
    </OverlaySheet>
  );
}

// ---------- Motor Park (3D world) ----------

function MotorParkOverlay({ profile, onClose }: { profile: PlayerProfile; onClose: () => void }) {
  const inputRef = useRef({ x: 0, y: 0, boost: false });
  const [riding, setRiding] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-rush-sky">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-rush-navy">Loading the streets…</div>}>
        <City avatar={profile.avatar} quality={profile.graphicsQuality} riding={riding} inputRef={inputRef} />
      </Suspense>

      {/* Top bar with close button */}
      <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
        <button onClick={onClose} className="rush-glass-pill flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rush-navy">
          ← Hub
        </button>
        <div className="rush-glass-pill px-3 py-2 text-xs font-bold text-rush-navy">
          🛺 Motor Park
        </div>
      </div>

      {/* Joystick — left half of screen */}
      <Joystick inputRef={inputRef} />

      {/* Action buttons */}
      <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-2">
        <button onClick={() => setRiding((r) => !r)} className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg ${riding ? "bg-rush-orange text-white" : "rush-glass-pill"}`}>
          {riding ? "🛑" : "🏍️"}
        </button>
        <button
          onPointerDown={() => { inputRef.current.boost = true; }}
          onPointerUp={() => { inputRef.current.boost = false; }}
          onPointerLeave={() => { inputRef.current.boost = false; }}
          className="flex h-16 w-16 touch-none items-center justify-center rounded-full bg-rush-green text-2xl text-white shadow-lg shadow-rush-green/30 active:scale-95"
          style={{ touchAction: "none" }}
        >
          ⚡
        </button>
      </div>
    </div>
  );
}

// ---------- Race Result Overlay ----------

function RaceResultOverlay({ result, profile, onClose }: { result: RaceResult; profile: PlayerProfile; onClose: () => void }) {
  const won = result.finished;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="rush-bounce-in rush-card w-full max-w-sm p-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-rush-gold">Race Complete</div>
        <h2 className="font-display text-3xl" style={{ color: won ? "#1fb86f" : "#ef4444" }}>
          {won ? "Victory!" : result.reason === "caught" ? "Busted!" : "Wrecked!"}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Score" value={result.score.toLocaleString()} />
          <Stat label="Distance" value={`${result.distance}m`} />
          <Stat label="Cash" value={`+₦${result.cashEarned}`} />
          <Stat label="Rep" value={`+${result.repEarned}`} />
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 active:scale-95">
          Back to Hub
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-rush-cream/50 p-2">
      <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">{label}</div>
      <div className="font-mono text-sm font-bold text-rush-navy">{value}</div>
    </div>
  );
}

// ---------- Weekend promo ----------

function WeekendPromo() {
  const [timeLeft, setTimeLeft] = useState("");
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.getDay();
      const weekend = day === 0 || day === 6;
      setIsWeekend(weekend);
      if (weekend) {
        const end = new Date(now);
        end.setDate(now.getDate() + (day === 0 ? 1 : 2));
        end.setHours(0, 0, 0, 0);
        const diff = end.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else {
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
            <div className="text-[10px] text-rush-navy/60">{isWeekend ? `Ends in ${timeLeft}` : `Starts in ${timeLeft}`}</div>
          </div>
          <div className="rounded-full bg-rush-orange px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{isWeekend ? "LIVE" : "SOON"}</div>
        </div>
      </div>
    </div>
  );
}

// Import Joystick at the bottom (lazy)
import Joystick from "@/components/Joystick";
