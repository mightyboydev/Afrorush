"use client";

// src/components/MapScreen.tsx — Illustrated Nigerian city map.
// SVG pins (no emoji), state picker + category filters wired to data/places.ts,
// bottom sheet when a pin is tapped. Dark Harmattan Dusk theme.

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { type PlayerProfile } from "@/lib/storage";
import { subscribeToOnlinePlayers } from "@/lib/firestore";
import { Panel, Pill, PrimaryButton, BottomSheet, AnimatedCounter } from "@/ui/kit";
import { getCategoryIcon, HomeIcon, CloseIcon, ChevronRightIcon, SearchIcon, MapIcon as MapIconSvg } from "@/ui/icons";
import { PLACES, STATES, getState, getPlaces, getCategoriesForState, CATEGORY_META, type StateId, type Place, type PlaceCategory } from "@/data/places";

export interface MapScreenProps {
  profile: PlayerProfile;
  onVisitLocation?: (id: string) => void;
  onChallengePlayer?: (uid: string, username: string) => void;
  onlineCount?: number;
}

const GAME_HUBS = [
  { id: "motor-park", name: "Motor Park", category: "social" as PlaceCategory, state: "lagos" as StateId, desc: "Social hub. Okadas, danfos, keke." },
  { id: "garage", name: "Garage", category: "social" as PlaceCategory, state: "lagos" as StateId, desc: "Customize your bike & outfit." },
  { id: "race-track", name: "Race Track", category: "recreation" as PlaceCategory, state: "lagos" as StateId, desc: "Street, Delivery, Police Chase, Freestyle." },
  { id: "suya-spot", name: "Suya Spot", category: "social" as PlaceCategory, state: "lagos" as StateId, desc: "Daily free reward + food buffs." },
  { id: "crew-hq", name: "Crew HQ", category: "social" as PlaceCategory, state: "lagos" as StateId, desc: "Manage crew, crew wars." },
];

interface MapPin {
  id: string;
  name: string;
  desc: string;
  category: PlaceCategory;
  color: string;
  state: StateId;
  x: number;
  y: number;
}

function layoutPins(places: (Place | typeof GAME_HUBS[0])[]): MapPin[] {
  return places.map((p, i) => {
    const angle = (i / places.length) * Math.PI * 2;
    const radius = 20 + (i % 3) * 12;
    const cx = 50 + Math.cos(angle) * radius;
    const cy = 50 + Math.sin(angle) * radius;
    const stateInfo = "state" in p ? getState(p.state as StateId) : null;
    return {
      id: p.id,
      name: p.name,
      desc: p.desc,
      category: p.category,
      color: stateInfo?.accent ?? "#c87f3f",
      state: ("state" in p ? p.state : "lagos") as StateId,
      x: Math.max(8, Math.min(92, cx)),
      y: Math.max(8, Math.min(85, cy)),
    };
  });
}

export default function MapScreen({ profile, onVisitLocation }: MapScreenProps) {
  const [selectedState, setSelectedState] = useState<StateId>((profile.city as StateId) ?? "kaduna");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState(0);

  useEffect(() => {
    return subscribeToOnlinePlayers((players) => {
      setOnlinePlayers(players.filter((p) => p.uid !== profile.uid).length);
    });
  }, [profile.uid]);

  const realPlaces = getPlaces(selectedState);
  const allPlaces = [...GAME_HUBS, ...realPlaces] as (Place | typeof GAME_HUBS[0])[];
  const filtered = selectedCategory
    ? allPlaces.filter((p) => p.category === selectedCategory)
    : allPlaces;
  const pins = layoutPins(filtered);
  const categories = getCategoriesForState(selectedState);
  const stateInfo = getState(selectedState);

  return (
    <div className="rush-slide-up relative min-h-screen pb-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-rush-ink-soft">Explore</div>
          <h2 className="font-display text-2xl text-rush-ink">{stateInfo?.name} City</h2>
        </div>
        <Pill variant="emerald">
          <span className="rush-online-dot" />
          <AnimatedCounter value={onlinePlayers} suffix=" online" />
        </Pill>
      </div>

      {/* State picker */}
      <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {STATES.map((s) => {
          const isActive = selectedState === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setSelectedState(s.id); setSelectedCategory(null); }}
              className="btn-press shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: isActive ? s.accent : "rgba(245,234,208,0.06)",
                color: isActive ? "#fff" : "var(--ar-text-soft)",
                boxShadow: isActive ? `0 4px 12px ${s.accent}66` : "none",
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Category filters */}
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className="btn-press shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: !selectedCategory ? "var(--ar-ink)" : "rgba(245,234,208,0.06)",
            color: !selectedCategory ? "#fff" : "var(--ar-text-soft)",
          }}
        >
          All
        </button>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = selectedCategory === cat;
          const Icon = getCategoryIcon(cat);
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn-press flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: isActive ? meta.color : "rgba(245,234,208,0.06)",
                color: isActive ? "#fff" : "var(--ar-text-soft)",
              }}
            >
              <Icon size={12} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Map — illustrated SVG */}
      <Panel className="relative mb-4 overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
        {/* Map background — dark terrain */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a2a3a 0%, #0d1a2a 50%, #1a1228 100%)" }} />

        {/* Water (animated waves) */}
        <svg className="absolute bottom-0 left-0 right-0 h-[18%] w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d="M0 10 Q25 5 50 10 T100 10 V20 H0Z" fill="#0d7c4a33" />
          <path d="M0 12 Q25 7 50 12 T100 12 V20 H0Z" fill="#0d7c4a22" />
        </svg>

        {/* Roads — grid pattern with lane dashes */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="100" y2="50" stroke="#2a2a3e" strokeWidth="3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#2a2a3e" strokeWidth="3" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#1e1e2e" strokeWidth="1.5" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="#1e1e2e" strokeWidth="1.5" />
          <line x1="30" y1="0" x2="30" y2="100" stroke="#1e1e2e" strokeWidth="1.5" />
          <line x1="70" y1="0" x2="70" y2="100" stroke="#1e1e2e" strokeWidth="1.5" />
          {/* Lane dashes */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#d4a01766" strokeWidth="0.4" strokeDasharray="3 3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#d4a01766" strokeWidth="0.4" strokeDasharray="3 3" />
        </svg>

        {/* "You are here" pulse */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="ar-pulsering h-5 w-5 rounded-full" style={{ background: "var(--ar-terracotta)" }} />
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">YOU</div>
        </div>

        {/* SVG pins */}
        {pins.map((pin) => {
          const Icon = getCategoryIcon(pin.category);
          return (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className="btn-press absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 shadow-lg"
                style={{ background: pin.color }}
              >
                <Icon size={14} className="text-white" />
              </div>
              <span className="max-w-[60px] truncate rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }}>
                {pin.name}
              </span>
            </button>
          );
        })}
      </Panel>

      {/* Bottom sheet for selected pin */}
      <BottomSheet open={!!selectedPin} onClose={() => setSelectedPin(null)} title={selectedPin?.name}>
        {selectedPin && (
          <div className="space-y-3">
            <p className="text-xs text-rush-ink-soft">{selectedPin.desc}</p>
            <Pill variant="terracotta">
              {CATEGORY_META[selectedPin.category].label}
            </Pill>
            <PrimaryButton
              full
              onClick={() => {
                onVisitLocation?.(selectedPin.id);
                setSelectedPin(null);
              }}
            >
              Visit {selectedPin.name}
            </PrimaryButton>
          </div>
        )}
      </BottomSheet>

      {/* Online count */}
      <div className="flex items-center justify-between text-[10px] text-rush-ink-soft">
        <span>{pins.length} places shown</span>
        <span>{onlinePlayers} riders nearby</span>
      </div>
    </div>
  );
}
