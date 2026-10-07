// src/systems/survival.ts — Survival logic (needs decay, vitals, food, nightlife).
// Re-exports firestore helpers for leaner imports. No logic changes.

export { updateProfile } from "@/lib/firestore";
export { JOBS, FOOD, DRINKS, RIDES } from "@/data/catalog";
