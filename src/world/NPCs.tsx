"use client";

// src/world/NPCs.tsx — low-poly NPC characters with dialogue.
// Phase 2: walk-up interaction triggers DialogueBox.

import { useRef, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export interface NPCData {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  greeting: string;
  missions?: { id: string; title: string; desc: string; reward: number }[];
}

export const NPCS: NPCData[] = [
  {
    id: "tout-1",
    name: "Baba Tunde",
    position: [6, 0, 6],
    color: "#ff6a1a",
    greeting: "Ah, my friend! You wan race or you wan hustle? Suya Spot get free reward today o!",
    missions: [
      { id: "m-deliver-1", title: "Lagos Delivery", desc: "Carry 3 packages across the city. No waste time!", reward: 500 },
    ],
  },
  {
    id: "hawker-1",
    name: "Mama Chichi",
    position: [-6, 0, 8],
    color: "#c026d3",
    greeting: "Buy something na! Market get new Ankara today. You fit also sell your old bike.",
    missions: [],
  },
  {
    id: "rider-1",
    name: "Kelechi Rider",
    position: [10, 0, -6],
    color: "#1fb86f",
    greeting: "You sabi ride? Race Track dey that side. Show me what you get!",
    missions: [
      { id: "m-race-1", title: "Beat the Clock", desc: "Finish a Street Race in under 60 seconds.", reward: 800 },
    ],
  },
  {
    id: "guard-1",
    name: "Officer Danjuma",
    position: [-10, 0, -6],
    color: "#14213d",
    greeting: "Keep the peace, my friend. No rough driving for Motor Park.",
    missions: [],
  },
];

export function NPC({ data, onClick }: { data: NPCData; onClick: (npc: NPCData) => void }) {
  const ref = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const bob = useMemo(() => Math.random() * Math.PI * 2, []);

  // Bob up and down slightly
  useFrameAnimation((t) => {
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * 1.5 + bob) * 0.08;
    }
  });

  return (
    <group
      ref={ref}
      position={data.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <group ref={bobRef}>
        {/* Body */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color={data.color} roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 1.9, 0]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color="#8d5524" />
        </mesh>
        {/* Hat */}
        <mesh castShadow position={[0, 2.15, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Legs */}
        <mesh castShadow position={[-0.15, 0.4, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#2a2a3a" />
        </mesh>
        <mesh castShadow position={[0.15, 0.4, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#2a2a3a" />
        </mesh>
        {/* Interaction indicator (floating !) */}
        <Text
          position={[0, 2.7, 0]}
          fontSize={0.4}
          color="#ffc531"
          outlineWidth={0.04}
          outlineColor="#14213d"
        >
          !
        </Text>
      </group>
      {/* Name tag */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.22}
        color="#14213d"
        outlineWidth={0.03}
        outlineColor="#ffffff"
        anchorX="center"
      >
        {data.name}
      </Text>
    </group>
  );
}

export function NPCGroup({ onTalk }: { onTalk: (npc: NPCData) => void }) {
  return (
    <group>
      {NPCS.map((npc) => (
        <NPC key={npc.id} data={npc} onClick={onTalk} />
      ))}
    </group>
  );
}

// Hook helper to run a frame animation without re-importing useFrame everywhere.
import { useFrame } from "@react-three/fiber";
function useFrameAnimation(cb: (t: number) => void) {
  useFrame((state) => cb(state.clock.elapsedTime));
}
