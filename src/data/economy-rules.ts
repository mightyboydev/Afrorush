// src/data/economy-rules.ts — Server-readable economy rules.
// Used by API routes to look up prices/rewards. NEVER imported by client code
// to determine amounts — the server is the source of truth.
// This file is shared between client (for display) and server (for validation).

export const JOB_RULES: Record<string, { pay: number; stamina: number; hunger: number; cooldownMs: number }> = {
  "suya-seller":     { pay: 300,  stamina: 10, hunger: 8,  cooldownMs: 30_000 },
  "okada-rider":     { pay: 500,  stamina: 15, hunger: 12, cooldownMs: 45_000 },
  "phone-repair":    { pay: 1000, stamina: 12, hunger: 10, cooldownMs: 60_000 },
  "delivery":        { pay: 800,  stamina: 20, hunger: 15, cooldownMs: 60_000 },
  "danfo-driver":    { pay: 1200, stamina: 25, hunger: 18, cooldownMs: 90_000 },
  "event-promoter":  { pay: 2000, stamina: 30, hunger: 20, cooldownMs: 120_000 },
  "agbero":          { pay: 1500, stamina: 20, hunger: 15, cooldownMs: 90_000 },
  "tech-hustler":    { pay: 5000, stamina: 35, hunger: 8,  cooldownMs: 180_000 },
};

export const FOOD_RULES: Record<string, { price: number; stamina: number; hunger: number; credBoost: number }> = {
  "gala-pure-water": { price: 50,  stamina: 10, hunger: 15, credBoost: 0 },
  "suya-rice":       { price: 200, stamina: 25, hunger: 30, credBoost: 0 },
  "amala-shitta":    { price: 300, stamina: 40, hunger: 50, credBoost: 0 },
  "pounded-yam":     { price: 500, stamina: 60, hunger: 70, credBoost: 0 },
  "pepper-soup":    { price: 800, stamina: 35, hunger: 30, credBoost: 3 },
  "small-chops":     { price: 1000, stamina: 20, hunger: 15, credBoost: 5 },
};

export const DRINK_RULES: Record<string, { price: number; cred: number }> = {
  "star":             { price: 500,   cred: 5 },
  "hennessy":         { price: 2000,  cred: 15 },
  "champagne":        { price: 15000, cred: 50 },
  "hennessy-bottle":  { price: 25000, cred: 70 },
  "azul":             { price: 40000, cred: 90 },
};

export const RIDE_RULES: Record<string, { fare: number; risk: number; staminaCost: number }> = {
  "trek":  { fare: 0,   risk: 0,    staminaCost: 15 },
  "danfo": { fare: 100, risk: 0.30, staminaCost: 5 },
  "keke":  { fare: 150, risk: 0.15, staminaCost: 5 },
  "okada": { fare: 250, risk: 0.05, staminaCost: 8 },
  "brt":   { fare: 350, risk: 0,    staminaCost: 3 },
  "cab":   { fare: 500, risk: 0,    staminaCost: 0 },
};

export const COVER_FEE = 1000;
export const BOOTH_FEE = 500;
export const BOOTH_REWARD_MIN = 100;
export const BOOTH_REWARD_MAX = 300;
export const SUYA_DAILY_REWARD_CASH = 500;
export const SUYA_DAILY_REWARD_REP = 25;

export const RACE_RULES = {
  TARGET_DISTANCE: 2000,
  MIN_CLAIM_INTERVAL_MS: 60_000, // 1 min between race reward claims
  PLACE_REWARDS: [
    { cash: 1000, rep: 50 }, // 1st
    { cash: 500,  rep: 25 }, // 2nd
    { cash: 250,  rep: 10 }, // 3rd+
  ],
};

// Shop items — same as BuyScreen SHOP but server-readable
export const SHOP_RULES: Record<string, { price: number; currency: "naira" | "gold" }> = {
  // Bikes
  "bike-spark": { price: 0,     currency: "naira" },
  "bike-bolt":  { price: 1500,  currency: "naira" },
  "bike-pulse": { price: 3500,  currency: "naira" },
  "bike-mirage": { price: 6000, currency: "naira" },
  "bike-phantom": { price: 9000, currency: "naira" },
  "bike-suya":  { price: 18000, currency: "naira" },
  // Outfits
  "outfit-street": { price: 0,    currency: "naira" },
  "outfit-kente":  { price: 1200, currency: "naira" },
  "outfit-ankara": { price: 2200, currency: "naira" },
  "outfit-night":  { price: 4000, currency: "naira" },
  "outfit-sunset": { price: 6500, currency: "naira" },
  // Food
  "suya":       { price: 200, currency: "naira" },
  "jollof":     { price: 350, currency: "naira" },
  "puffpuff":   { price: 100, currency: "naira" },
  "zobo":       { price: 150, currency: "naira" },
  // Vehicles
  "danfo":      { price: 5000,  currency: "naira" },
  "keke":       { price: 3000,  currency: "naira" },
  "cab":        { price: 12000, currency: "naira" },
  "sedan":      { price: 25000, currency: "naira" },
  "suv":        { price: 80000, currency: "naira" },
  "sportscar":  { price: 150,   currency: "gold" },
  "privatejet": { price: 2000,  currency: "gold" },
  "yacht":      { price: 8000,  currency: "gold" },
  // Homes
  "home-room":   { price: 0,     currency: "naira" },
  "home-selfcon": { price: 20000, currency: "naira" },
  "home-flat":   { price: 75000, currency: "naira" },
  "home-duplex": { price: 200,   currency: "gold" },
  "home-seaplot": { price: 500,  currency: "gold" },
  // Furniture/Design
  "ankara-rug":    { price: 1500,  currency: "naira" },
  "fela-poster":   { price: 800,   currency: "naira" },
  "standing-fan":  { price: 2500,  currency: "naira" },
  "generator":     { price: 8000,  currency: "naira" },
  "water-tank":    { price: 5000,  currency: "naira" },
  "cooler":        { price: 12000, currency: "naira" },
  // Sleep
  "bed-basic":     { price: 3000,  currency: "naira" },
  "bed-ortho":     { price: 15000, currency: "naira" },
  "bed-luxury":   { price: 50,    currency: "gold" },
  // Kitchen
  "gas-cooker":   { price: 6000,  currency: "naira" },
  "kitchen-shelf": { price: 4000, currency: "naira" },
  "microwave":    { price: 10000, currency: "naira" },
  "blender":      { price: 7000,  currency: "naira" },
  // Bath
  "shower-basic":  { price: 5000,  currency: "naira" },
  "bathtub":      { price: 20000, currency: "naira" },
  "toilet-seat":  { price: 3500,  currency: "naira" },
  "water-heater": { price: 12000, currency: "naira" },
  // Living
  "sofa-basic":   { price: 4000,  currency: "naira" },
  "sofa-luxury":  { price: 25000, currency: "naira" },
  "tv-stand":     { price: 30000, currency: "naira" },
  "center-table": { price: 3000,  currency: "naira" },
  "ac-unit":      { price: 45000, currency: "naira" },
};
