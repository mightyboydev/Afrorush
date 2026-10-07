"use client";

// src/app/hub/page.tsx — Home screen: 3D room, needs bars, top bar, bottom nav.
// Phase 1 of the life-sim restyle.

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import SafeCanvas from "@/components/SafeCanvas";
import { ShareHandleButton } from "@/components/PhoneScreen";

// 3D Home Room — heavy, ssr:false
const HomeRoom = lazy(() => import("@/world/HomeRoom"));
const Race3D = lazy(() => import("@/components/Race3D"));
const City = lazy(() => import("@/world/City"));
const CharacterPreview3D = lazy(() => import("@/components/CharacterPreview"));
const MultiplayerRace = lazy(() => import("@/components/MultiplayerRace"));

const LOCATIONS = [
  // Lagos hubs
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
  // Kaduna hubs
  { id: "kaduna-park", name: "Kaduna Motor Park", emoji: "🚐", color: "#7c3aed", desc: "Wuse park · northern okada + go-slow." },
  { id: "ahmadu-bello", name: "ABU Zaria", emoji: "🎓", color: "#1fb86f", desc: "Ahmadu Bello University · samaru campus." },
  { id: "murtala-square", name: "Murtala Square", emoji: "🏟️", color: "#ff6a1a", desc: "Sports + recreation ground, Kaduna." },
  { id: "kaduna-mall", name: "Kaduna Mega Mall", emoji: "🏬", color: "#c026d3", desc: "Shoprite + cinema · biggest in the north." },
  { id: "hamdala", name: "Hamdala Hotel", emoji: "🏨", color: "#ffc531", desc: "Legendary hotel on Ahmadu Bello Way." },
  { id: "kaduna-river", name: "River Kaduna", emoji: "🐊", color: "#16a3b1", desc: "Crocodile-infested · bridge views." },
  // Abuja hubs (extra)
  { id: "abuja-city-gate", name: "City Gate", emoji: "🚪", color: "#16a3b1", desc: "Iconic Abuja welcome arch." },
  { id: "wuse-market", name: "Wuse Market", emoji: "🛍️", color: "#c026d3", desc: "Biggest market in the capital." },
];

type Overlay = "race-mode" | "shop" | "suya" | "crew" | "motor-park" | "mp-lobby" | null;

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
  const [mpRoomCode, setMpRoomCode] = useState<string | null>(null);

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
      <main className="page-bg-day flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-rush-leaf border-t-transparent" />
          <div className="text-sm uppercase tracking-widest text-rush-ink-soft">Loading your home…</div>
        </div>
      </main>
    );
  }

  const lvl = levelFromRep(profile.rep);
  const hour = new Date().getHours();
  // Simple weather mock — based on hour (Lagos is mostly sunny/humid)
  const weather =
    hour >= 6 && hour < 18
      ? { emoji: "☀️", text: "Sunny" }
      : { emoji: "🌙", text: "Clear" };
  const clock = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Lagos Life state flags
  const isJailed = profile.jailedUntil && profile.jailedUntil > Date.now();
  const isStranded = profile.cash <= 0 && !isJailed;
  const isNepo = profile.birthClass === "nepo";
  const hasLoan = !!profile.activeLoan;

  return (
    <main className="page-bg-day relative min-h-screen overflow-hidden">
      {/* Decorative clouds (matches Landing page) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-16 w-32 rounded-full bg-white/80 blur-md rush-float" />
        <div className="absolute right-[15%] top-[15%] h-12 w-24 rounded-full bg-white/70 blur-md rush-float" style={{ animationDelay: "1s" }} />
        <div className="absolute left-[60%] top-[5%] h-20 w-40 rounded-full bg-white/60 blur-md rush-float" style={{ animationDelay: "2s" }} />
      </div>
      {/* 3D Home Room — always rendered, behind UI. Wrapped in SafeCanvas
          so a Three.js / WebGL crash never takes down the whole hub. */}
      <div className="fixed inset-0 z-0">
        <SafeCanvas
          fallback={
            <div className="page-bg-day flex h-full w-full flex-col items-center justify-center text-center">
              <div className="text-7xl" style={{ filter: "drop-shadow(0 8px 12px rgba(20,33,61,0.2))" }}>🏍️💨</div>
              <p className="mt-3 px-6 text-xs text-rush-ink-soft">
                3D no dey your phone, but you fit still play AfroRush — the rest of the app dey work fine!
              </p>
            </div>
          }
        >
          <Suspense fallback={<div className="flex h-full items-center justify-center text-rush-navy/40">Loading room…</div>}>
            <HomeRoom avatar={profile.avatar} quality={profile.graphicsQuality} />
          </Suspense>
        </SafeCanvas>
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

      {/* Top status bar — Lagos Life style: ONE compact row + scrollable chip ticker + single status banner */}
      {!cleanScreen && (
        <header className="fixed inset-x-0 top-0 z-30 safe-pt">
          {/* === Row 1 — single panel bar (avatar | time/weather | dividers | wallet) === */}
          <div className="mx-auto flex max-w-md px-2.5 pt-2">
            <div className="panel rush-glass flex h-12 w-full items-center gap-1 rounded-full py-1 pl-1 pr-1">
              {/* Avatar + level (tap = logout menu) */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn-press flex h-full items-center gap-2 rounded-full py-0.5 pl-1 pr-2 hover:bg-rush-mist/40"
                aria-label="Profile menu"
              >
                <div className="relative">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{
                      background: profile.avatar?.skinTone ?? "#c68642",
                      boxShadow: "rgb(34, 197, 94) 0px 0px 0px 3px inset", // online ring
                    }}
                  >
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-bold text-rush-ink tabular-nums">
                    {clock}
                    <span className="ml-1">{weather.emoji}</span>
                  </div>
                  <div className="text-[9px] font-medium text-rush-ink-soft">
                    {levelTitle(lvl)} · Lvl {lvl}
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div className="h-5 w-px bg-rush-ink/10" />

              {/* Birth class chip (Nepo/Lapo) */}
              <div
                className={`flex h-full items-center rounded-full px-2 text-[10px] font-bold ${
                  isNepo ? "bg-rush-amber/15 text-rush-amber-deep" : "bg-rush-ink/8 text-rush-ink"
                }`}
                title={isNepo ? "Nepo Baby — born with silver spoon" : "Lapo Baby — hustler from day one"}
              >
                {isNepo ? "👶 Nepo" : "💪 Lapo"}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Wallet button (right) */}
              <button
                onClick={() => setTab("phone")}
                className="btn-press ml-1 flex h-full items-center gap-1.5 rounded-full bg-rush-mist pr-1 pl-3 hover:bg-rush-mist/80"
                aria-label="Open Bank to send or top up"
              >
                <span className="text-[13px] font-bold text-rush-amber-deep tabular-nums">
                  ₦{formatNaira(profile.cash)}
                </span>
                {/* Plus button — green circle */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rush-leaf text-white">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>

          {/* === Row 2 — horizontally scrollable chip ticker (online / city / streak / rep / handle) === */}
          <div className="mx-auto max-w-md px-2.5 pt-1.5">
            <div className="no-scrollbar flex w-max gap-1.5 overflow-x-auto pb-0.5">
              {/* Online */}
              <div className="rush-glass-pill flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-rush-leaf-deep">
                <span className="rush-online-dot" />
                <span className="tabular-nums">{onlineCount.toLocaleString()} online</span>
              </div>
              {/* Home city */}
              <div className="rush-glass-pill flex shrink-0 items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rush-ink">
                <span>📍</span>
                <span className="uppercase">{(profile.city ?? "lagos").replace(/^\w/, (c) => c.toUpperCase())}</span>
              </div>
              {/* Streak */}
              <div className="rush-glass-pill flex shrink-0 items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rush-ink">
                <span>🔥</span>
                <span className="tabular-nums">{profile.loginStreak || 1} day</span>
              </div>
              {/* Rep */}
              <div className="rush-glass-pill flex shrink-0 items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rush-ink">
                <span>🏆</span>
                <span className="tabular-nums">{profile.rep.toLocaleString()}</span>
              </div>
              {/* Handle + share buttons */}
              <div className="rush-glass-pill flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-rush-ink">
                <span className="text-rush-ink-soft">@{profile.username}</span>
                <ShareHandleButton username={profile.username} cash={profile.cash} />
              </div>
            </div>
          </div>

          {/* === Row 3 — single status banner (jailed / stranded / loan / nothing) === */}
          {isJailed && (
            <div className="mx-auto mt-1.5 max-w-md px-2.5">
              <div className="flex items-center gap-2 rounded-2xl bg-rush-rose/95 px-3 py-2 text-white shadow-lg">
                <span className="text-lg">🚔</span>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider">You dey inside cell</div>
                  <div className="text-[9px] text-white/80">{profile.jailedReason}</div>
                </div>
                <div className="text-[10px] font-bold tabular-nums">
                  {Math.ceil(((profile.jailedUntil ?? 0) - Date.now()) / 60000)}m
                </div>
              </div>
            </div>
          )}
          {isStranded && !isJailed && (
            <div className="mx-auto mt-1.5 max-w-md px-2.5">
              <button
                onClick={() => setTab("phone")}
                className="btn-press flex w-full items-center gap-2 rounded-2xl bg-rush-sunset/95 px-3 py-2 text-white shadow-lg"
              >
                <span className="text-lg">😅</span>
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider">You dey stranded!</div>
                  <div className="text-[9px] text-white/90">Cash = 0. Take loan for Buka/phone to bounce back.</div>
                </div>
                <span className="text-[10px] font-bold">Open Phone →</span>
              </button>
            </div>
          )}
          {hasLoan && !isJailed && !isStranded && (
            <div className="mx-auto mt-1.5 max-w-md px-2.5">
              <div className="flex items-center gap-2 rounded-2xl bg-rush-rose/15 px-3 py-2 ring-1 ring-rush-rose/30">
                <span className="text-base">💸</span>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rush-rose">Active loan</div>
                  <div className="text-[9px] text-rush-ink-soft">
                    ₦{profile.activeLoan!.totalOwed.toLocaleString()} owed · 5%/hr — pay quick!
                  </div>
                </div>
                <button
                  onClick={() => setTab("phone")}
                  className="btn-press rounded-full bg-rush-rose px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white"
                >
                  Pay →
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Tab content — pushed below the fixed top status bar.
          Home tab: only needs + small task/gem cards (locations live in Map tab).
          Other tabs scroll normally. */}
      <div className={`relative z-10 overflow-y-auto px-3 pb-24 pt-[150px] transition-opacity ${cleanScreen ? "opacity-0 pointer-events-none" : ""}`}>
        {tab === "home" && (
          <div className="mx-auto max-w-md space-y-2">
            {/* Lagos Life vitals — stamina / hunger / street_cred */}
            <div className="grid grid-cols-3 gap-1.5">
              <VitalCard label="Stamina" value={profile.vitals?.stamina ?? 80} color="#22b573" icon="⚡" />
              <VitalCard label="Hunger" value={profile.vitals?.hunger ?? 20} color="#f59e42" icon="🍽️" inverted />
              <VitalCard label="Cred" value={profile.vitals?.street_cred ?? 10} color="#7c3aed" icon="💯" />
            </div>

            {/* Needs — compact circular ring row */}
            <NeedsBar profile={profile} />

            {/* Today's task + Gem hunt — small secondary cards */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOverlay("suya")}
                className="panel rush-glass btn-press flex flex-col gap-1 p-2.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-rush-ink-soft">Today&apos;s Task</span>
                  <span className="text-[8px] font-bold text-rush-amber-deep tabular-nums">+₦500</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🍢</span>
                  <span className="text-[10px] font-bold text-rush-ink">Visit Suya Spot</span>
                </div>
              </button>
              <button
                onClick={() => setTab("map")}
                className="panel rush-glass btn-press flex flex-col gap-1 p-2.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-rush-ink-soft">Daily Gems</span>
                  <span className="text-[8px] font-bold text-rush-purple tabular-nums">💎 {profile.gemsFound?.length || 0}/5</span>
                </div>
                <p className="text-[9px] leading-tight text-rush-ink-soft">Find hidden gems in the city — open Map</p>
              </button>
            </div>

            {/* Quick action — open Map to see all locations */}
            <button
              onClick={() => setTab("map")}
              className="panel rush-glass btn-press flex w-full items-center justify-between p-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-rush-ink">Explore Lagos</div>
                  <div className="text-[9px] text-rush-ink-soft">Motor Park · Garage · Race Track · Market · Crew HQ</div>
                </div>
              </div>
              <span className="text-rush-ink-soft">→</span>
            </button>
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
        <RaceModePicker onClose={() => setOverlay(null)} onPick={(mode) => { setRaceMode(mode); setOverlay(null); }} onMultiplayer={() => { setOverlay("mp-lobby"); }} />
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
        <MotorParkOverlay profile={profile} unlocked={unlocked} onClose={() => setOverlay(null)} onNavigate={(t) => { setOverlay(null); setTab(t); }} />
      )}
      {overlay === "mp-lobby" && (
        <MultiplayerLobby
          profile={profile}
          onClose={() => setOverlay(null)}
          onJoinRoom={(code) => { setOverlay(null); setMpRoomCode(code); }}
        />
      )}

      {/* Multiplayer Race — canvas + Firestore room sync */}
      {mpRoomCode && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] flex items-center justify-center text-white">Loading multiplayer…</div>}>
          <MultiplayerRace
            roomCode={mpRoomCode}
            profile={profile}
            onExit={() => setMpRoomCode(null)}
          />
        </Suspense>
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
          <a href="/about" className="hover:text-rush-navy">About</a>
          <span>·</span>
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

function RaceModePicker({ onClose, onPick, onMultiplayer }: { onClose: () => void; onPick: (mode: "street-race" | "delivery-rush" | "police-chase" | "freestyle-run") => void; onMultiplayer: () => void }) {
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
          {/* Multiplayer — featured at top */}
          <button onClick={onMultiplayer} className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-rush-green/20 to-rush-jade/20 p-3 ring-2 ring-rush-green/40 active:scale-95">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: "#1fb86f22" }}>👥</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-rush-navy">Multiplayer Race</div>
              <div className="text-[10px] text-rush-navy/60">Race friends live · room code · serverless</div>
            </div>
            <span className="rounded-full bg-rush-green px-2 py-0.5 text-[8px] font-bold uppercase text-white">New</span>
          </button>
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

// ---------- Multiplayer Lobby — create or join a room ----------
function MultiplayerLobby({ profile, onClose, onJoinRoom }: { profile: PlayerProfile; onClose: () => void; onJoinRoom: (code: string) => void }) {
  const [joinCode, setJoinCode] = useState("");
  const [track, setTrack] = useState<"third_mainland" | "ikeja_traffic" | "vi_beach">("third_mainland");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {
    setBusy(true); setError(null);
    try {
      const { createRaceRoom } = await import("@/lib/firestore");
      const code = await createRaceRoom(profile, track);
      onJoinRoom(code);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const joinRoom = async () => {
    if (!joinCode.trim()) { setError("Enter room code"); return; }
    setBusy(true); setError(null);
    try {
      const { joinRaceRoom } = await import("@/lib/firestore");
      await joinRaceRoom(profile, joinCode.trim());
      onJoinRoom(joinCode.trim().toUpperCase());
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const tracks: Array<{ id: typeof track; name: string; emoji: string; desc: string }> = [
    { id: "third_mainland", name: "Third Mainland Bridge", emoji: "🌉", desc: "Longest bridge · fast straight" },
    { id: "ikeja_traffic", name: "Ikeja Traffic", emoji: "🚦", desc: "Tight lanes · more obstacles" },
    { id: "vi_beach", name: "V/I Beach Road", emoji: "🏖️", desc: "Coastal cruise · smooth" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="rush-bounce-in rush-card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-rush-navy">Multiplayer Race</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-rush-cream text-rush-navy">✕</button>
        </div>

        {/* Create room */}
        <div className="mb-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Create New Room</div>
          <div className="mb-2 grid grid-cols-3 gap-1.5">
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrack(t.id)}
                className={`rounded-xl p-2 text-center transition-all ${track === t.id ? "bg-rush-green/15 ring-2 ring-rush-green" : "bg-white"}`}
              >
                <div className="text-lg">{t.emoji}</div>
                <div className="text-[8px] font-bold text-rush-navy">{t.name.split(" ")[0]}</div>
              </button>
            ))}
          </div>
          <button onClick={createRoom} disabled={busy} className="w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50">
            {busy ? "Creating…" : "🏁 Create Room"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-rush-cream" />
          <span className="text-[9px] uppercase tracking-wider text-rush-navy/40">or</span>
          <div className="h-px flex-1 bg-rush-cream" />
        </div>

        {/* Join room */}
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Join with Code</div>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ENTER 6-CHAR CODE"
            className="mb-2 w-full rounded-xl border-2 border-rush-cream bg-white px-3 py-2.5 text-center font-mono text-lg tracking-widest text-rush-navy placeholder:text-rush-navy/30 focus:border-rush-green focus:outline-none"
          />
          <button onClick={joinRoom} disabled={busy} className="w-full rounded-2xl bg-rush-navy px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50">
            {busy ? "Joining…" : "→ Join Room"}
          </button>
        </div>

        {error && <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

        {/* How to share */}
        <p className="mt-3 text-center text-[9px] text-rush-navy/40">
          After creating, share the room code with your friends on WhatsApp/X. Dem go open AfroRush, tap Multiplayer, enter code, race! 🏍️💨
        </p>
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

function MotorParkOverlay({ profile, unlocked, onClose, onNavigate }: { profile: PlayerProfile; unlocked: string[]; onClose: () => void; onNavigate: (tab: Tab) => void }) {
  const inputRef = useRef({ x: 0, y: 0, boost: false });
  const [riding, setRiding] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("🏍️");
  const [showPhoneInWorld, setShowPhoneInWorld] = useState(false);

  // Vehicles the player owns (from unlocked items)
  const ownedVehicles = [
    { id: "okada", name: "Okada", emoji: "🏍️", color: "#ff6a1a" },
    ...unlocked.includes("danfo") ? [{ id: "danfo", name: "Danfo", emoji: "🚌", color: "#ffc531" }] : [],
    ...unlocked.includes("keke") ? [{ id: "keke", name: "Keke", emoji: "🛺", color: "#ff6a1a" }] : [],
    ...unlocked.includes("cab") ? [{ id: "cab", name: "Cab", emoji: "🚕", color: "#ffc531" }] : [],
    ...unlocked.includes("sedan") ? [{ id: "sedan", name: "Sedan", emoji: "🚗", color: "#1e3a5f" }] : [],
    ...unlocked.includes("suv") ? [{ id: "suv", name: "SUV", emoji: "🚙", color: "#14213d" }] : [],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-rush-sky" style={{ width: "100vw", height: "100vh" }}>
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
              <button onClick={() => { setShowPhoneInWorld(false); onNavigate("phone"); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">💬</span>
                <span className="text-xs font-bold text-rush-navy">Messages</span>
              </button>
              <button onClick={() => { setShowPhoneInWorld(false); onNavigate("phone"); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">🏦</span>
                <span className="text-xs font-bold text-rush-navy">Bank</span>
              </button>
              <button onClick={() => { setShowPhoneInWorld(false); onNavigate("map"); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
                <span className="text-lg">🗺️</span>
                <span className="text-xs font-bold text-rush-navy">Map / Ask Location</span>
              </button>
              <button onClick={() => { setShowPhoneInWorld(false); onNavigate("phone"); }} className="flex w-full items-center gap-2 rounded-xl bg-rush-cream/50 p-2 text-left active:scale-95">
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
  const modeLabel = result.mode === "street-race" ? "Street Race"
    : result.mode === "delivery-rush" ? "Delivery Rush"
    : result.mode === "police-chase" ? "Police Chase"
    : "Freestyle Run";
  const shareText = won
    ? `🏆 I just win ${modeLabel} for AfroRush! ${result.distance}m, ${result.score.toLocaleString()} pts, +₦${result.cashEarned}. My handle na @${profile.username} — beat me if you sabi! 🏍️💨`
    : `😅 I done crash for ${modeLabel} for AfroRush — but I still stack ${result.score.toLocaleString()} pts and ₦${result.cashEarned}. Try beat my score, my handle na @${profile.username} 🏍️`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://afrorush.vercel.app";
  const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
  const shareToX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");

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

        {/* Share score — viral loop */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={shareToWhatsApp} className="flex items-center justify-center gap-1.5 rounded-2xl bg-rush-green px-4 py-3 text-xs font-bold uppercase tracking-wider text-white active:scale-95">
            💬 Share
          </button>
          <button onClick={shareToX} className="flex items-center justify-center gap-1.5 rounded-2xl bg-rush-navy px-4 py-3 text-xs font-bold uppercase tracking-wider text-white active:scale-95">
            𝕏 Tweet
          </button>
        </div>

        <button onClick={onClose} className="mt-2 w-full rounded-2xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy">Back to Home</button>
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

// ---------- Lagos Life VitalCard — small compact vital display ----------
function VitalCard({ label, value, color, icon, inverted = false }: {
  label: string;
  value: number;
  color: string;
  icon: string;
  inverted?: boolean; // true for hunger (high = bad)
}) {
  const v = Math.round(value);
  const isLow = inverted ? v > 70 : v < 30;
  return (
    <div className="panel rush-glass p-2">
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[10px]">{icon}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-rush-ink-soft">{label}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-rush-mist">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${v}%`,
            background: isLow ? "#ef5a6f" : color,
            transition: "width 0.4s ease-out, background 0.3s",
          }}
        />
      </div>
      <div className="mt-0.5 text-center text-[10px] font-bold text-rush-ink tabular-nums">{v}</div>
    </div>
  );
}
