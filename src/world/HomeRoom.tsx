"use client";

// src/world/HomeRoom.tsx — 3D room scene for the Home screen.
// Tiled floor, bed, fan, sofa, rug, window, cooker, generator.
// Player avatar stands inside. Warm lighting.

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { AvatarConfig } from "@/lib/storage";

export interface HomeRoomProps {
  avatar: AvatarConfig;
  quality?: "low" | "medium" | "high";
  onReady?: () => void;
}

export default function HomeRoom({ avatar, quality = "medium", onReady }: HomeRoomProps) {
  const dpr = quality === "high" ? 2.0 : quality === "medium" ? 1.5 : 1.0;
  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [3, 3, 4], fov: 40 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#f5e6c8"));
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        {/* Warm interior lighting */}
        <ambientLight intensity={0.5} color="#ffe4b5" />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} color="#fff5e1" />
        <pointLight position={[-3, 3, -2]} intensity={0.5} color="#ff9f43" />
        <hemisphereLight args={["#ffe4b5", "#8b6914", 0.3]} />

        {/* Room */}
        <Room avatar={avatar} />

        {/* Contact shadows */}
        <ContactShadows position={[0, 0.01, 0]} scale={8} far={3} blur={2} opacity={0.25} color="#3a2a1a" />
      </Suspense>
    </Canvas>
  );
}

function Room({ avatar }: { avatar: AvatarConfig }) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (fanRef.current) fanRef.current.rotation.y += dt * 2;
  });

  const shirtColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#ffffff";

  return (
    <group>
      {/* Floor — tiled */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#d4a76a" roughness={0.8} />
      </mesh>
      {/* Tile lines */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, (i - 3) * 1]}>
          <planeGeometry args={[8, 0.02]} />
          <meshBasicMaterial color="#b88a4a" />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`v-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 3) * 1, 0.005, 0]}>
          <planeGeometry args={[0.02, 8]} />
          <meshBasicMaterial color="#b88a4a" />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#e8c89a" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#d4b888" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#d4b888" roughness={0.9} />
      </mesh>

      {/* Window on back wall */}
      <mesh position={[2, 2.3, -3.98]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
      </mesh>
      {/* Window frame */}
      <mesh position={[2, 2.3, -3.97]}>
        <planeGeometry args={[1.6, 0.05]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      <mesh position={[2, 2.3, -3.97]}>
        <planeGeometry args={[0.05, 1.25]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>

      {/* BED — against left wall */}
      <group position={[-2.5, 0, -2]}>
        {/* Frame */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.4, 2]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.8} />
        </mesh>
        {/* Mattress */}
        <mesh castShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[1.4, 0.2, 1.9]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
        </mesh>
        {/* Pillow */}
        <mesh castShadow position={[0, 0.75, -0.7]}>
          <boxGeometry args={[1.0, 0.15, 0.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Blanket */}
        <mesh castShadow position={[0, 0.72, 0.3]}>
          <boxGeometry args={[1.35, 0.1, 1.0]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.85} />
        </mesh>
      </group>

      {/* SOFA — against right wall */}
      <group position={[2.5, 0, 1]}>
        {/* Base */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[1.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#1fb86f" roughness={0.85} />
        </mesh>
        {/* Back rest */}
        <mesh castShadow position={[0, 0.7, -0.3]}>
          <boxGeometry args={[1.8, 0.6, 0.2]} />
          <meshStandardMaterial color="#1fb86f" roughness={0.85} />
        </mesh>
        {/* Cushions */}
        <mesh castShadow position={[-0.4, 0.6, 0.05]}>
          <boxGeometry args={[0.7, 0.15, 0.5]} />
          <meshStandardMaterial color="#178a55" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0.4, 0.6, 0.05]}>
          <boxGeometry args={[0.7, 0.15, 0.5]} />
          <meshStandardMaterial color="#178a55" roughness={0.8} />
        </mesh>
      </group>

      {/* RUG — center floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1]} receiveShadow>
        <planeGeometry args={[2.5, 1.5]} />
        <meshStandardMaterial color="#e94f37" roughness={0.95} />
      </mesh>
      {/* Rug pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 1]}>
        <planeGeometry args={[2.0, 1.0]} />
        <meshStandardMaterial color="#ffc531" roughness={0.95} />
      </mesh>

      {/* CEILING FAN — spinning */}
      <group ref={fanRef} position={[0, 3.5, 0]}>
        {/* Motor */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
          <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Blades */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} castShadow position={[Math.cos(i * Math.PI / 2) * 0.5, 0, Math.sin(i * Math.PI / 2) * 0.5]} rotation={[0, i * Math.PI / 2, 0.1]}>
            <boxGeometry args={[0.8, 0.03, 0.12]} />
            <meshStandardMaterial color="#8b6914" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* GAS COOKER — near right wall */}
      <group position={[3, 0, -2.5]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.9, 0.6]} />
          <meshStandardMaterial color="#555555" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Burners */}
        <mesh position={[-0.15, 0.96, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        <mesh position={[0.15, 0.96, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      </group>

      {/* GENERATOR — corner */}
      <group position={[-3, 0, 2.5]}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.5]} />
          <meshStandardMaterial color="#444444" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Exhaust pipe */}
        <mesh castShadow position={[0.35, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#888888" metalness={0.7} />
        </mesh>
      </group>

      {/* PLAYER AVATAR — standing in room */}
      <group position={[0, 0, 0]} rotation={[0, 0.5, 0]}>
        <RoomAvatar avatar={avatar} shirtColor={shirtColor} />
      </group>
    </group>
  );
}

function RoomAvatar({ avatar, shirtColor }: { avatar: AvatarConfig; shirtColor: string }) {
  const bodyRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.015;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Legs */}
      <mesh castShadow position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* Shoes */}
      <mesh castShadow position={[-0.1, 0.05, 0.04]}>
        <boxGeometry args={[0.09, 0.05, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.1, 0.05, 0.04]}>
        <boxGeometry args={[0.09, 0.05, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* Hips */}
      <mesh castShadow position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.12, 0.05, 8, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* Torso */}
      <mesh castShadow position={[0, 1.15, 0]} scale={[1, 1, 0.7]}>
        <capsuleGeometry args={[0.17, 0.3, 12, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Shoulders */}
      <mesh castShadow position={[0, 1.32, 0]}>
        <boxGeometry args={[0.36, 0.1, 0.18]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Neck */}
      <mesh castShadow position={[0, 1.47, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.04, 1.64, 0.09]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[0.04, 1.64, 0.09]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[-0.04, 1.64, 0.11]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.04, 1.64, 0.11]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.61, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.02, 0.04, 8]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>
      {/* Hair */}
      {avatar.hair === "short" && (
        <mesh castShadow position={[0, 1.69, -0.01]}>
          <sphereGeometry args={[0.12, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.7} />
        </mesh>
      )}
      {avatar.hair === "afro" && (
        <mesh castShadow position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.95} />
        </mesh>
      )}
      {avatar.hair === "cap" && (
        <group position={[0, 1.69, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#14213d" roughness={0.5} />
          </mesh>
        </group>
      )}
      {/* Arms */}
      <mesh castShadow position={[-0.22, 1.32, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.22, 1.32, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Hands */}
      <mesh castShadow position={[-0.22, 1.13, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.22, 1.13, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
    </group>
  );
}
