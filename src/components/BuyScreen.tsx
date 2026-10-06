"use client";

// src/components/BuyScreen.tsx — Full shop: Bikes, Outfits, Food, Vehicles,
// Homes, Design (furniture), Sleep, Kitchen, Bath, Living.
// Phase 2: Furniture items + housing upgrades.

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  BIKE_CATALOG,
  OUTFIT_CATALOG,
  formatNaira,
  getItem,
  type PlayerProfile,
} from "@/lib/storage";
import { purchaseItem, updateLoadout, updateProfile } from "@/lib/firestore";

type Category = "bikes" | "outfits" | "food" | "vehicles" | "homes" | "design" | "sleep" | "kitchen" | "bath" | "living";

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  currency: "naira" | "gold";
  emoji: string;
  color: string;
  size?: string;
  stars?: number;
}

const SHOP: Record<Category, ShopItem[]> = {
  bikes: BIKE_CATALOG.map((b) => ({ id: b.id, name: b.name, desc: b.desc, price: b.price, currency: "naira" as const, emoji: "🏍️", color: b.color ?? "#1fb86f" })),
  outfits: OUTFIT_CATALOG.map((o) => ({ id: o.id, name: o.name, desc: o.desc, price: o.price, currency: "naira" as const, emoji: "👕", color: o.color ?? "#ff6a1a" })),
  food: [
    { id: "suya", name: "Suya Plate", desc: "+30 food", price: 200, currency: "naira", emoji: "🍢", color: "#ff6a1a" },
    { id: "jollof", name: "Jollof Rice", desc: "+50 food, +10 energy", price: 350, currency: "naira", emoji: "🍚", color: "#ffc531" },
    { id: "puffpuff", name: "Puff Puff", desc: "+20 fun", price: 100, currency: "naira", emoji: "🍩", color: "#c026d3" },
    { id: "zobo", name: "Zobo Drink", desc: "+25 energy", price: 150, currency: "naira", emoji: "🥤", color: "#ef4444" },
  ],
  vehicles: [
    { id: "danfo", name: "Danfo Bus", desc: "Travel faster", price: 5000, currency: "naira", emoji: "🚌", color: "#ffc531" },
    { id: "keke", name: "Keke Napep", desc: "Short trips", price: 3000, currency: "naira", emoji: "🛺", color: "#ff6a1a" },
    { id: "cab", name: "Yellow Cab", desc: "Luxury ride", price: 12000, currency: "naira", emoji: "🚕", color: "#ffc531" },
    { id: "sedan", name: "Toyota Sedan", desc: "Reliable car", price: 25000, currency: "naira", emoji: "🚗", color: "#1e3a5f" },
    { id: "suv", name: "Lexus SUV", desc: "Lagos style", price: 80000, currency: "naira", emoji: "🚙", color: "#14213d" },
    { id: "sportscar", name: "Range Rover Sport", desc: "Lekki big boy", price: 150, currency: "gold", emoji: "🏎️", color: "#e94f37" },
    { id: "privatejet", name: "Private Jet", desc: "Fly to Abuja, PH", price: 2000, currency: "gold", emoji: "✈️", color: "#ffffff" },
    { id: "helicopter", name: "Helicopter", desc: "Land anywhere", price: 5000, currency: "gold", emoji: "🚁", color: "#16a3b1" },
    { id: "yacht", name: "Lagos Yacht", desc: "Cruise the lagoon", price: 8000, currency: "gold", emoji: "🛥️", color: "#0ea5e9" },
  ],
  homes: [
    { id: "home-room", name: "Face-Me-I-Face-You", desc: "Basic room. Where you start.", price: 0, currency: "naira", emoji: "🏠", color: "#1fb86f" },
    { id: "home-selfcon", name: "Self-Con", desc: "Your own room + bathroom", price: 20000, currency: "naira", emoji: "🏨", color: "#16a3b1" },
    { id: "home-flat", name: "2-Bedroom Flat", desc: "Space for family + guests", price: 75000, currency: "naira", emoji: "🏢", color: "#ffc531" },
    { id: "home-duplex", name: "Lekki Duplex", desc: "Luxury living, +rep daily", price: 200, currency: "gold", emoji: "🏡", color: "#7c3aed" },
    { id: "home-seaplot", name: "Sea Plot (Land)", desc: "Build your dream by the water", price: 500, currency: "gold", emoji: "🏖️", color: "#0ea5e9" },
  ],
  design: [
    { id: "ankara-rug", name: "Ankara Rug", desc: "Vivid pattern, 2x1", price: 1500, currency: "naira", emoji: "🟫", color: "#e94f37", size: "2x1", stars: 2 },
    { id: "fela-poster", name: "Fela Poster", desc: "Wall art, legendary", price: 800, currency: "naira", emoji: "🖼️", color: "#ffc531", size: "wall", stars: 3 },
    { id: "standing-fan", name: "Standing Fan", desc: "Cool the room, 1x1", price: 2500, currency: "naira", emoji: "🌀", color: "#16a3b1", size: "1x1", stars: 2 },
    { id: "generator", name: "Generator", desc: "NEPA-proof power, 1x1", price: 8000, currency: "naira", emoji: "🔌", color: "#333333", size: "1x1", stars: 4 },
    { id: "water-tank", name: "Water Tank", desc: "Never dry, 1x1", price: 5000, currency: "naira", emoji: "🛢️", color: "#1e3a5f", size: "1x1", stars: 3 },
    { id: "cooler", name: "Air Cooler", desc: "Better than fan, 1x1", price: 12000, currency: "naira", emoji: "❄️", color: "#87ceeb", size: "1x1", stars: 4 },
  ],
  sleep: [
    { id: "bed-basic", name: "Basic Bed", desc: "Sleep well, 2x1", price: 3000, currency: "naira", emoji: "🛏️", color: "#7c3aed", size: "2x1", stars: 1 },
    { id: "bed-ortho", name: "Orthopedic Bed", desc: "Full energy restore", price: 15000, currency: "naira", emoji: "🛏️", color: "#1fb86f", size: "2x1", stars: 3 },
    { id: "bed-luxury", name: "Luxury King Bed", desc: "Max comfort, +mood", price: 50, currency: "gold", emoji: "🛏️", color: "#ffc531", size: "2x1", stars: 5 },
  ],
  kitchen: [
    { id: "gas-cooker", name: "Gas Cooker", desc: "Cook suya at home, 1x1", price: 6000, currency: "naira", emoji: "🔥", color: "#555555", size: "1x1", stars: 3 },
    { id: "kitchen-shelf", name: "Kitchen Shelf", desc: "Store your food, 1x1", price: 4000, currency: "naira", emoji: "🗄️", color: "#8b6914", size: "1x1", stars: 2 },
    { id: "microwave", name: "Microwave", desc: "Fast jollof, 1x1", price: 10000, currency: "naira", emoji: "📡", color: "#333333", size: "1x1", stars: 4 },
    { id: "blender", name: "Smoothie Blender", desc: "Zobo on demand, 1x1", price: 7000, currency: "naira", emoji: "🥤", color: "#1fb86f", size: "1x1", stars: 3 },
  ],
  bath: [
    { id: "shower-basic", name: "Basic Shower", desc: "Restore hygiene, 1x1", price: 5000, currency: "naira", emoji: "🚿", color: "#16a3b1", size: "1x1", stars: 2 },
    { id: "bathtub", name: "Bathtub", desc: "Luxury soak, +mood", price: 20000, currency: "naira", emoji: "🛁", color: "#ffffff", size: "1x1", stars: 4 },
    { id: "toilet-seat", name: "Toilet Seat", desc: "Better than pit, 1x1", price: 3500, currency: "naira", emoji: "🚽", color: "#ffffff", size: "1x1", stars: 2 },
    { id: "water-heater", name: "Water Heater", desc: "Hot showers, 1x1", price: 12000, currency: "naira", emoji: "♨️", color: "#e94f37", size: "1x1", stars: 4 },
  ],
  living: [
    { id: "sofa-basic", name: "Basic Sofa", desc: "Sit and chill, 2x1", price: 4000, currency: "naira", emoji: "🛋️", color: "#1fb86f", size: "2x1", stars: 2 },
    { id: "sofa-luxury", name: "Leather Sofa", desc: "Premium comfort, 2x1", price: 25000, currency: "naira", emoji: "🛋️", color: "#1a1a1a", size: "2x1", stars: 4 },
    { id: "tv-stand", name: "TV + Stand", desc: "Watch Nollywood, 2x1", price: 30000, currency: "naira", emoji: "📺", color: "#14213d", size: "2x1", stars: 5 },
    { id: "center-table", name: "Center Table", desc: "Place your suya, 1x1", price: 3000, currency: "naira", emoji: "🪑", color: "#8b6914", size: "1x1", stars: 2 },
    { id: "ac-unit", name: "AC Unit", desc: "Cool the whole room", price: 45000, currency: "naira", emoji: "🌬️", color: "#87ceeb", size: "wall", stars: 5 },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: "🎨" },
  { id: "sleep", label: "Sleep", icon: "🛏️" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "bath", label: "Bath", icon: "🚿" },
  { id: "living", label: "Living", icon: "🛋️" },
  { id: "bikes", label: "Bikes", icon: "🏍️" },
  { id: "outfits", label: "Outfits", icon: "👕" },
  { id: "food", label: "Food", icon: "🍢" },
  { id: "vehicles", label: "Vehicles", icon: "🚗" },
  { id: "homes", label: "Homes", icon: "🏠" },
];

export default function BuyScreen({ profile, unlocked }: { profile: PlayerProfile; unlocked: string[] }) {
  const { refreshProfile } = useAuth();
  const [cat, setCat] = useState<Category>("design");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBuy = async (item: ShopItem) => {
    setError(null); setSuccess(null);
    if (unlocked.includes(item.id)) return;
    const balance = item.currency === "gold" ? profile.gold : profile.cash;
    if (balance < item.price) {
      setError(`Not enough ${item.currency === "gold" ? "gold" : "Naira"}`);
      return;
    }
    setBusy(item.id);
    try {
      // Home upgrade
      if (item.id.startsWith("home-")) {
        const homeType = item.id.replace("home-", "") as "room" | "selfcon" | "flat" | "duplex" | "seaplot";
        await updateProfile(profile.uid, {
          homeType,
          cash: profile.cash - item.price,
        });
        setSuccess(`Upgraded to ${item.name}!`);
      } else {
        await purchaseItem(profile.uid, item.id, item.price);
        const realItem = getItem(item.id);
        if (realItem) {
          await updateLoadout(profile.uid, { ...profile.loadout, [`${realItem.category}Id`]: item.id });
        }
      }
      await refreshProfile();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rush-slide-up min-h-screen pb-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Shop</div>
          <h2 className="font-display text-2xl text-rush-navy">Market</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-full rush-glass-pill px-3 py-1.5">
            <span className="text-xs">💵</span>
            <span className="text-xs font-bold text-rush-navy">{formatNaira(profile.cash)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full rush-glass-pill px-3 py-1.5">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-bold text-rush-navy">{profile.gold}</span>
          </div>
        </div>
      </div>

      {/* Current home badge */}
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-rush-cream/50 p-2">
        <span className="text-lg">🏠</span>
        <span className="text-xs font-bold text-rush-navy">Current: {profile.homeType === "room" ? "Face-Me-I-Face-You" : profile.homeType === "selfcon" ? "Self-Con" : profile.homeType === "flat" ? "2-Bedroom Flat" : profile.homeType === "duplex" ? "Lekki Duplex" : "Sea Plot"}</span>
      </div>

      {/* Category tabs */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
              cat === c.id ? "bg-rush-green text-white shadow-lg shadow-rush-green/30" : "bg-white/80 text-rush-navy/60 backdrop-blur"
            }`}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
      {success && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{success}</div>}

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {SHOP[cat].map((item) => {
          const owned = unlocked.includes(item.id) || (item.id.startsWith("home-") && profile.homeType === item.id.replace("home-", ""));
          const isCurrentHome = item.id.startsWith("home-") && profile.homeType === item.id.replace("home-", "");
          const balance = item.currency === "gold" ? profile.gold : profile.cash;
          const canAfford = balance >= item.price;
          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-3xl border-2 bg-white/80 p-3 backdrop-blur transition-all ${
                owned ? "border-rush-gold bg-rush-gold/5" : "border-transparent"
              }`}
            >
              <div className="mb-2 flex h-16 items-center justify-center rounded-2xl text-3xl" style={{ background: `${item.color}22` }}>
                {item.emoji}
              </div>
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-xs font-bold text-rush-navy">{item.name}</span>
                {item.stars && <span className="text-[8px]">{"★".repeat(item.stars)}</span>}
              </div>
              <p className="mb-1 text-[9px] leading-tight text-rush-navy/50">{item.desc}</p>
              {item.size && <span className="mb-1 inline-block rounded bg-rush-cream px-1 text-[8px] font-bold text-rush-navy/40">{item.size}</span>}
              <div className="mb-1.5 flex items-center gap-1 text-xs font-bold" style={{ color: item.currency === "gold" ? "#ffc531" : "#1fb86f" }}>
                {item.currency === "gold" ? "🪙" : "₦"}{item.price === 0 ? "FREE" : item.price.toLocaleString()}
              </div>
              {owned || isCurrentHome ? (
                <div className="rounded-lg bg-rush-gold/20 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-rush-gold">
                  {isCurrentHome ? "Current Home" : "Owned"}
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(item)}
                  disabled={busy === item.id || !canAfford}
                  className="w-full rounded-lg bg-rush-green py-1.5 text-[9px] font-bold uppercase tracking-wider text-white transition-all active:scale-95 disabled:opacity-40"
                >
                  {busy === item.id ? "Buying…" : canAfford ? "Buy" : `Need ${item.currency === "gold" ? "🪙" : "₦"}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
