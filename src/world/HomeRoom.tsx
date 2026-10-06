"use client";

// src/world/HomeRoom.tsx — Polished 3D room scene inspired by Lagos Life.
// Warm interior, isometric camera, checkered floor, proper furniture,
// character stands naturally. Soft shadows, ambient occlusion.

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, AccumulativeShadows, SoftShadows } from "@react-three/drei";
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
      camera={{ position: [4.5, 4, 4.5], fov: 35, near: 0.1, far: 50 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#e8d5b0"));
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <SoftShadows size={15} samples={8} focus={0.8} />
        {/* Warm interior lighting */}
        <ambientLight intensity={0.6} color="#ffe4b5" />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0005}
          color="#fff0d4"
        />
        <pointLight position={[-3, 4, -3]} intensity={0.4} color="#ff9f43" distance={12} />
        <hemisphereLight args={["#ffe4b5", "#8b6914", 0.3]} />

        <Room avatar={avatar} />
        <ContactShadows position={[0, 0.01, 0]} scale={10} far={4} blur={3} opacity={0.3} color="#3a2a1a" resolution={1024} />
      </Suspense>
    </Canvas>
  );
}

function Room({ avatar }: { avatar: AvatarConfig }) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (fanRef.current) fanRef.current.rotation.y += dt * 1.5;
  });

  const shirtColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#ffffff";

  return (
    <group>
      {/* ===== FLOOR — checkered tiles (like Lagos Life) ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.8} />
      </mesh>
      {/* Checker pattern — alternating dark/light squares */}
      {Array.from({ length: 10 }).map((_, i) =>
        Array.from({ length: 10 }).map((_, j) => {
          const isDark = (i + j) % 2 === 0;
          if (!isDark) return null;
          return (
            <mesh key={`tile-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 4.5), 0.005, (j - 4.5)]} receiveShadow>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color="#8b6914" roughness={0.85} />
            </mesh>
          );
        })
      )}

      {/* ===== BACK WALL ===== */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#d4a76a" roughness={0.95} />
      </mesh>

      {/* ===== LEFT WALL ===== */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#c99a5a" roughness={0.95} />
      </mesh>

      {/* ===== RIGHT WALL ===== */}
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#c99a5a" roughness={0.95} />
      </mesh>

      {/* ===== WINDOW — on back wall, warm glow ===== */}
      <group position={[2, 2.3, -4.98]}>
        <mesh><planeGeometry args={[1.8, 1.4]} /><meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.4} /></mesh>
        {/* Frame */}
        <mesh position={[0, 0, 0.01]}><planeGeometry args={[1.9, 0.04]} /><meshStandardMaterial color="#5a3a1a" /></mesh>
        <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.04, 1.45]} /><meshStandardMaterial color="#5a3a1a" /></mesh>
        <mesh position={[0, 0.7, 0.01]}><planeGeometry args={[1.8, 0.04]} /><meshStandardMaterial color="#5a3a1a" /></mesh>
        <mesh position={[0, -0.7, 0.01]}><planeGeometry args={[1.8, 0.04]} /><meshStandardMaterial color="#5a3a1a" /></mesh>
      </group>

      {/* Wall decoration — simple framed picture */}
      <mesh position={[-2, 2.3, -4.98]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.7} />
      </mesh>
      <mesh position={[-2, 2.3, -4.97]}>
        <planeGeometry args={[0.85, 0.65]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
      </mesh>

      {/* ===== BED — against left wall ===== */}
      <group position={[-3, 0, -3]}>
        {/* Frame */}
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[1.6, 0.5, 2.2]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
        </mesh>
        {/* Mattress */}
        <mesh castShadow position={[0, 0.7, 0]}>
          <boxGeometry args={[1.5, 0.25, 2.1]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
        </mesh>
        {/* Pillow */}
        <mesh castShadow position={[0, 0.88, -0.75]}>
          <boxGeometry args={[1.1, 0.18, 0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Blanket */}
        <mesh castShadow position={[0, 0.82, 0.3]}>
          <boxGeometry args={[1.45, 0.15, 1.1]} />
          <meshStandardMaterial color="#5a3a8a" roughness={0.85} />
        </mesh>
      </group>

      {/* ===== SOFA — against right wall ===== */}
      <group position={[3, 0, 1.5]}>
        {/* Base */}
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[2, 0.5, 0.9]} />
          <meshStandardMaterial color="#2d6b1a" roughness={0.85} />
        </mesh>
        {/* Back rest */}
        <mesh castShadow position={[0, 0.8, -0.35]}>
          <boxGeometry args={[2, 0.7, 0.2]} />
          <meshStandardMaterial color="#2d6b1a" roughness={0.85} />
        </mesh>
        {/* Arm rests */}
        <mesh castShadow position={[-0.95, 0.55, 0]}><boxGeometry args={[0.15, 0.4, 0.9]} /><meshStandardMaterial color="#2d6b1a" roughness={0.85} /></mesh>
        <mesh castShadow position={[0.95, 0.55, 0]}><boxGeometry args={[0.15, 0.4, 0.9]} /><meshStandardMaterial color="#2d6b1a" roughness={0.85} /></mesh>
        {/* Cushions */}
        <mesh castShadow position={[-0.45, 0.65, 0.05]}><boxGeometry args={[0.8, 0.18, 0.6]} /><meshStandardMaterial color="#1f4a0e" roughness={0.8} /></mesh>
        <mesh castShadow position={[0.45, 0.65, 0.05]}><boxGeometry args={[0.8, 0.18, 0.6]} /><meshStandardMaterial color="#1f4a0e" roughness={0.8} /></mesh>
      </group>

      {/* ===== RUG — center floor, Ankara-style ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.01, 1.5]} receiveShadow>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#e94f37" roughness={0.95} />
      </mesh>
      {/* Rug inner pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.015, 1.5]}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshStandardMaterial color="#ffc531" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.02, 1.5]}>
        <planeGeometry args={[1.6, 0.8]} />
        <meshStandardMaterial color="#1fb86f" roughness={0.95} />
      </mesh>

      {/* ===== CENTER TABLE — on the rug ===== */}
      <group position={[0.5, 0, 1.5]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.7} />
        </mesh>
        {/* Legs */}
        {[[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.18], [0.3, 0.18]].map(([x, z], i) => (
          <mesh key={i} castShadow position={[x, 0.17, z]}><boxGeometry args={[0.05, 0.35, 0.05]} /><meshStandardMaterial color="#3a2a1a" /></mesh>
        ))}
      </group>

      {/* ===== CEILING FAN — spinning ===== */}
      <group ref={fanRef} position={[0.5, 3.8, 0.5]}>
        <mesh castShadow><cylinderGeometry args={[0.08, 0.08, 0.15, 12]} /><meshStandardMaterial color="#333" metalness={0.6} /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} castShadow position={[Math.cos(i * Math.PI / 2) * 0.6, 0, Math.sin(i * Math.PI / 2) * 0.6]} rotation={[0, i * Math.PI / 2, 0.08]}>
            <boxGeometry args={[1, 0.02, 0.14]} />
            <meshStandardMaterial color="#8b6914" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ===== GAS COOKER — corner near right wall ===== */}
      <group position={[3.5, 0, -3]}>
        <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[0.8, 0.9, 0.6]} /><meshStandardMaterial color="#555" metalness={0.4} /></mesh>
        <mesh position={[-0.15, 0.96, 0]}><cylinderGeometry args={[0.1, 0.1, 0.02, 16]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0.15, 0.96, 0]}><cylinderGeometry args={[0.1, 0.1, 0.02, 16]} /><meshStandardMaterial color="#222" /></mesh>
      </group>

      {/* ===== GENERATOR — back corner ===== */}
      <group position={[-3.5, 0, 3]}>
        <mesh castShadow position={[0, 0.35, 0]}><boxGeometry args={[0.7, 0.7, 0.5]} /><meshStandardMaterial color="#444" metalness={0.3} /></mesh>
        <mesh castShadow position={[0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.3, 8]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
      </group>

      {/* ===== POTTED PLANT — near window ===== */}
      <group position={[1.5, 0, -4]}>
        <mesh castShadow position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.15, 0.4, 12]} /><meshStandardMaterial color="#8b4513" roughness={0.8} /></mesh>
        <mesh castShadow position={[0, 0.7, 0]}><sphereGeometry args={[0.35, 12, 12]} /><meshStandardMaterial color="#2d6b1a" roughness={0.8} /></mesh>
      </group>

      {/* ===== PLAYER AVATAR — standing naturally in center ===== */}
      <group position={[0.5, 0, 0]} rotation={[0, -0.5, 0]}>
        <RoomAvatar avatar={avatar} shirtColor={shirtColor} />
      </group>
    </group>
  );
}

function RoomAvatar({ avatar, shirtColor }: { avatar: AvatarConfig; shirtColor: string }) {
  const bodyRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Legs */}
      <mesh castShadow position={[-0.1, 0.35, 0]}><cylinderGeometry args={[0.06, 0.04, 0.65, 12]} /><meshStandardMaterial color="#1e3a5f" roughness={0.7} /></mesh>
      <mesh castShadow position={[0.1, 0.35, 0]}><cylinderGeometry args={[0.06, 0.04, 0.65, 12]} /><meshStandardMaterial color="#1e3a5f" roughness={0.7} /></mesh>
      {/* Shoes */}
      <mesh castShadow position={[-0.1, 0.04, 0.04]}><boxGeometry args={[0.09, 0.05, 0.16]} /><meshStandardMaterial color="#1a1a1a" roughness={0.4} /></mesh>
      <mesh castShadow position={[0.1, 0.04, 0.04]}><boxGeometry args={[0.09, 0.05, 0.16]} /><meshStandardMaterial color="#1a1a1a" roughness={0.4} /></mesh>
      {/* Hips */}
      <mesh castShadow position={[0, 0.72, 0]}><capsuleGeometry args={[0.11, 0.04, 8, 16]} /><meshStandardMaterial color="#1e3a5f" roughness={0.7} /></mesh>
      {/* Torso */}
      <mesh castShadow position={[0, 1.1, 0]} scale={[1, 1, 0.65]}><capsuleGeometry args={[0.16, 0.28, 12, 24]} /><meshStandardMaterial color={shirtColor} roughness={0.6} /></mesh>
      {/* Shoulders */}
      <mesh castShadow position={[0, 1.26, 0]}><boxGeometry args={[0.34, 0.09, 0.16]} /><meshStandardMaterial color={shirtColor} roughness={0.6} /></mesh>
      {/* Neck */}
      <mesh castShadow position={[0, 1.38, 0]}><cylinderGeometry args={[0.045, 0.055, 0.09, 12]} /><meshStandardMaterial color={avatar.skinTone} roughness={0.5} /></mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.52, 0]}><sphereGeometry args={[0.1, 24, 24]} /><meshStandardMaterial color={avatar.skinTone} roughness={0.4} /></mesh>
      {/* Eyes — small realistic */}
      <mesh position={[-0.035, 1.54, 0.085]}><sphereGeometry args={[0.018, 12, 12]} /><meshStandardMaterial color="#fff" roughness={0.2} /></mesh>
      <mesh position={[0.035, 1.54, 0.085]}><sphereGeometry args={[0.018, 12, 12]} /><meshStandardMaterial color="#fff" roughness={0.2} /></mesh>
      <mesh position={[-0.035, 1.54, 0.095]}><sphereGeometry args={[0.009, 8, 8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0.035, 1.54, 0.095]}><sphereGeometry args={[0.009, 8, 8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      {/* Hair */}
      {avatar.hair === "short" && <mesh castShadow position={[0, 1.58, -0.01]}><sphereGeometry args={[0.11, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color={avatar.hairColor} roughness={0.7} /></mesh>}
      {avatar.hair === "afro" && <mesh castShadow position={[0, 1.59, 0]}><sphereGeometry args={[0.14, 20, 20]} /><meshStandardMaterial color={avatar.hairColor} roughness={0.95} /></mesh>}
      {avatar.hair === "cap" && <group position={[0, 1.58, 0]}><mesh castShadow><sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} /><meshStandardMaterial color="#14213d" roughness={0.5} /></mesh></group>}
      {/* Arms */}
      <mesh castShadow position={[-0.22, 1.22, 0]}><cylinderGeometry args={[0.035, 0.03, 0.3, 12]} /><meshStandardMaterial color={shirtColor} roughness={0.6} /></mesh>
      <mesh castShadow position={[0.22, 1.22, 0]}><cylinderGeometry args={[0.035, 0.03, 0.3, 12]} /><meshStandardMaterial color={shirtColor} roughness={0.6} /></mesh>
      {/* Hands */}
      <mesh castShadow position={[-0.22, 1.05, 0]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial color={avatar.skinTone} roughness={0.5} /></mesh>
      <mesh castShadow position={[0.22, 1.05, 0]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial color={avatar.skinTone} roughness={0.5} /></mesh>
    </group>
  );
}
