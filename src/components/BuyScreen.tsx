"use client";

// src/components/BuyScreen.tsx — Full shop with rarity glow borders, SVG item art,
// progress bar "need N more", category tabs with SVG icons, count-up wallet.
// Dark Harmattan Dusk theme. No emoji.

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { BIKE_CATALOG, OUTFIT_CATALOG, formatNaira, type PlayerProfile } from "@/lib/storage";
import { purchaseItem, updateLoadout, updateProfile } from "@/lib/firestore";
import { Panel, Pill, PrimaryButton, AnimatedCounter } from "@/ui/kit";
import {
  BikeIcon, ShirtIcon, HomeIcon2, BedIcon, FlameIcon, WaterIcon, TvIcon, PlaneIcon, CarIcon,
  StarIcon, WalletIcon, type IconName, ICONS,
} from "@/ui/icons";

type Category = "bikes" | "outfits" | "food" | "vehicles" | "homes" | "design" | "sleep" | "kitchen" | "bath" | "living";

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  currency: "naira" | "gold";
  icon: IconName;
  color: string;
  size?: string;
  stars?: number;
}

const SHOP: Record<Category, ShopItem[]> = {
  bikes: BIKE_CATALOG.map((b) => ({ id: b.id, name: b.name, desc: b.desc, price: b.price, currency: "naira" as const, icon: "bike" as IconName, color: b.color ?? "#0d7c4a" })),
  outfits: OUTFIT_CATALOG.map((o) => ({ id: o.id, name: o.name, desc: o.desc, price: o.price, currency: "naira" as const, icon: "shirt" as IconName, color: o.color ?? "#c87f3f" })),
  food: [
    { id: "suya", name: "Suya Plate", desc: "+30 food", price: 200, currency: "naira", icon: "buka", color: "#c87f3f" },
    { id: "jollof", name: "Jollof Rice", desc: "+50 food, +10 energy", price: 350, currency: "naira", icon: "buka", color: "#d4a017" },
    { id: "puffpuff", name: "Puff Puff", desc: "+20 fun", price: 100, currency: "naira", icon: "buka", color: "#7c3aed" },
    { id: "zobo", name: "Zobo Drink", desc: "+25 energy", price: 150, currency: "naira", icon: "buka", color: "#c8463d" },
  ],
  vehicles: [
    { id: "danfo", name: "Danfo Bus", desc: "Travel faster", price: 5000, currency: "naira", icon: "ride", color: "#d4a017" },
    { id: "keke", name: "Keke Napep", desc: "Short trips", price: 3000, currency: "naira", icon: "ride", color: "#c87f3f" },
    { id: "cab", name: "Yellow Cab", desc: "Luxury ride", price: 12000, currency: "naira", icon: "car", color: "#d4a017" },
    { id: "sedan", name: "Toyota Sedan", desc: "Reliable car", price: 25000, currency: "naira", icon: "car", color: "#1e3a8a" },
    { id: "suv", name: "Lexus SUV", desc: "Lagos style", price: 80000, currency: "naira", icon: "car", color: "#0f1f4d" },
    { id: "sportscar", name: "Range Rover Sport", desc: "Lekki big boy", price: 150, currency: "gold", icon: "car", color: "#c8463d", stars: 5 },
    { id: "privatejet", name: "Private Jet", desc: "Fly to Abuja, PH", price: 2000, currency: "gold", icon: "plane", color: "#f5ead0", stars: 5 },
    { id: "yacht", name: "Lagos Yacht", desc: "Cruise the lagoon", price: 8000, currency: "gold", icon: "boat", color: "#2f7de1", stars: 5 },
  ],
  homes: [
    { id: "home-room", name: "Face-Me-I-Face-You", desc: "Basic room. Where you start.", price: 0, currency: "naira", icon: "home2", color: "#0d7c4a" },
    { id: "home-selfcon", name: "Self-Con", desc: "Your own room + bathroom", price: 20000, currency: "naira", icon: "home2", color: "#1e3a8a" },
    { id: "home-flat", name: "2-Bedroom Flat", desc: "Space for family + guests", price: 75000, currency: "naira", icon: "home2", color: "#d4a017", stars: 3 },
    { id: "home-duplex", name: "Lekki Duplex", desc: "Luxury living, +rep daily", price: 200, currency: "gold", icon: "home2", color: "#7c3aed", stars: 4 },
    { id: "home-seaplot", name: "Sea Plot (Land)", desc: "Build your dream by the water", price: 500, currency: "gold", icon: "home2", color: "#2f7de1", stars: 5 },
  ],
  design: [
    { id: "ankara-rug", name: "Ankara Rug", desc: "Vivid pattern, 2x1", price: 1500, currency: "naira", icon: "bag", color: "#c8463d", size: "2x1", stars: 2 },
    { id: "fela-poster", name: "Fela Poster", desc: "Wall art, legendary", price: 800, currency: "naira", icon: "camera", color: "#d4a017", size: "wall", stars: 3 },
    { id: "standing-fan", name: "Standing Fan", desc: "Cool the room, 1x1", price: 2500, currency: "naira", icon: "water", color: "#1e3a8a", size: "1x1", stars: 2 },
    { id: "generator", name: "Generator", desc: "NEPA-proof power, 1x1", price: 8000, currency: "naira", icon: "flame", color: "#2b1810", size: "1x1", stars: 4 },
    { id: "water-tank", name: "Water Tank", desc: "Never dry, 1x1", price: 5000, currency: "naira", icon: "water", color: "#1e3a8a", size: "1x1", stars: 3 },
    { id: "cooler", name: "Air Cooler", desc: "Better than fan, 1x1", price: 12000, currency: "naira", icon: "water", color: "#2f7de1", size: "1x1", stars: 4 },
  ],
  sleep: [
    { id: "bed-basic", name: "Basic Bed", desc: "Sleep well, 2x1", price: 3000, currency: "naira", icon: "bed", color: "#7c3aed", size: "2x1", stars: 1 },
    { id: "bed-ortho", name: "Orthopedic Bed", desc: "Full energy restore", price: 15000, currency: "naira", icon: "bed", color: "#0d7c4a", size: "2x1", stars: 3 },
    { id: "bed-luxury", name: "Luxury King Bed", desc: "Max comfort, +mood", price: 50, currency: "gold", icon: "bed", color: "#d4a017", size: "2x1", stars: 5 },
  ],
  kitchen: [
    { id: "gas-cooker", name: "Gas Cooker", desc: "Cook suya at home, 1x1", price: 6000, currency: "naira", icon: "flame", color: "#2b1810", size: "1x1", stars: 3 },
    { id: "kitchen-shelf", name: "Kitchen Shelf", desc: "Store your food, 1x1", price: 4000, currency: "naira", icon: "bag", color: "#9c5a26", size: "1x1", stars: 2 },
    { id: "microwave", name: "Microwave", desc: "Fast jollof, 1x1", price: 10000, currency: "naira", icon: "tv", color: "#2b1810", size: "1x1", stars: 4 },
    { id: "blender", name: "Smoothie Blender", desc: "Zobo on demand, 1x1", price: 7000, currency: "naira", icon: "water", color: "#0d7c4a", size: "1x1", stars: 3 },
  ],
  bath: [
    { id: "shower-basic", name: "Basic Shower", desc: "Restore hygiene, 1x1", price: 5000, currency: "naira", icon: "water", color: "#1e3a8a", size: "1x1", stars: 2 },
    { id: "bathtub", name: "Bathtub", desc: "Luxury soak, +mood", price: 20000, currency: "naira", icon: "water", color: "#f5ead0", size: "1x1", stars: 4 },
    { id: "toilet-seat", name: "Toilet Seat", desc: "Better than pit, 1x1", price: 3500, currency: "naira", icon: "toilet", color: "#f5ead0", size: "1x1", stars: 2 },
    { id: "water-heater", name: "Water Heater", desc: "Hot showers, 1x1", price: 12000, currency: "naira", icon: "flame", color: "#c8463d", size: "1x1", stars: 4 },
  ],
  living: [
    { id: "sofa-basic", name: "Basic Sofa", desc: "Sit and chill, 2x1", price: 4000, currency: "naira", icon: "bed", color: "#0d7c4a", size: "2x1", stars: 2 },
    { id: "sofa-luxury", name: "Leather Sofa", desc: "Premium comfort, 2x1", price: 25000, currency: "naira", icon: "bed", color: "#2b1810", size: "2x1", stars: 4 },
    { id: "tv-stand", name: "TV + Stand", desc: "Watch Nollywood, 2x1", price: 30000, currency: "naira", icon: "tv", color: "#0f1f4d", size: "2x1", stars: 5 },
    { id: "center-table", name: "Center Table", desc: "Place your suya, 1x1", price: 3000, currency: "naira", icon: "bag", color: "#9c5a26", size: "1x1", stars: 2 },
    { id: "ac-unit", name: "AC Unit", desc: "Cool the whole room", price: 45000, currency: "naira", icon: "water", color: "#2f7de1", size: "wall", stars: 5 },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: IconName }[] = [
  { id: "design", label: "Design", icon: "bag" },
  { id: "sleep", label: "Sleep", icon: "bed" },
  { id: "kitchen", label: "Kitchen", icon: "flame" },
  { id: "bath", label: "Bath", icon: "water" },
  { id: "living", label: "Living", icon: "tv" },
  { id: "bikes", label: "Bikes", icon: "bike" },
  { id: "outfits", label: "Outfits", icon: "shirt" },
  { id: "food", label: "Food", icon: "buka" },
  { id: "vehicles", label: "Vehicles", icon: "car" },
  { id: "homes", label: "Homes", icon: "home2" },
];

const STAR_COLORS = ["#6b7280", "#6b7280", "#1e3a8a", "#0d7c4a", "#d4a017", "#c8463d"];

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
    if (balance < item.price) { setError(`Need ${item.currency === "gold" ? "gold" : "naira"} ${item.price - balance} more`); return; }
    setBusy(item.id);
    try {
      if (item.id.startsWith("home-")) {
        const homeType = item.id.replace("home-", "") as "room" | "selfcon" | "flat" | "duplex" | "seaplot";
        await updateProfile(profile.uid, { homeType, cash: profile.cash - item.price });
        setSuccess(`Upgraded to ${item.name}!`);
      } else {
        await purchaseItem(profile.uid, item.id, item.price);
      }
      await refreshProfile();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  return (
    <div className="rush-slide-up min-h-screen pb-4">
      {/* Header with count-up wallet */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-rush-ink-soft">Shop</div>
          <h2 className="font-display text-2xl text-rush-ink">Market</h2>
        </div>
        <div className="flex gap-2">
          <Pill variant="gold">
            <WalletIcon size={14} />
            <AnimatedCounter value={profile.cash} prefix="" />
          </Pill>
          <Pill variant="gold">
            <span className="text-[10px]">{profile.gold}</span>
          </Pill>
        </div>
      </div>

      {/* Category tabs with SVG icons */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon];
          const isActive = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="btn-press flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: isActive ? "var(--ar-emerald-gradient)" : "rgba(245,234,208,0.06)",
                color: isActive ? "#fff" : "var(--ar-text-soft)",
                boxShadow: isActive ? "0 4px 12px rgba(13,124,74,0.4)" : "none",
              }}
            >
              <Icon size={14} />
              {c.label}
            </button>
          );
        })}
      </div>

      {error && <div className="mb-3 rounded-xl bg-rush-rose/15 px-3 py-2 text-xs text-rush-rose">{error}</div>}
      {success && <div className="mb-3 rounded-xl bg-rush-leaf/15 px-3 py-2 text-xs text-rush-leaf-deep">{success}</div>}

      {/* Items grid with rarity glow */}
      <div className="grid grid-cols-2 gap-3">
        {SHOP[cat].map((item) => {
          const owned = unlocked.includes(item.id) || (item.id.startsWith("home-") && profile.homeType === item.id.replace("home-", ""));
          const isCurrentHome = item.id.startsWith("home-") && profile.homeType === item.id.replace("home-", "");
          const balance = item.currency === "gold" ? profile.gold : profile.cash;
          const canAfford = balance >= item.price;
          const need = item.price - balance;
          const stars = item.stars ?? 1;
          const glowColor = STAR_COLORS[Math.min(stars, 5)];
          const ItemIcon = ICONS[item.icon] ?? ICONS.bag;
          return (
            <Panel
              key={item.id}
              className="overflow-hidden p-3"
              style={{
                borderColor: owned ? "var(--ar-gold)" : `${glowColor}44`,
                boxShadow: owned
                  ? "0 0 0 1px var(--ar-gold), 0 4px 16px rgba(212,160,23,0.2)"
                  : stars >= 4
                  ? `0 4px 16px ${glowColor}33, inset 0 0 0 1px ${glowColor}22`
                  : "inset 0 1px 0 rgba(245,234,208,0.10), 0 8px 28px rgba(0,0,0,0.35)",
              }}
            >
              {/* Item art — SVG icon on colored bg */}
              <div className="mb-2 flex h-16 items-center justify-center rounded-2xl" style={{ background: `${item.color}22` }}>
                <ItemIcon size={28} className="text-rush-ink" style={{ color: item.color }} />
              </div>
              {/* Stars */}
              {item.stars && (
                <div className="mb-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} size={8} className={i < stars ? "" : "opacity-20"} style={{ color: i < stars ? glowColor : "var(--ar-text-soft)" }} />
                  ))}
                </div>
              )}
              <div className="mb-0.5 text-xs font-bold text-rush-ink">{item.name}</div>
              <p className="mb-1 text-[9px] leading-tight text-rush-ink-soft">{item.desc}</p>
              {item.size && <span className="mb-1 inline-block rounded px-1 text-[8px] font-bold text-rush-ink-soft" style={{ background: "rgba(245,234,208,0.06)" }}>{item.size}</span>}
              {/* Price */}
              <div className="mb-1.5 text-xs font-bold tabular-nums" style={{ color: item.currency === "gold" ? "var(--ar-gold)" : "var(--ar-terracotta)" }}>
                {item.price === 0 ? "FREE" : `${item.price.toLocaleString()} ${item.currency === "gold" ? "gold" : "naira"}`}
              </div>
              {/* Action: owned / buy / progress bar */}
              {owned || isCurrentHome ? (
                <div className="rounded-lg py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-rush-gold" style={{ background: "rgba(212,160,23,0.15)" }}>
                  {isCurrentHome ? "Current Home" : "Owned"}
                </div>
              ) : canAfford ? (
                <button
                  onClick={() => handleBuy(item)}
                  disabled={busy === item.id}
                  className="ar-btn-primary btn-press w-full rounded-lg py-1.5 text-[9px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {busy === item.id ? "Buying..." : "Buy"}
                </button>
              ) : (
                /* Progress bar showing how much more is needed */
                <div className="space-y-0.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(245,234,208,0.08)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (balance / item.price) * 100)}%`,
                        background: "var(--ar-warm-gradient)",
                        transition: "width 0.4s ease-out",
                      }}
                    />
                  </div>
                  <div className="text-center text-[8px] font-bold text-rush-ink-soft tabular-nums">
                    Need {need.toLocaleString()} more
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
