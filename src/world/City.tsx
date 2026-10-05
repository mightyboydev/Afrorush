"use client";

// src/world/City.tsx — main 3D scene wrapper. Loads Canvas, environment,
// buildings, player, and handles controls. Quality from profile.

import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Environment from "./Environment";
import { CityLayout } from "./Buildings";
import Player, { type PlayerHandle } from "./Player";
import type { AvatarConfig } from "@/lib/storage";

export interface CityProps {
  avatar: AvatarConfig;
  quality: "low" | "medium" | "high";
  riding: boolean;
  inputRef: React.MutableRefObject<{ x: number; y: number; boost: boolean }>;
  onReady?: () => void;
}

export default function City({ avatar, quality, riding, inputRef, onReady }: CityProps) {
  const [timeOfDay] = useState(0.35); // morning — Phase 5 will animate this
  const playerRef = useRef<PlayerHandle>(null);
  const presets = useMemo(() => ({
    low:    { dpr: 0.75, fps: 30 },
    medium: { dpr: 1.0,  fps: 30 },
    high:   { dpr: 1.5,  fps: 60 },
  }), []);
  const preset = presets[quality];

  return (
    <Canvas
      className="world-canvas"
      shadows={quality === "high"}
      dpr={preset.dpr}
      gl={{ antialias: quality !== "low", powerPreference: "high-performance" }}
      camera={{ position: [0, 8, 12], fov: 55, near: 0.1, far: 250 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#87ceeb"));
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <Environment timeOfDay={timeOfDay} quality={quality} />
        <CityLayout />
        <Player
          ref={playerRef}
          avatar={avatar}
          riding={riding}
          inputRef={inputRef}
          quality={quality}
        />
      </Suspense>
    </Canvas>
  );
}
