"use client";

// src/components/DialogueBox.tsx — NPC dialogue overlay (bottom sheet).

import { useState } from "react";
import type { NPCData } from "@/world/NPCs";

export interface DialogueBoxProps {
  npc: NPCData | null;
  onClose: () => void;
  onAcceptMission?: (missionId: string) => void;
}

export default function DialogueBox({ npc, onClose, onAcceptMission }: DialogueBoxProps) {
  const [line, setLine] = useState(0);
  const npcKey = npc?.id;

  if (!npc) return null;

  const lines = [npc.greeting];
  if (npc.missions && npc.missions.length > 0) {
    lines.push(`Mission: ${npc.missions[0].title} — ${npc.missions[0].desc} (Reward: ₦${npc.missions[0].reward})`);
  }

  // Clamp line if it exceeds available lines (NPC change).
  const safeLine = Math.min(line, lines.length - 1);
  void npcKey;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6 safe-pb sm:px-6">
      <div className="rush-card mx-auto max-w-md p-5">
        {/* NPC header */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `${npc.color}22`, color: npc.color }}
          >
            🧑
          </div>
          <div className="flex-1">
            <div className="font-display text-base text-rush-navy">{npc.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-rush-navy/50">Street Local</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-cream text-rush-navy"
            aria-label="Close dialogue"
          >
            ✕
          </button>
        </div>

        {/* Dialogue text */}
        <div className="min-h-[60px] rounded-2xl bg-rush-cream/50 p-3 text-sm text-rush-navy">
          {lines[safeLine]}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {safeLine < lines.length - 1 ? (
            <button
              onClick={() => setLine(safeLine + 1)}
              className="flex-1 rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white"
            >
              Continue
            </button>
          ) : npc.missions && npc.missions.length > 0 ? (
            <button
              onClick={() => {
                onAcceptMission?.(npc.missions![0].id);
                onClose();
              }}
              className="flex-1 rounded-2xl bg-rush-orange px-4 py-3 text-sm font-bold uppercase tracking-wider text-white"
            >
              Accept Mission
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl bg-rush-navy px-4 py-3 text-sm font-bold uppercase tracking-wider text-white"
            >
              Catch you later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
