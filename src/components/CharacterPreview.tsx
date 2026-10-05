"use client";

// src/components/CharacterPreview.tsx — 3D character turntable for onboarding.
// Drag to rotate, see your character from all angles.

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, ContactShadows, Environment as DreiEnv } from "@react-three/drei";
import type { AvatarConfig } from "@/lib/storage";

export interface CharacterPreviewProps {
  avatar: AvatarConfig;
  height?: number;
}

export default function CharacterPreview({ avatar, height = 300 }: CharacterPreviewProps) {
  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#b3e5fc]/40 to-[#fff8e7]/40">
      <Canvas
        shadows
        dpr={1.5}
        camera={{ position: [0, 1.2, 3], fov: 35 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#00000000"))}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <hemisphereLight args={["#b3e5fc", "#c2a875", 0.6]} />

          {/* Character model */}
          <CharacterModel avatar={avatar} />

          {/* Ground + shadows */}
          <ContactShadows position={[0, 0, 0]} scale={3} far={2} blur={2} opacity={0.3} color="#1a2a1a" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[2, 32]} />
            <meshStandardMaterial color="#f3f0e7" roughness={0.9} />
          </mesh>

          {/* Environment reflections */}
          <DreiEnv preset="sunset" />

          {/* Orbit controls — drag to rotate */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={1.5}
            target={[0, 0.8, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Character model — reuses the realistic human proportions from Player.tsx
function CharacterModel({ avatar }: { avatar: AvatarConfig }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      // Subtle idle breathing
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  const shirtColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#ffffff";
  const pantsColor = "#1e3a5f";

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* LEGS */}
      <mesh castShadow position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
        <meshStandardMaterial color={pantsColor} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
        <meshStandardMaterial color={pantsColor} roughness={0.7} />
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

      {/* HIPS */}
      <mesh castShadow position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.12, 0.05, 8, 16]} />
        <meshStandardMaterial color={pantsColor} roughness={0.7} />
      </mesh>

      {/* TORSO — tapered */}
      <mesh castShadow position={[0, 1.15, 0]} scale={[1, 1, 0.7]}>
        <capsuleGeometry args={[0.17, 0.3, 12, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Shoulders */}
      <mesh castShadow position={[0, 1.32, 0]}>
        <boxGeometry args={[0.36, 0.1, 0.18]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* NECK */}
      <mesh castShadow position={[0, 1.47, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>

      {/* HEAD */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
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

      {/* Nose */}
      <mesh position={[0, 1.61, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.02, 0.04, 8]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 1.57, 0.1]}>
        <boxGeometry args={[0.04, 0.006, 0.01]} />
        <meshStandardMaterial color="#5a2a1a" roughness={0.6} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.1, 1.62, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 1.62, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
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
          <mesh castShadow position={[0, -0.02, 0.1]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 12, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#14213d" roughness={0.5} />
          </mesh>
        </group>
      )}
      {avatar.hair === "locs" && (
        <group position={[0, 1.67, 0]}>
          {[-0.08, -0.02, 0.02, 0.08].map((x, i) => (
            <mesh key={i} castShadow position={[x, 0.04, 0.07 + (i % 2) * 0.03]}>
              <capsuleGeometry args={[0.02, 0.15, 8, 12]} />
              <meshStandardMaterial color={avatar.hairColor} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}
      {avatar.hair === "bald" && null}

      {/* ARMS — slender */}
      <mesh castShadow position={[-0.22, 1.32, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.22, 1.15, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.25, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.22, 1.0, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>

      <mesh castShadow position={[0.22, 1.32, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.22, 1.15, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.25, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.22, 1.0, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
    </group>
  );
}
