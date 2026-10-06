"use client";

// src/world/City.tsx — 3D scene with isometric camera, zoom (pinch + scroll),
// pan, camera follows player, premium post-processing, "4K HD" DPR.

import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
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

const MIN_ZOOM = 8;   // very close
const MAX_ZOOM = 55;  // far out

export default function City({ avatar, quality, riding, inputRef, weather = "clear", onTalkToNPC, onReady }: CityProps) {
  const playerRef = useRef<PlayerHandle>(null);
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0)); // shared between Player + CameraControls
  const presets = useMemo(() => ({
    low:    { dpr: 1.0,  fps: 30 },
    medium: { dpr: 2.0,  fps: 30 },
    high:   { dpr: 2.5,  fps: 60 },
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
          onMove={(pos) => { playerPosRef.current.copy(pos); }}
        />

        {/* Zoom + pan + player-follow camera controls */}
        <CameraControls playerPosRef={playerPosRef} />

        {/* Premium post-processing */}
        {quality !== "low" && (
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.4} />
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

// ---------- Camera Controls (zoom + pan + player follow) ----------

function CameraControls({ playerPosRef }: { playerPosRef: React.MutableRefObject<THREE.Vector3> }) {
  const { camera, gl } = useThree();
  const zoomRef = useRef(25);
  const panRef = useRef({ x: 0, z: 0 });
  const targetZoom = useRef(25);
  const targetPan = useRef({ x: 0, z: 0 });

  useEffect(() => {
    const dom = gl.domElement;
    let lastPinchDist = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 2 : -2;
      targetZoom.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom.current + delta));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = (lastPinchDist - dist) * 0.1;
        targetZoom.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom.current + delta));
        lastPinchDist = dist;
      }
    };

    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("touchstart", onTouchStart, { passive: false });
    dom.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
    };
  }, [gl]);

  // Smoothly apply zoom + follow player.
  // The camera sits at a RIGID offset from a smoothed focus point, so it can't wobble.
  const focus = useRef({ x: 0, z: 0, ready: false });
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05); // ignore frame spikes
    const kFocus = 1 - Math.exp(-dt * 9);
    const kZoom = 1 - Math.exp(-dt * 7);

    zoomRef.current += (targetZoom.current - zoomRef.current) * kZoom;

    const tx = playerPosRef.current.x + targetPan.current.x;
    const tz = playerPosRef.current.z + targetPan.current.z;
    const f = focus.current;
    if (!f.ready) { f.x = tx; f.z = tz; f.ready = true; }
    f.x += (tx - f.x) * kFocus;
    f.z += (tz - f.z) * kFocus;

    // Isometric angle: camera above and behind at 45 degrees
    const angle = Math.PI / 4;
    camera.position.set(
      f.x,
      zoomRef.current * Math.sin(angle),
      f.z + zoomRef.current * Math.cos(angle)
    );
    camera.lookAt(f.x, 1, f.z);
  });

  return null;
}
