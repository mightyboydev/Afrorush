"use client";

// src/world/OtherPlayers.tsx — render other online players as simple avatars.
// Phase 3: uses Firestore presence to show nearby riders.

import { useRef, useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { subscribeToOnlinePlayers, type LeaderboardEntry } from "@/lib/firestore";

interface PlayerDot {
  uid: string;
  username: string;
  pos: [number, number, number];
  color: string;
  crewTag: string | null;
  crewColor: string | null;
}

// Spread online players in a ring around the hub for now.
// Phase 5 will sync real positions via Realtime Database.
export default function OtherPlayers() {
  const [players, setPlayers] = useState<PlayerDot[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    return subscribeToOnlinePlayers((online) => {
      // Take up to 8 other players and scatter them around the hub
      const dots: PlayerDot[] = online.slice(0, 8).map((p, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 12 + (i % 3) * 4;
        return {
          uid: p.uid,
          username: p.username,
          pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r],
          color: p.crewColor ?? "#1fb86f",
          crewTag: p.crewTag,
          crewColor: p.crewColor,
        };
      });
      setPlayers(dots);
    });
  }, []);

  return (
    <group ref={groupRef}>
      {players.map((p) => (
        <OtherPlayer key={p.uid} data={p} />
      ))}
    </group>
  );
}

function OtherPlayer({ data }: { data: PlayerDot }) {
  const bob = useRef(0);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.05;
      if (meshRef.current) {
        meshRef.current.position.y = Math.sin(t) * 0.08;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <group position={data.pos}>
      <group ref={meshRef}>
        {/* LEGS — slender tapered cylinders */}
        <mesh castShadow position={[-0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
        </mesh>
        {/* HIPS */}
        <mesh castShadow position={[0, 0.78, 0]}>
          <capsuleGeometry args={[0.12, 0.05, 8, 16]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
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
        {/* Online dot */}
        <mesh position={[0.13, 1.72, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#1fb86f" />
        </mesh>
      </group>
      {/* Name tag */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.2}
        color="#14213d"
        outlineWidth={0.03}
        outlineColor="#ffffff"
        anchorX="center"
      >
        {data.username}
      </Text>
      {data.crewTag && (
        <Text
          position={[0, 2.6, 0]}
          fontSize={0.16}
          color={data.crewColor ?? "#7c3aed"}
          outlineWidth={0.02}
          outlineColor="#ffffff"
          anchorX="center"
        >
          [{data.crewTag}]
        </Text>
      )}
    </group>
  );
}

// Re-export LeaderboardEntry type for convenience
export type { LeaderboardEntry };
