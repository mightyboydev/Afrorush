"use client";

// src/components/MapScreen.tsx — City map with tappable locations.
// Shows your House, your Garage, other players' houses (with Challenge to Race),
// and the city locations.

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { type PlayerProfile } from "@/lib/storage";
import { subscribeToOnlinePlayers } from "@/lib/firestore";

export interface MapScreenProps {
  profile: PlayerProfile;
  onVisitLocation?: (id: string) => void;
  onChallengePlayer?: (uid: string, username: string) => void;
  onlineCount?: number;
}

interface LocationInfo {
  id: string;
  name: string;
  emoji: string;
  color: string;
  desc: string;
  x: number; // % position on map
  y: number;
  locked?: boolean;
  isHouse?: boolean;
  isGarage?: boolean;
}

// City map layout — locations positioned on a grid
const LOCATIONS: LocationInfo[] = [
  // Core game locations
  { id: "motor-park", name: "Motor Park", emoji: "🛺", color: "#1fb86f", desc: "Social hub. Okadas, danfos, keke.", x: 50, y: 50 },
  { id: "my-house", name: "My House", emoji: "🏠", color: "#1fb86f", desc: "Your apartment. Rest, change outfits.", x: 42, y: 42, isHouse: true },
  { id: "my-garage", name: "My Garage", emoji: "🔧", color: "#ff6a1a", desc: "Customize your bike & outfit.", x: 25, y: 30, isGarage: true },
  { id: "race-track", name: "Race Track", emoji: "🏁", color: "#ffc531", desc: "Street, Delivery, Police Chase, Freestyle.", x: 75, y: 30 },
  { id: "market", name: "Balogun Market", emoji: "🛍️", color: "#c026d3", desc: "Buy items with Naira and gold.", x: 25, y: 70 },
  { id: "suya-spot", name: "Suya Spot", emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward + food buffs.", x: 75, y: 70 },
  { id: "crew-hq", name: "Crew HQ", emoji: "👥", color: "#7c3aed", desc: "Manage crew, crew wars.", x: 50, y: 15 },
  // Nigerian real places
  { id: "stadium", name: "National Stadium", emoji: "🏟️", color: "#1fb86f", desc: "Lagos National Stadium, Surulere.", x: 15, y: 25 },
  { id: "quilox", name: "Quilox Club", emoji: "🎉", color: "#ff6a1a", desc: "Lagos hottest nightclub. Victoria Island.", x: 85, y: 20 },
  { id: "church", name: "Cathedral", emoji: "⛪", color: "#16a3b1", desc: "Holy Cross Cathedral, Lagos.", x: 12, y: 40 },
  { id: "mosque", name: "Central Mosque", emoji: "🕌", color: "#16a3b1", desc: "Lagos Central Mosque, Lagos Island.", x: 88, y: 40 },
  { id: "lagoon", name: "Lagos Lagoon", emoji: "🌊", color: "#0ea5e9", desc: "Relaxed waterfront, hidden collectibles.", x: 50, y: 88 },
  { id: "airport", name: "Murtala Airport", emoji: "✈️", color: "#14213d", desc: "Murtala Muhammed Airport, Ikeja.", x: 12, y: 88 },
  { id: "lekki", name: "Lekki Bridge", emoji: "🌉", color: "#7c3aed", desc: "Lekki-Ikoyi Link Bridge.", x: 88, y: 88 },
  { id: "unilag", name: "UNILAG", emoji: "🎓", color: "#ffc531", desc: "University of Lagos, Akoka.", x: 65, y: 15 },
  { id: "eaton", name: "Eko Hotel", emoji: "🏨", color: "#c026d3", desc: "Eko Hotel & Suites, Victoria Island.", x: 35, y: 15 },
];

// Player house positions on the map (scattered around the city)
const HOUSE_POSITIONS = [
  { x: 18, y: 12 }, { x: 82, y: 12 }, { x: 38, y: 42 }, { x: 62, y: 42 },
  { x: 8, y: 30 }, { x: 92, y: 30 }, { x: 8, y: 70 }, { x: 92, y: 70 },
];

interface PlayerHouse {
  uid: string;
  username: string;
  crewTag: string | null;
  crewColor: string | null;
  photoURL: string | null;
  x: number;
  y: number;
}

export default function MapScreen({ profile, onVisitLocation, onChallengePlayer, onlineCount = 0 }: MapScreenProps) {
  const [selected, setSelected] = useState<LocationInfo | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<PlayerHouse | null>(null);
  const [animatedOnline, setAnimatedOnline] = useState(onlineCount);
  const [onlinePlayers, setOnlinePlayers] = useState<PlayerHouse[]>([]);

  // Subscribe to online players (for houses on the map)
  useEffect(() => {
    return subscribeToOnlinePlayers((players) => {
      const houses: PlayerHouse[] = players
        .filter((p) => p.uid !== profile.uid)
        .slice(0, 8)
        .map((p, i) => ({
          ...p,
          x: HOUSE_POSITIONS[i % HOUSE_POSITIONS.length].x,
          y: HOUSE_POSITIONS[i % HOUSE_POSITIONS.length].y,
        }));
      setOnlinePlayers(houses);
    });
  }, [profile.uid]);

  useEffect(() => {
    if (onlineCount > 0) { setAnimatedOnline(onlineCount); return; }
    const n = 1247 + Math.floor(Math.random() * 50);
    setAnimatedOnline(n);
    const id = setInterval(() => {
      setAnimatedOnline((v) => Math.max(800, v + Math.floor((Math.random() - 0.4) * 8)));
    }, 3000);
    return () => clearInterval(id);
  }, [onlineCount]);

  const handleVisit = (id: string) => {
    if (id === "my-garage") { onVisitLocation?.("garage"); return; }
    onVisitLocation?.(id);
  };

  // Filter chips (like Lagos Life)
  const FILTERS = [
    { id: "all", label: "All", icon: "📍" },
    { id: "social", label: "Social", icon: "🎉" },
    { id: "homes", label: "Homes", icon: "🏠" },
    { id: "food", label: "Food", icon: "🍢" },
    { id: "religion", label: "Faith", icon: "⛪" },
  ];
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="rush-slide-up min-h-screen pb-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Explore</div>
          <h2 className="font-display text-2xl text-rush-navy">Lagos City</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full rush-glass-pill px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-rush-green rush-pulse" />
          <span className="text-xs font-bold text-rush-navy">{animatedOnline > 0 ? animatedOnline.toLocaleString() : "—"} online</span>
        </div>
      </div>

      {/* Filter chips (like Lagos Life) */}
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeFilter === f.id ? "bg-rush-navy text-white" : "bg-white/80 text-rush-navy/60"
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative mb-4 overflow-hidden rounded-3xl rush-soft-shadow" style={{ aspectRatio: "1 / 1" }}>
        {/* Map background — 3D-style gradient with depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6ba83a] via-[#7ec050] to-[#5a9030]" />
        {/* Water (lagoon) */}
        <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-b from-[#2196f3]/90 to-[#1565c0]" />
        {/* Roads — grid pattern with shadows for depth */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Main roads with shadow */}
          <rect x="0" y="46" width="100" height="6" fill="#1a1a1e" />
          <rect x="0" y="47" width="100" height="0.6" fill="#ffc531" opacity="0.9" />
          <rect x="0" y="51" width="100" height="0.6" fill="#ffc531" opacity="0.9" />
          <rect x="46" y="0" width="6" height="100" fill="#1a1a1e" />
          <rect x="47" y="0" width="0.6" height="100" fill="#ffc531" opacity="0.9" />
          <rect x="51" y="0" width="0.6" height="100" fill="#ffc531" opacity="0.9" />
          {/* Secondary roads */}
          <rect x="0" y="27" width="100" height="2.5" fill="#2a2a2e" />
          <rect x="0" y="69" width="100" height="2.5" fill="#2a2a2e" />
          <rect x="27" y="0" width="2.5" height="100" fill="#2a2a2e" />
          <rect x="69" y="0" width="2.5" height="100" fill="#2a2a2e" />
          {/* Building blocks — subtle dark rectangles for 3D feel */}
          <rect x="52" y="30" width="14" height="16" fill="#5a8a3a" opacity="0.4" rx="1" />
          <rect x="30" y="52" width="14" height="14" fill="#5a8a3a" opacity="0.4" rx="1" />
          <rect x="52" y="52" width="14" height="14" fill="#5a8a3a" opacity="0.4" rx="1" />
          <rect x="2" y="2" width="22" height="22" fill="#4a7a2a" opacity="0.3" rx="1" />
          <rect x="72" y="2" width="22" height="22" fill="#4a7a2a" opacity="0.3" rx="1" />
        </svg>

        {/* Location pins */}
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelected(loc)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-base shadow-lg transition-transform active:scale-110"
              style={{ background: loc.locked ? "#6b7280" : loc.color }}
            >
              {loc.locked ? "🔒" : loc.emoji}
            </div>
            <span className="rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-rush-navy shadow-sm backdrop-blur">
              {loc.name}
            </span>
            {!loc.locked && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-rush-green" />
            )}
          </button>
        ))}

        {/* My House — special pin at center */}
        <button
          onClick={() => setSelected({ id: "my-house", name: "My House", emoji: "🏠", color: "#1fb86f", desc: "Your apartment. Rest to restore energy.", x: 50, y: 50, isHouse: true })}
          className="absolute left-[42%] top-[42%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-rush-gold bg-rush-green text-lg shadow-lg shadow-rush-green/40">
            🏠
          </div>
          <span className="rounded-full bg-rush-gold px-1.5 py-0.5 text-[8px] font-bold text-rush-navy shadow-sm">
            My House
          </span>
        </button>

        {/* Other players' houses */}
        {onlinePlayers.map((p) => (
          <button
            key={p.uid}
            onClick={() => setSelectedHouse(p)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className="relative">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm shadow-lg"
                style={{ background: p.crewColor ?? "#7c3aed" }}
              >
                🏠
              </div>
              {/* Player avatar bubble */}
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rush-green text-[8px] font-bold text-white">
                {p.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="max-w-[50px] truncate rounded-full bg-white/90 px-1 py-0.5 text-[7px] font-bold text-rush-navy shadow-sm">
              {p.username}
            </span>
          </button>
        ))}

        {/* Player position marker (center = Motor Park) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 animate-ping rounded-full bg-rush-orange/40" />
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rush-orange shadow-lg">
            <span className="text-[8px]">🧍</span>
          </div>
        </div>
      </div>

      {/* Selected location detail */}
      {selected && (
        <div className="rush-bounce-in rush-glass mb-3 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ background: `${selected.color}33`, color: selected.color }}
            >
              {selected.locked ? "🔒" : selected.emoji}
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-rush-navy">{selected.name}</div>
              <p className="text-xs text-rush-navy/60">{selected.desc}</p>
            </div>
            <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-cream text-rush-navy">✕</button>
          </div>
          {!selected.locked && (
            <button
              onClick={() => { handleVisit(selected.id); setSelected(null); }}
              className="mt-3 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 active:scale-95"
            >
              Visit {selected.name} →
            </button>
          )}
          {selected.locked && (
            <div className="mt-3 w-full rounded-2xl bg-rush-cream/50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-rush-navy/50">
              Coming Soon
            </div>
          )}
        </div>
      )}

      {/* Selected player house detail */}
      {selectedHouse && (
        <div className="rush-bounce-in rush-glass mb-3 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
              style={{ background: selectedHouse.crewColor ?? "#7c3aed" }}
            >
              {selectedHouse.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-rush-navy">{selectedHouse.username}&apos;s House</div>
              <p className="text-xs text-rush-navy/60">
                {selectedHouse.crewTag ? `Crew [${selectedHouse.crewTag}]` : "No crew"} · Tap to challenge
              </p>
            </div>
            <button onClick={() => setSelectedHouse(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-cream text-rush-navy">✕</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => { onVisitLocation?.("motor-park"); setSelectedHouse(null); }}
              className="rounded-2xl bg-rush-navy px-4 py-3 text-sm font-bold uppercase tracking-wider text-white active:scale-95"
            >
              🚪 Visit
            </button>
            <button
              onClick={() => { onChallengePlayer?.(selectedHouse.uid, selectedHouse.username); setSelectedHouse(null); }}
              className="rounded-2xl bg-rush-orange px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-orange/30 active:scale-95"
            >
              🏁 Challenge
            </button>
          </div>
        </div>
      )}

      {/* Online players count + legend */}
      <div className="flex items-center justify-between text-[10px] text-rush-navy/50">
        <span>🟢 {onlinePlayers.length} riders nearby</span>
        <span>🏠 = player house</span>
      </div>
    </div>
  );
}
