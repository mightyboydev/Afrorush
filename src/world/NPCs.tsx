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
        {/* LEGS — slender tapered cylinders */}
        <mesh castShadow position={[-0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        {/* HIPS */}
        <mesh castShadow position={[0, 0.78, 0]}>
          <capsuleGeometry args={[0.12, 0.05, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        {/* TORSO — tapered */}
        <mesh castShadow position={[0, 1.15, 0]} scale={[1, 1, 0.7]}>
          <capsuleGeometry args={[0.17, 0.3, 12, 24]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        {/* Shoulders */}
        <mesh castShadow position={[0, 1.32, 0]}>
          <boxGeometry args={[0.36, 0.1, 0.18]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        {/* NECK */}
        <mesh castShadow position={[0, 1.47, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.1, 12]} />
          <meshStandardMaterial color="#8d5524" roughness={0.5} />
        </mesh>
        {/* HEAD */}
        <mesh castShadow position={[0, 1.62, 0]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#8d5524" roughness={0.4} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.04, 1.64, 0.09]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0.04, 1.64, 0.09]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[-0.04, 1.64, 0.11]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.04, 1.64, 0.11]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Cap */}
        <mesh castShadow position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* ARMS — slender */}
        <mesh castShadow position={[-0.22, 1.32, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0.22, 1.32, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        {/* Hands */}
        <mesh castShadow position={[-0.22, 1.13, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#8d5524" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0.22, 1.13, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#8d5524" roughness={0.5} />
        </mesh>
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
