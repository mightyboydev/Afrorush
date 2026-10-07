// src/systems/racing.ts — Racing logic (multiplayer rooms, race state).
// Re-exports firestore helpers for leaner imports. No logic changes.

export {
  createRaceRoom,
  joinRaceRoom,
  subscribeToRaceRoom,
  updateRacePlayerState,
  startRaceRoom,
  leaveRaceRoom,
  type RaceRoom,
  type RaceRoomPlayer,
} from "@/lib/firestore";
