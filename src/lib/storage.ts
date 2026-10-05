// src/lib/storage.ts — AfroRush shared types, catalog data, and pure helpers.
// NOTE: profile persistence moved to Firestore (see firestore.ts). This file
// is the single source of truth for catalog items, types, and pure math.

export type RaceMode = "street-race" | "delivery-rush" | "police-chase" | "freestyle-run";

export interface Crew {
  id: string;
  name: string;
  color: string;
  tag: string; // 3 chars
  ownerId: string;
  ownerName: string;
  memberCount: number;
  totalRep: number;
  createdAt: number;
}

export interface Loadout {
  bikeId: string;
  outfitId: string;
  stickerId: string;
  hornId: string;
  exhaustId: string;
}

export interface HighScores {
  "street-race": number;
  "delivery-rush": number;
  "police-chase": number;
  "freestyle-run": number;
}

// PlayerProfile is the Firestore document shape for users/{uid}.
// Public fields are readable by anyone. Private fields (email, etc.) live
// in a private subcollection readable only by owner + admins (Phase 4).
export interface AvatarConfig {
  skinTone: string;   // hex color
  hair: "short" | "afro" | "cap" | "bald" | "locs";
  hairColor: string;
  outfit: string;    // outfit id from catalog
}

export interface PlayerProfile {
  uid: string;
  username: string;
  email: string | null;
  photoURL: string | null;
  avatar: AvatarConfig;
  city: string;        // "lagos" | "kano" | "accra" | "nairobi"
  loadout: Loadout;
  cash: number;
  gold: number;        // premium currency
  rep: number;
  totalRuns: number;
  highScores: HighScores;
  crewId: string | null;
  crewName: string | null;
  crewColor: string | null;
  crewTag: string | null;
  createdAt: number;
  lastSeen: number;
  soundOn: boolean;
  graphicsQuality: "low" | "medium" | "high";
  onboardingComplete: boolean;
  // Moderation fields (server-written only, enforced by rules in Phase 4)
  banned: boolean;
  banReason: string | null;
  banExpires: number | null;
  mutedUntil: number | null;
  warnings: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: "bike" | "outfit" | "sticker" | "horn" | "exhaust";
  color?: string;
}

export const BIKE_CATALOG: CatalogItem[] = [
  { id: "bike-spark",    name: "Lagos Spark",   desc: "Street-class okada. Balanced and snappy.", price: 0,     category: "bike", color: "#d2601a" },
  { id: "bike-bolt",     name: "Accra Bolt",     desc: "Green sprinter. Great acceleration.",     price: 1500,  category: "bike", color: "#1f9d55" },
  { id: "bike-pulse",    name: "Nairobi Pulse",  desc: "Top speed monster. Heavy handling.",      price: 3500,  category: "bike", color: "#f2c531" },
  { id: "bike-mirage",   name: "Cairo Mirage",   desc: "Smooth ride, easy turns.",                 price: 6000,  category: "bike", color: "#16a3b1" },
  { id: "bike-phantom",  name: "Abuja Phantom",  desc: "Stealth machine. Boost king.",            price: 9000,  category: "bike", color: "#7c3aed" },
  { id: "bike-suya",     name: "Suya Edition",   desc: "Gold-plated legend. All stats boosted.",  price: 18000, category: "bike", color: "#e8a217" },
];

export const OUTFIT_CATALOG: CatalogItem[] = [
  { id: "outfit-street", name: "Street Hustle", desc: "Plain tee + denim. Classic.",   price: 0,    category: "outfit", color: "#f5f5f5" },
  { id: "outfit-kente",  name: "Kente Rider",   desc: "Royal kente weave.",            price: 1200, category: "outfit", color: "#d4af37" },
  { id: "outfit-ankara", name: "Ankara Vibe",   desc: "Vivid ankara print.",           price: 2200, category: "outfit", color: "#e94f37" },
  { id: "outfit-night",  name: "Night Rider",    desc: "Black leather. Stealthy.",      price: 4000, category: "outfit", color: "#1f2937" },
  { id: "outfit-sunset", name: "Sunset Run",    desc: "Orange dashiki. Style +1.",     price: 6500, category: "outfit", color: "#f97316" },
];

export const STICKER_CATALOG: CatalogItem[] = [
  { id: "stk-none",  name: "None",          desc: "Clean look.",            price: 0,    category: "sticker" },
  { id: "stk-star",  name: "Lagos Star",    desc: "A single shining star.", price: 300,  category: "sticker" },
  { id: "stk-naija", name: "Naija Pride",   desc: "Green-white-green stripe.", price: 700,  category: "sticker" },
  { id: "stk-logo",  name: "AfroRush Logo", desc: "Rep the brand.",          price: 1200, category: "sticker" },
  { id: "stk-suya",  name: "Suya Master",   desc: "For the spice lovers.",   price: 2500, category: "sticker" },
];

export const HORN_CATALOG: CatalogItem[] = [
  { id: "horn-beep",    name: "Beep",           desc: "Standard horn.",      price: 0,    category: "horn" },
  { id: "horn-blast",   name: "Loud Blast",    desc: "Loud and proud.",      price: 400,  category: "horn" },
  { id: "horn-afro",    name: "Afrobeat Hit",  desc: "Musical rhythm.",     price: 1000, category: "horn" },
  { id: "horn-goat",    name: "Goat Bleat",    desc: "Bahhhh!",             price: 1800, category: "horn" },
  { id: "horn-traffic", name: "Lagos Traffic", desc: "Pure chaos.",          price: 3000, category: "horn" },
];

export const EXHAUST_CATALOG: CatalogItem[] = [
  { id: "exh-stock",   name: "Stock",         desc: "Standard exhaust.",       price: 0,    category: "exhaust", color: "#9ca3af" },
  { id: "exh-flame",   name: "Flame Burst",   desc: "Trail of flames on boost.", price: 800,  category: "exhaust", color: "#f97316" },
  { id: "exh-gold",    name: "Gold Sparks",   desc: "Wealth on wheels.",       price: 1800, category: "exhaust", color: "#e8a217" },
  { id: "exh-smoke",   name: "Smoke Cloud",   desc: "Mysterious smoke trail.", price: 1200, category: "exhaust", color: "#6b7280" },
  { id: "exh-rainbow", name: "Rainbow Trail", desc: "Maximum style.",          price: 4500, category: "exhaust", color: "#ec4899" },
];

export const ALL_CATALOGS: CatalogItem[] = [
  ...BIKE_CATALOG,
  ...OUTFIT_CATALOG,
  ...STICKER_CATALOG,
  ...HORN_CATALOG,
  ...EXHAUST_CATALOG,
];

export function getItem(id: string): CatalogItem | undefined {
  return ALL_CATALOGS.find((i) => i.id === id);
}

export const CREW_COLORS = [
  "#d2601a", "#1f9d55", "#f2c531", "#16a3b1",
  "#7c3aed", "#e94f37", "#ec4899", "#0ea5e9",
];

export const MODE_INFO: Record<RaceMode, { name: string; tag: string; desc: string; accent: string }> = {
  "street-race":    { name: "Street Race",    tag: "RACE",  desc: "Hit top speed. Reach the finish line and beat the clock.", accent: "#d2601a" },
  "delivery-rush":  { name: "Delivery Rush",  tag: "RUSH",  desc: "Pick up parcels and drop them off. Don't drop the load!",  accent: "#1f9d55" },
  "police-chase":   { name: "Police Chase",   tag: "CHASE", desc: "Outrun the sirens for 60 seconds. Don't get caught.",      accent: "#16a3b1" },
  "freestyle-run":  { name: "Freestyle Run",  tag: "FREE",  desc: "Endless mode. Stack distance and style points.",            accent: "#7c3aed" },
};

export function formatNaira(n: number): string {
  return "₦" + Math.floor(n).toLocaleString("en-NG");
}

export function levelFromRep(rep: number): number {
  return Math.floor(Math.sqrt(Math.max(0, rep) / 100)) + 1;
}
export function nextRepTarget(rep: number): number {
  const lvl = levelFromRep(rep);
  return Math.pow(lvl, 2) * 100;
}
// Rank titles by level — African street-culture themed.
export function levelTitle(lvl: number): string {
  if (lvl >= 25) return "Street Legend";
  if (lvl >= 18) return "Oga";
  if (lvl >= 12) return "Road Boss";
  if (lvl >= 7)  return "Area Boy";
  if (lvl >= 4)  return "Hustler";
  return "Pikin";
}

// Cities selectable during onboarding.
export const CITIES = [
  { id: "lagos",   name: "Lagos",   country: "Nigeria",   accent: "#1fb86f" },
  { id: "kano",    name: "Kano",    country: "Nigeria",   accent: "#ff6a1a" },
  { id: "accra",   name: "Accra",   country: "Ghana",     accent: "#ffc531" },
  { id: "nairobi", name: "Nairobi", country: "Kenya",     accent: "#c026d3" },
] as const;

// Avatar options shown in onboarding.
export const SKIN_TONES = ["#8d5524", "#c68642", "#e0ac69", "#f1c27d", "#ffdbac"];
export const HAIR_STYLES: AvatarConfig["hair"][] = ["short", "afro", "cap", "bald", "locs"];
export const HAIR_COLORS = ["#1a1a1a", "#3d2817", "#6b3410", "#8b5a2b"];
export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: "#c68642",
  hair: "short",
  hairColor: "#1a1a1a",
  outfit: "outfit-street",
};

// A profile with the unlocked items (computed client-side from cash purchases).
// We store unlocked ids alongside the profile in Firestore for cross-device.
export interface PlayerState extends PlayerProfile {
  unlocked: string[];
}

export const DEFAULT_LOADOUT: Loadout = {
  bikeId: "bike-spark",
  outfitId: "outfit-street",
  stickerId: "stk-none",
  hornId: "horn-beep",
  exhaustId: "exh-stock",
};

export const DEFAULT_HIGH_SCORES: HighScores = {
  "street-race": 0,
  "delivery-rush": 0,
  "police-chase": 0,
  "freestyle-run": 0,
};

export const DEFAULT_UNLOCKED = ["bike-spark", "outfit-street", "stk-none", "horn-beep", "exh-stock"];

// Make a fresh PlayerProfile document for a new user.
export function makeDefaultProfile(
  uid: string,
  email: string | null,
  username: string,
  photoURL: string | null = null
): PlayerProfile {
  const now = Date.now();
  return {
    uid,
    username,
    email,
    photoURL,
    avatar: { ...DEFAULT_AVATAR },
    city: "lagos",
    loadout: { ...DEFAULT_LOADOUT },
    cash: 500,
    gold: 50,
    rep: 0,
    totalRuns: 0,
    highScores: { ...DEFAULT_HIGH_SCORES },
    crewId: null,
    crewName: null,
    crewColor: null,
    crewTag: null,
    createdAt: now,
    lastSeen: now,
    soundOn: true,
    graphicsQuality: "medium",
    onboardingComplete: false,
    banned: false,
    banReason: null,
    banExpires: null,
    mutedUntil: null,
    warnings: 0,
  };
}

// Graphics quality presets — used by the 3D world.
export const GRAPHICS_PRESETS = {
  low:    { pixelRatio: 0.75, shadows: false, fps: 30, drawDistance: 60 },
  medium: { pixelRatio: 1.0,  shadows: false, fps: 30, drawDistance: 100 },
  high:   { pixelRatio: 1.5,  shadows: true,  fps: 60, drawDistance: 200 },
} as const;

// Districts (3D world places) — used for the place pills on the city map.
export const DISTRICTS = [
  { id: "motor-park",   name: "Motor Park",        emoji: "🛺", color: "#1fb86f", desc: "The main social hub. Okadas, danfo, keke everywhere." },
  { id: "garage",      name: "Garage",           emoji: "🏍️", color: "#ff6a1a", desc: "Customize your bike, outfit, sticker, horn and exhaust." },
  { id: "race-track",  name: "Race Track",       emoji: "🏁", color: "#ffc531", desc: "Start a Phaser race: Street, Delivery, Police Chase, Freestyle." },
  { id: "market",      name: "Market",           emoji: "🛍️", color: "#c026d3", desc: "Shop with Naira and gold. Stalls, bargaining NPCs." },
  { id: "suya-spot",   name: "Suya Spot",        emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward, food buffs, mini challenges." },
  { id: "crew-hq",    name: "Crew HQ",          emoji: "👥", color: "#7c3aed", desc: "Crew room, members, chat, wars board." },
  { id: "radio",       name: "Radio Tower",      emoji: "📻", color: "#16a3b1", desc: "Naija radio with news ticker and music." },
  { id: "billboards", name: "Billboard Blvd",   emoji: "📋", color: "#14213d", desc: "Brand ad slots (admin controlled)." },
  { id: "lagoon",     name: "Lagoon",           emoji: "🌊", color: "#0ea5e9", desc: "Boats, relaxed area, hidden collectibles." },
  { id: "highway",    name: "Highway",          emoji: "🛣️", color: "#1fb86f", desc: "Open road for free riding, stunts and missions." },
] as const;
