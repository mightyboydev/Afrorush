// src/systems/social.ts — Social logic (DMs, pickpocket, report).
// Re-exports firestore helpers for leaner imports. No logic changes.

export {
  sendDm,
  subscribeToDms,
  searchPlayersByUsername,
  pickpocket,
  reportToPolice,
  type DmMessage,
} from "@/lib/firestore";
