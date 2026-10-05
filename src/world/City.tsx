"use client";

// src/world/City.tsx — main 3D scene with isometric camera, premium post-processing,
// higher DPR for "4K HD" feel, stronger bloom, vignette, color grading.

import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, SMAA, Vignette, BrightnessContrast, HueSaturation } from "@react-three/postprocessing";
import * as THREE from "three";
import Environment from "./Environment";
import { CityLayout } from "./Buildings";
import { RoadNetwork, Pedestrians } from "./Roads";
import { NPCGroup, type NPCData } from "./NPCs";
import OtherPlayers from "./OtherPlayers";
import Weather, { type WeatherType } from "./Weather";
import Player, { type PlayerHandle } from "./Player";
import type { AvatarConfig } from "@/lib/storage";

export interface CityProps {
  avatar: AvatarConfig;
  quality: "low" | "medium" | "high";
  riding: boolean;
  inputRef: React.MutableRefObject<{ x: number; y: number; boost: boolean }>;
  weather?: WeatherType;
  onTalkToNPC?: (npc: NPCData) => void;
  onReady?: () => void;
}

export default function City({ avatar, quality, riding, inputRef, weather = "clear", onTalkToNPC, onReady }: CityProps) {
  const playerRef = useRef<PlayerHandle>(null);
  // Higher DPR for sharper "4K HD" look
  const presets = useMemo(() => ({
    low:    { dpr: 1.0,  fps: 30 },
    medium: { dpr: 1.5,  fps: 30 },
    high:   { dpr: 2.0,  fps: 60 },
  }), []);
  const preset = presets[quality];
  const [timeOfDay] = useState(0.35);

  return (
    <Canvas
      className="world-canvas"
      shadows={quality !== "low"}
      dpr={preset.dpr}
      gl={{
        antialias: quality !== "low",
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ position: [0, 25, 25], fov: 40, near: 0.1, far: 300 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(new THREE.Color("#87ceeb"));
        camera.lookAt(0, 0, 0);
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <Environment timeOfDay={timeOfDay} quality={quality} />
        <RoadNetwork />
        <CityLayout />
        <Pedestrians />
        <NPCGroup onTalk={onTalkToNPC ?? (() => {})} />
        <OtherPlayers />
        <Weather type={weather} />
        <Player
          ref={playerRef}
          avatar={avatar}
          riding={riding}
          inputRef={inputRef}
          quality={quality}
        />

        {/* Premium post-processing — stronger bloom, vignette, color grading */}
        {quality !== "low" && (
          <EffectComposer>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.3}
              mipmapBlur
              radius={0.7}
            />
            <HueSaturation saturation={0.15} />
            <BrightnessContrast brightness={0.02} contrast={0.1} />
            <Vignette eskil={false} offset={0.3} darkness={0.5} />
            <SMAA />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
