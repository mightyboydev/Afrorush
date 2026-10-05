"use client";

// src/components/MapScreen.tsx — City map with tappable locations.
// Replaces the 3D world view when in Map tab.

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DISTRICTS, formatNaira, type PlayerProfile } from "@/lib/storage";

export interface MapScreenProps {
  profile: PlayerProfile;
  onVisitLocation?: (id: string) => void;
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
}

// City map layout — locations positioned on a grid
const LOCATIONS: LocationInfo[] = [
  { id: "motor-park", name: "Motor Park", emoji: "🛺", color: "#1fb86f", desc: "Social hub. Find crews, okadas, danfos.", x: 50, y: 50 },
  { id: "garage", name: "Garage", emoji: "🏍️", color: "#ff6a1a", desc: "Customize your bike & outfit.", x: 25, y: 30 },
  { id: "race-track", name: "Race Track", emoji: "🏁", color: "#ffc531", desc: "Street, Delivery, Police Chase, Freestyle.", x: 75, y: 30 },
  { id: "market", name: "Market", emoji: "🛍️", color: "#c026d3", desc: "Buy items with Naira and gold.", x: 25, y: 70 },
  { id: "suya-spot", name: "Suya Spot", emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward + food buffs.", x: 75, y: 70 },
  { id: "crew-hq", name: "Crew HQ", emoji: "👥", color: "#7c3aed", desc: "Manage crew, crew wars.", x: 50, y: 18 },
  { id: "radio", name: "Radio Tower", emoji: "📻", color: "#16a3b1", desc: "Naija radio + news ticker.", x: 12, y: 50 },
  { id: "billboards", name: "Billboard Blvd", emoji: "📋", color: "#14213d", desc: "Brand ad slots.", x: 88, y: 50 },
  { id: "lagoon", name: "Lagoon", emoji: "🌊", color: "#0ea5e9", desc: "Relaxed area, hidden collectibles.", x: 50, y: 85 },
  { id: "highway", name: "Highway", emoji: "🛣️", color: "#1fb86f", desc: "Open road for free riding.", x: 88, y: 85, locked: true },
  { id: "airport", name: "Airport", emoji: "✈️", color: "#14213d", desc: "Coming soon — fly to other cities.", x: 12, y: 85, locked: true },
];

export default function MapScreen({ profile, onVisitLocation, onlineCount = 0 }: MapScreenProps) {
  const [selected, setSelected] = useState<LocationInfo | null>(null);
  const [animatedOnline, setAnimatedOnline] = useState(onlineCount);

  useEffect(() => {
    if (onlineCount > 0) { setAnimatedOnline(onlineCount); return; }
    // Demo: animate fake online count
    const n = 1247 + Math.floor(Math.random() * 50);
    setAnimatedOnline(n);
    const id = setInterval(() => {
      setAnimatedOnline((v) => Math.max(800, v + Math.floor((Math.random() - 0.4) * 8)));
    }, 3000);
    return () => clearInterval(id);
  }, [onlineCount]);

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
          <span className="text-xs font-bold text-rush-navy">{animatedOnline.toLocaleString()} online</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative mb-4 overflow-hidden rounded-3xl rush-soft-shadow" style={{ aspectRatio: "1 / 1" }}>
        {/* Map background — stylized city grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8db965] via-[#a8d877] to-[#7ca85a]" />
        {/* Water (lagoon) */}
        <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-b from-[#0ea5e9]/80 to-[#0284c7]" />
        {/* Roads — grid pattern */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizontal roads */}
          <rect x="0" y="48" width="100" height="4" fill="#2a2a2e" />
          <rect x="0" y="48" width="100" height="0.5" fill="#ffc531" />
          <rect x="0" y="51.5" width="100" height="0.5" fill="#ffc531" />
          {/* Vertical road */}
          <rect x="48" y="0" width="4" height="100" fill="#2a2a2e" />
          <rect x="48" y="0" width="0.5" height="100" fill="#ffc531" />
          <rect x="51.5" y="0" width="0.5" height="100" fill="#ffc531" />
          {/* Secondary roads */}
          <rect x="0" y="28" width="100" height="2" fill="#3a3a3e" />
          <rect x="0" y="68" width="100" height="2" fill="#3a3a3e" />
          <rect x="28" y="0" width="2" height="100" fill="#3a3a3e" />
          <rect x="68" y="0" width="2" height="100" fill="#3a3a3e" />
        </svg>

        {/* Location pins */}
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelected(loc)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          >
            {/* Pin */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-base shadow-lg transition-transform active:scale-110"
              style={{ background: loc.locked ? "#6b7280" : loc.color }}
            >
              {loc.locked ? "🔒" : loc.emoji}
            </div>
            {/* Label */}
            <span className="rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-rush-navy shadow-sm backdrop-blur">
              {loc.name}
            </span>
            {/* Online indicator */}
            {!loc.locked && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-rush-green" />
            )}
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
        <div className="rush-bounce-in rush-glass rounded-3xl p-4">
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
          </div>
          {!selected.locked && (
            <button
              onClick={() => onVisitLocation?.(selected.id)}
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
    </div>
  );
}
