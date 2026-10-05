"use client";

// src/components/BuyScreen.tsx — Shop with categories (bikes, outfits, food, etc).

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  BIKE_CATALOG,
  OUTFIT_CATALOG,
  formatNaira,
  getItem,
  type CatalogItem,
  type PlayerProfile,
} from "@/lib/storage";
import { purchaseItem, updateLoadout } from "@/lib/firestore";

type Category = "bikes" | "outfits" | "food" | "vehicles" | "homes";

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  currency: "naira" | "gold";
  emoji: string;
  color: string;
}

const SHOP: Record<Category, ShopItem[]> = {
  bikes: BIKE_CATALOG.map((b) => ({ id: b.id, name: b.name, desc: b.desc, price: b.price, currency: "naira" as const, emoji: "🏍️", color: b.color ?? "#1fb86f" })),
  outfits: OUTFIT_CATALOG.map((o) => ({ id: o.id, name: o.name, desc: o.desc, price: o.price, currency: "naira" as const, emoji: "👕", color: o.color ?? "#ff6a1a" })),
  food: [
    { id: "suya", name: "Suya Plate", desc: "Restore 30 energy", price: 200, currency: "naira", emoji: "🍢", color: "#ff6a1a" },
    { id: "jollof", name: "Jollof Rice", desc: "Restore 50 energy", price: 350, currency: "naira", emoji: "🍚", color: "#ffc531" },
    { id: "puffpuff", name: "Puff Puff", desc: "Restore 20 mood", price: 100, currency: "naira", emoji: "🍩", color: "#c026d3" },
    { id: "zobo", name: "Zobo Drink", desc: "Restore 25 energy", price: 150, currency: "naira", emoji: "🥤", color: "#ef4444" },
  ],
  vehicles: [
    { id: "danfo", name: "Danfo Bus", desc: "Travel faster across the city", price: 5000, currency: "naira", emoji: "🚌", color: "#ffc531" },
    { id: "keke", name: "Keke Napep", desc: "Compact ride for short trips", price: 3000, currency: "naira", emoji: "🛺", color: "#ff6a1a" },
    { id: "cab", name: "Yellow Cab", desc: "Luxury ride with AC", price: 12000, currency: "naira", emoji: "🚕", color: "#ffc531" },
    { id: "sports", name: "Sports Bike", desc: "Top speed, low grip", price: 50, currency: "gold", emoji: "🏍️", color: "#7c3aed" },
    { id: "sedan", name: "Toyota Sedan", desc: "Reliable car for the city", price: 25000, currency: "naira", emoji: "🚗", color: "#1e3a5f" },
    { id: "suv", name: "Lexus SUV", desc: "Big, bold, Lagos style", price: 80000, currency: "naira", emoji: "🚙", color: "#14213d" },
    { id: "sportscar", name: "Range Rover Sport", desc: "Lekki big boy special", price: 150, currency: "gold", emoji: "🏎️", color: "#e94f37" },
    { id: "privatejet", name: "Private Jet", desc: "Fly to Abuja, PH, Kano", price: 2000, currency: "gold", emoji: "✈️", color: "#ffffff" },
    { id: "helicopter", name: "Helicopter", desc: "Land anywhere in the city", price: 5000, currency: "gold", emoji: "🚁", color: "#16a3b1" },
    { id: "yacht", name: "Lagos Yacht", desc: "Cruise the lagoon in style", price: 8000, currency: "gold", emoji: "🛥️", color: "#0ea5e9" },
  ],
  homes: [
    { id: "studio", name: "Studio Flat", desc: "Cozy starter home", price: 0, currency: "naira", emoji: "🏠", color: "#1fb86f" },
    { id: "apartment", name: "City Apartment", desc: "More space, better mood", price: 15000, currency: "naira", emoji: "🏢", color: "#16a3b1" },
    { id: "duplex", name: "Lekki Duplex", desc: "Luxury living, +rep daily", price: 200, currency: "gold", emoji: "🏡", color: "#ffc531" },
    { id: "mansion", name: "Banana Island Mansion", desc: "Top-tier status symbol", price: 1000, currency: "gold", emoji: "🏰", color: "#7c3aed" },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "bikes", label: "Bikes", icon: "🏍️" },
  { id: "outfits", label: "Outfits", icon: "👕" },
  { id: "food", label: "Food", icon: "🍢" },
  { id: "vehicles", label: "Vehicles", icon: "🚗" },
  { id: "homes", label: "Homes", icon: "🏠" },
];

export default function BuyScreen({ profile, unlocked }: { profile: PlayerProfile; unlocked: string[] }) {
  const { refreshProfile } = useAuth();
  const [cat, setCat] = useState<Category>("bikes");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (item: ShopItem) => {
    setError(null);
    if (unlocked.includes(item.id)) return;
    const balance = item.currency === "gold" ? profile.gold : profile.cash;
    if (balance < item.price) {
      setError(`Not enough ${item.currency === "gold" ? "gold" : "Naira"}`);
      return;
    }
    setBusy(item.id);
    try {
      await purchaseItem(profile.uid, item.id, item.price);
      // Auto-equip if it's a bike or outfit
      const realItem = getItem(item.id);
      if (realItem) {
        await updateLoadout(profile.uid, { ...profile.loadout, [`${realItem.category}Id`]: item.id });
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

      {/* Category tabs */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              cat === c.id ? "bg-rush-green text-white shadow-lg shadow-rush-green/30" : "bg-white/80 text-rush-navy/60 backdrop-blur"
            }`}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {SHOP[cat].map((item) => {
          const owned = unlocked.includes(item.id);
          const balance = item.currency === "gold" ? profile.gold : profile.cash;
          const canAfford = balance >= item.price;
          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-3xl border-2 bg-white/80 p-3 backdrop-blur transition-all ${
                owned ? "border-rush-gold bg-rush-gold/5" : "border-transparent"
              }`}
            >
              <div
                className="mb-2 flex h-20 items-center justify-center rounded-2xl text-4xl"
                style={{ background: `${item.color}22` }}
              >
                {item.emoji}
              </div>
              <div className="mb-1 font-bold text-rush-navy">{item.name}</div>
              <p className="mb-2 text-[10px] leading-tight text-rush-navy/60">{item.desc}</p>
              <div className="mb-2 flex items-center gap-1 text-xs font-bold" style={{ color: item.currency === "gold" ? "#ffc531" : "#1fb86f" }}>
                {item.currency === "gold" ? "🪙" : "₦"}
                {item.price === 0 ? "FREE" : item.price.toLocaleString()}
              </div>
              {owned ? (
                <div className="rounded-xl bg-rush-gold/20 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-rush-gold">
                  Owned
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(item)}
                  disabled={busy === item.id || !canAfford}
                  className="w-full rounded-xl bg-rush-green py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-95 disabled:opacity-40"
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
