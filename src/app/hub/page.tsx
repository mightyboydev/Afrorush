"use client";

// src/app/hub/page.tsx — Home screen: 3D room, needs bars, top bar, bottom nav.
// Phase 1 of the life-sim restyle.

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  formatNaira,
  levelFromRep,
  levelTitle,
  type PlayerProfile,
} from "@/lib/storage";
import { subscribeToOnlinePlayers } from "@/lib/firestore";
import BottomNav, { type Tab } from "@/components/BottomNav";
import NeedsBar from "@/components/NeedsBar";
import BuyScreen from "@/components/BuyScreen";
import Joystick from "@/components/Joystick";
import PhoneScreen from "@/components/PhoneScreen";
import MapScreen from "@/components/MapScreen";

// 3D Home Room — heavy, ssr:false
const HomeRoom = lazy(() => import("@/world/HomeRoom"));
const Race3D = lazy(() => import("@/components/Race3D"));
const City = lazy(() => import("@/world/City"));
const CharacterPreview3D = lazy(() => import("@/components/CharacterPreview"));

const LOCATIONS = [
  { id: "motor-park", name: "Motor Park", emoji: "🛺", color: "#1fb86f", desc: "Social hub. Okadas, danfos, keke." },
  { id: "garage", name: "Garage", emoji: "🏍️", color: "#ff6a1a", desc: "Customize your bike & outfit." },
  { id: "race-track", name: "Race Track", emoji: "🏁", color: "#ffc531", desc: "Street, Delivery, Police Chase, Freestyle." },
  { id: "market", name: "Balogun Market", emoji: "🛍️", color: "#c026d3", desc: "Buy items with Naira and gold." },
  { id: "suya-spot", name: "Suya Spot", emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward + food buffs." },
  { id: "crew-hq", name: "Crew HQ", emoji: "👥", color: "#7c3aed", desc: "Manage crew, crew wars." },
  { id: "stadium", name: "National Stadium", emoji: "🏟️", color: "#1fb86f", desc: "Lagos National Stadium, Surulere." },
  { id: "quilox", name: "Quilox Club", emoji: "🎉", color: "#ff6a1a", desc: "Lagos hottest nightclub. V/I." },
  { id: "church", name: "Cathedral", emoji: "⛪", color: "#16a3b1", desc: "Holy Cross Cathedral." },
  { id: "mosque", name: "Central Mosque", emoji: "🕌", color: "#16a3b1", desc: "Lagos Central Mosque." },
  { id: "unilag", name: "UNILAG", emoji: "🎓", color: "#ffc531", desc: "University of Lagos, Akoka." },
  { id: "lekki", name: "Lekki Bridge", emoji: "🌉", color: "#7c3aed", desc: "Lekki-Ikoyi Link Bridge." },
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
  const [tab, setTab] = useState<Tab>("home");
  const [onlineCount, setOnlineCount] = useState(0);
  const [showOkada, setShowOkada] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cleanScreen, setCleanScreen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [raceMode, setRaceMode] = useState<null | "street-race" | "delivery-rush" | "police-chase" | "freestyle-run">(null);
  const [raceResult, setRaceResult] = useState<import("@/game/AfroRushScene").RaceResult | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; name: string; emoji: string; color: string; desc: string } | null>(null);

  // Real online count from presence
  useEffect(() => {
    return subscribeToOnlinePlayers((players) => {
      setOnlineCount(players.length);
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
    else {
      const loc = LOCATIONS.find((l) => l.id === id);
      if (loc) setSelectedLocation(loc);
    }
  };

  if (loading || loadingProfile || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7]">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-rush-green border-t-transparent" />
          <div className="text-sm uppercase tracking-widest text-rush-navy/60">Loading your home…</div>
        </div>
      </main>
    );
  }

  const lvl = levelFromRep(profile.rep);
  const clock = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f5e6c8] to-[#e8d5b0]">
      {/* 3D Home Room — always rendered, behind UI */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-rush-navy/40">Loading room…</div>}>
          <HomeRoom avatar={profile.avatar} quality={profile.graphicsQuality} />
        </Suspense>
      </div>

      {/* Welcome okada */}
      {showOkada && (
        <div className="pointer-events-none fixed inset-x-0 top-1/3 z-40 flex justify-center">
          <div className="animate-[okada-drive_2.5s_ease-in-out_forwards] text-5xl">🏍️💨</div>
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

      {/* UI overlay — hidden when cleanScreen is on */}
      {!cleanScreen && (
        <div className="relative z-10">
          {/* Top bar */}
          <header className="flex items-center justify-between px-3 pt-3 safe-pt">
            <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-2 rounded-2xl rush-glass-pill px-2.5 py-1.5 active:scale-95">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: profile.avatar?.skinTone ?? "#c68642" }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-rush-navy">{profile.username}</div>
                <div className="text-[8px] uppercase tracking-wider text-rush-navy/50">{levelTitle(lvl)} · Lvl {lvl}</div>
              </div>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Clock */}
              <div className="rounded-xl rush-glass-pill px-2.5 py-1.5 text-center">
                <div className="text-[8px] uppercase tracking-wider text-rush-navy/50">Time</div>
                <div className="font-mono text-xs font-bold text-rush-navy">{clock}</div>
              </div>
              {/* Cash + add button */}
              <div className="flex items-center gap-1 rounded-xl rush-glass-pill px-2.5 py-1.5">
                <span className="text-xs">💵</span>
                <span className="text-xs font-bold text-rush-gold">{formatNaira(profile.cash)}</span>
                <button className="flex h-5 w-5 items-center justify-center rounded-full bg-rush-green text-xs text-white active:scale-90">+</button>
              </div>
              {/* Sound toggle */}
              <button onClick={() => refreshProfile()} className="flex h-8 w-8 items-center justify-center rounded-xl rush-glass-pill text-sm active:scale-90">
                {profile.soundOn ? "🔊" : "🔇"}
              </button>
            </div>
          </header>

          {/* Live chips */}
          <div className="mt-2 flex items-center justify-center gap-2 px-3">
            <div className="flex items-center gap-1.5 rounded-full rush-glass-pill px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rush-green animate-pulse" />
              <span className="text-[10px] font-bold text-rush-navy">{onlineCount} online</span>
            </div>
            <div className="rounded-full rush-glass-pill px-3 py-1 text-[10px] font-bold text-rush-navy">
              🔥 {profile.loginStreak || 1} day streak
            </div>
          </div>
        </div>
      )}

      {/* Tab content — semi-transparent so 3D shows through */}
      <div className={`relative z-10 overflow-y-auto px-3 pb-24 pt-1 transition-opacity ${cleanScreen ? "opacity-0 pointer-events-none" : ""}`}>
        {tab === "home" && (
          <div className="mx-auto max-w-md space-y-2">
            {/* Needs bars — compact */}
            <NeedsBar profile={profile} />

            {/* Today's task + Gem hunt — side by side, compact */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/60 p-2.5 backdrop-blur-md">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-rush-navy/50">Task</span>
                  <span className="text-[8px] text-rush-gold">+₦500</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🍢</span>
                  <span className="text-[10px] font-bold text-rush-navy">Visit Suya Spot</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white/60 p-2.5 backdrop-blur-md">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-rush-navy/50">Gems</span>
                  <span className="text-[8px] text-rush-purple">💎 {profile.gemsFound?.length || 0}/5</span>
                </div>
                <p className="text-[9px] text-rush-navy/50">Find hidden gems in the city!</p>
              </div>
            </div>

            {/* Quick locations — horizontal scroll, compact */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {LOCATIONS.slice(0, 8).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleLocation(loc.id)}
                  className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl bg-white/60 p-1.5 backdrop-blur-md active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-base" style={{ background: `${loc.color}22` }}>{loc.emoji}</div>
                  <span className="text-[7px] font-bold text-rush-navy">{loc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "buy" && (
          <div className="mx-auto max-w-md">
            <BuyScreen profile={profile} unlocked={unlocked} />
          </div>
        )}

        {tab === "map" && (
          <div className="mx-auto max-w-md">
            <MapScreen profile={profile} onVisitLocation={handleLocation} />
          </div>
        )}

        {tab === "phone" && (
          <div className="mx-auto max-w-md">
            <PhoneScreen profile={profile} />
          </div>
        )}
      </div>

      {/* Clean screen toggle button (always visible) */}
      <button
        onClick={() => setCleanScreen((c) => !c)}
        className="fixed bottom-20 left-3 z-30 flex h-10 w-10 items-center justify-center rounded-full rush-glass-pill text-sm active:scale-90"
        aria-label="Toggle UI"
      >
        {cleanScreen ? "👁️" : "🙈"}
      </button>

      {/* Bottom nav */}
      {!cleanScreen && <BottomNav active={tab} onChange={setTab} />}

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

      {/* Overlays */}
      {overlay === "race-mode" && (
        <RaceModePicker onClose={() => setOverlay(null)} onPick={(mode) => { setRaceMode(mode); setOverlay(null); }} />
      )}
      {overlay === "shop" && (
        <OverlaySheet title="Garage & Market" onClose={() => setOverlay(null)}>
          <BuyScreen profile={profile} unlocked={unlocked} />
        </OverlaySheet>
      )}
      {overlay === "suya" && (
        <SuyaOverlay profile={profile} onClose={() => setOverlay(null)} onClaimed={refreshProfile} />
      )}
      {overlay === "crew" && (
        <CrewOverlay profile={profile} onClose={() => setOverlay(null)} />
      )}
      {overlay === "motor-park" && (
        <MotorParkOverlay profile={profile} onClose={() => setOverlay(null)} />
      )}

      {/* 3D Race game */}
      {raceMode && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] flex items-center justify-center text-white">Loading race…</div>}>
          <Race3D
            mode={raceMode}
            loadout={profile.loadout}
            soundOn={profile.soundOn}
            onExit={() => setRaceMode(null)}
            onFinish={(result) => { setRaceResult(result); setRaceMode(null); }}
          />
        </Suspense>
      )}

      {/* Race result */}
      {raceResult && (
        <RaceResultOverlay result={raceResult} profile={profile} onClose={() => setRaceResult(null)} />
      )}

      {/* Location detail modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedLocation(null)}>
          <div className="rush-bounce-in rush-card w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-5xl">{selectedLocation.emoji}</div>
            <h2 className="font-display text-2xl text-rush-navy">{selectedLocation.name}</h2>
            <p className="mt-2 text-sm text-rush-navy/60">{selectedLocation.desc}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setSelectedLocation(null)} className="flex-1 rounded-2xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy">Close</button>
              <button onClick={() => { setOverlay("motor-park"); setSelectedLocation(null); }} className="flex-1 rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">Go There →</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-2 text-center safe-pb">
        <div className="flex items-center justify-center gap-3 text-[10px] text-rush-navy/40">
          <a href="/privacy" className="hover:text-rush-navy">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-rush-navy">Terms</a>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-rush-navy/30">AfroRush</div>
      </footer>
    </main>
  );
}

// ---------- Overlay helpers (kept from previous build) ----------

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

function RaceModePicker({ onClose, onPick }: { onClose: () => void; onPick: (mode: "street-race" | "delivery-rush" | "police-chase" | "freestyle-run") => void }) {
  const modes = [
    { id: "street-race" as const, name: "Street Race", emoji: "🏁", desc: "Hit top speed. Beat the clock.", color: "#ffc531" },
    { id: "delivery-rush" as const, name: "Delivery Rush", emoji: "📦", desc: "Pick up & drop off parcels.", color: "#1fb86f" },
    { id: "police-chase" as const, name: "Police Chase", emoji: "🚓", desc: "Outrun the sirens for 60s.", color: "#16a3b1" },
    { id: "freestyle-run" as const, name: "Freestyle Run", emoji: "∞", desc: "Endless. Stack distance + style.", color: "#7c3aed" },
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
              <div className="flex-1 text-left"><div className="text-sm font-bold text-rush-navy">{m.name}</div><div className="text-[10px] text-rush-navy/60">{m.desc}</div></div>
              <span className="text-xs font-bold" style={{ color: m.color }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuyaOverlay({ profile, onClose, onClaimed }: { profile: PlayerProfile; onClose: () => void; onClaimed: () => Promise<void> }) {
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);
  const claim = async () => {
    if (claimed || busy) return;
    setBusy(true);
    try {
      const { updateProfile } = await import("@/lib/firestore");
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
        <button onClick={claim} disabled={claimed || busy} className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider ${claimed ? "bg-rush-cream text-rush-navy/50" : "bg-rush-orange text-white active:scale-95"} disabled:opacity-50`}>
          {claimed ? "✓ Claimed — come back tomorrow!" : busy ? "Claiming…" : "Claim Suya 🍢"}
        </button>
      </div>
    </OverlaySheet>
  );
}

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
    } finally { setBusy(false); }
  };
  return (
    <OverlaySheet title="Crew HQ" onClose={onClose}>
      {profile.crewId ? (
        <div className="rounded-3xl border-2 p-4" style={{ borderColor: profile.crewColor ?? "#7c3aed", background: `${profile.crewColor ?? "#7c3aed"}22` }}>
          <div className="font-display text-xl text-rush-navy">{profile.crewName}</div>
          <div className="text-xs text-rush-navy/60">Tag: [{profile.crewTag}]</div>
        </div>
      ) : showCreate ? (
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm" placeholder="Crew name" />
          <input value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} maxLength={3} className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm font-bold uppercase" placeholder="TAG" />
          <button onClick={createCrew} disabled={busy} className="w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase text-white">{busy ? "Creating…" : "Create Crew"}</button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-3 text-5xl">👥</div>
          <button onClick={() => setShowCreate(true)} className="rounded-2xl bg-rush-purple px-6 py-3 text-sm font-bold uppercase text-white">+ Create a Crew</button>
        </div>
      )}
    </OverlaySheet>
  );
}

function MotorParkOverlay({ profile, onClose }: { profile: PlayerProfile; onClose: () => void }) {
  const inputRef = useRef({ x: 0, y: 0, boost: false });
  const [riding, setRiding] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("🏍️");
  const [showPhoneInWorld, setShowPhoneInWorld] = useState(false);

  // Vehicles the player owns (from unlocked items)
  const ownedVehicles = [
    { id: "okada", name: "Okada", emoji: "🏍️", color: "#ff6a1a" },
    ...(profile.unlocked ?? []).includes("danfo") ? [{ id: "danfo", name: "Danfo", emoji: "🚌", color: "#ffc531" }] : [],
    ...(profile.unlocked ?? []).includes("keke") ? [{ id: "keke", name: "Keke", emoji: "🛺", color: "#ff6a1a" }] : [],
    ...(profile.unlocked ?? []).includes("cab") ? [{ id: "cab", name: "Cab", emoji: "🚕", color: "#ffc531" }] : [],
    ...(profile.unlocked ?? []).includes("sedan") ? [{ id: "sedan", name: "Sedan", emoji: "🚗", color: "#1e3a5f" }] : [],
    ...(profile.unlocked ?? []).includes("suv") ? [{ id: "suv", name: "SUV", emoji: "🚙", color: "#14213d" }] : [],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-rush-sky">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-rush-navy">Loading the streets…</div>}>
        <City avatar={profile.avatar} quality={profile.graphicsQuality} riding={riding} inputRef={inputRef} />
      </Suspense>

      {/* Top bar */}
      <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
        <button onClick={onClose} className="rush-glass-pill flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rush-navy active:scale-95">← Home</button>
        <div className="rush-glass-pill px-3 py-2 text-xs font-bold text-rush-navy">🛺 Motor Park</div>
        <div className="rush-glass-pill px-3 py-2 text-xs font-bold text-rush-navy">{selectedVehicle} {riding ? "Riding" : "Walking"}</div>
      </div>

      {/* Floating phone button — top right */}
      <button
        onClick={() => setShowPhoneInWorld((s) => !s)}
        className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full rush-glass-pill text-lg active:scale-90"
      >
        📱
      </button>

      {/* Phone overlay in world */}
      {showPhoneInWorld && (
        <div className="absolute right-3 top-16 z-40 w-72 rush-bounce-in">
          <div className="rush-card max-h-[60vh] overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Quick Phone</span>
              <button onClick={() => setShowPhoneInWorld(false)} className="text-rush-navy/40">✕</button>
            </div>
            <div className="space-y-2">
              <button onClick={() => { setShowPhoneInWorld(false); setTab("phone"); onClose(); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">💬</span>
                <span className="text-xs font-bold text-rush-navy">Messages</span>
              </button>
              <button onClick={() => { setShowPhoneInWorld(false); setTab("phone"); onClose(); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">🏦</span>
                <span className="text-xs font-bold text-rush-navy">Bank</span>
              </button>
              <button onClick={() => { setShowPhoneInWorld(false); setTab("map"); onClose(); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">🗺️</span>
                <span className="text-xs font-bold text-rush-navy">Map / Ask Location</span>
              </button>
              <button onClick={() => { setShowPhoneInWorld(false); setTab("phone"); onClose(); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">🛺</span>
                <span className="text-xs font-bold text-rush-navy">Ride — Call Okada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED joystick — bottom-left, always visible */}
      <Joystick inputRef={inputRef} />

      {/* Action buttons — bottom-right */}
      <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-2">
        {/* Boost */}
        <button
          onPointerDown={(e) => { e.preventDefault(); inputRef.current.boost = true; }}
          onPointerUp={() => { inputRef.current.boost = false; }}
          onPointerLeave={() => { inputRef.current.boost = false; }}
          className="flex h-16 w-16 touch-none items-center justify-center rounded-full bg-rush-green text-2xl text-white shadow-lg shadow-rush-green/30 active:scale-95"
          style={{ touchAction: "none" }}
        >
          ⚡
        </button>
        {/* Ride / vehicle toggle */}
        <button onClick={() => setRiding((r) => !r)} className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg active:scale-95 ${riding ? "bg-rush-orange text-white" : "rush-glass-pill"}`}>
          {riding ? "🛑" : selectedVehicle}
        </button>
        {/* Vehicle picker */}
        <button onClick={() => setShowVehiclePicker((s) => !s)} className="flex h-12 w-12 items-center justify-center rounded-full rush-glass-pill text-lg active:scale-95">
          🚗
        </button>
      </div>

      {/* Vehicle picker sheet */}
      {showVehiclePicker && (
        <div className="absolute inset-x-0 bottom-20 z-40 mx-auto max-w-md px-4">
          <div className="rush-bounce-in rush-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rush-navy/60">Select Vehicle</span>
              <button onClick={() => setShowVehiclePicker(false)} className="text-rush-navy/40">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ownedVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVehicle(v.emoji); setShowVehiclePicker(false); setRiding(true); }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 active:scale-95 ${selectedVehicle === v.emoji ? "border-rush-green bg-rush-green/10" : "border-transparent bg-white/80"}`}
                >
                  <span className="text-2xl">{v.emoji}</span>
                  <span className="text-[9px] font-bold text-rush-navy">{v.name}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[9px] text-rush-navy/40">Buy more vehicles in the Market!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RaceResultOverlay({ result, profile, onClose }: { result: import("@/game/AfroRushScene").RaceResult; profile: PlayerProfile; onClose: () => void }) {
  const won = result.finished;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="rush-bounce-in rush-card w-full max-w-sm p-6 text-center">
        <h2 className="font-display text-3xl" style={{ color: won ? "#1fb86f" : "#ef4444" }}>{won ? "Victory!" : result.reason === "caught" ? "Busted!" : "Wrecked!"}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Score" value={result.score.toLocaleString()} />
          <Stat label="Distance" value={`${result.distance}m`} />
          <Stat label="Cash" value={`+₦${result.cashEarned}`} />
          <Stat label="Rep" value={`+${result.repEarned}`} />
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">Back to Home</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-rush-cream/50 p-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">{label}</div>
      <div className="font-mono text-sm font-bold text-rush-navy">{value}</div>
    </div>
  );
}
