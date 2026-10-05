"use client";

// src/world/City.tsx — main 3D scene with isometric camera, post-processing,
// new road network, traffic, pedestrians, and NPCs.

import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
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
  const presets = useMemo(() => ({
    low:    { dpr: 0.75, fps: 30 },
    medium: { dpr: 1.0,  fps: 30 },
    high:   { dpr: 1.5,  fps: 60 },
  }), []);
  const preset = presets[quality];
  const [timeOfDay] = useState(0.35);

  return (
    <Canvas
      className="world-canvas"
      shadows={quality === "high"}
      dpr={preset.dpr}
      gl={{ antialias: quality !== "low", powerPreference: "high-performance" }}
      // Isometric-style camera — high angle, looking down at ~45°
      camera={{ position: [0, 35, 35], fov: 35, near: 0.1, far: 300 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(new THREE.Color("#87ceeb"));
        // Lock camera to isometric angle (player moves under it)
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

        {/* Post-processing — bloom + anti-aliasing for polish */}
        {quality !== "low" && (
          <EffectComposer>
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
            <SMAA />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
