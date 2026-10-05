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
        {/* Body — capsule (smooth cartoon) */}
        <mesh castShadow position={[0, 1.3, 0]}>
          <capsuleGeometry args={[0.25, 0.35, 12, 24]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        {/* Head — sphere */}
        <mesh castShadow position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color="#8d5524" roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.09, 1.95, 0.27]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.09, 1.95, 0.27]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Legs — capsules */}
        <mesh castShadow position={[-0.13, 0.6, 0]}>
          <capsuleGeometry args={[0.09, 0.45, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.13, 0.6, 0]}>
          <capsuleGeometry args={[0.09, 0.45, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        {/* Arms — capsules */}
        <mesh castShadow position={[-0.35, 1.45, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0.35, 1.45, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
          <meshStandardMaterial color={data.color} roughness={0.6} />
        </mesh>
        {/* Online dot */}
        <mesh position={[0.25, 1.95, 0.15]}>
          <sphereGeometry args={[0.06, 8, 8]} />
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
