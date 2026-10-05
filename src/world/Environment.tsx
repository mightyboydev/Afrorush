"use client";

// src/world/Environment.tsx — Premium lighting: directional sun with shadows,
// hemisphere light, ambient occlusion, procedural sky, vibrant colors.

import { useMemo } from "react";
import { ContactShadows, Sky, Environment as DreiEnv } from "@react-three/drei";
import * as THREE from "three";

export interface EnvironmentProps {
  timeOfDay: number; // 0..1
  quality: "low" | "medium" | "high";
}

export default function Environment({ timeOfDay, quality }: EnvironmentProps) {
  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunHeight = Math.sin(sunAngle);
  const sunX = Math.cos(sunAngle);
  const isDay = sunHeight > -0.1;

  const skyColor = useMemo(() => {
    const c = new THREE.Color();
    if (timeOfDay < 0.25) {
      const t = timeOfDay / 0.25;
      c.lerpColors(new THREE.Color("#1a1f3d"), new THREE.Color("#ffb37a"), t);
    } else if (timeOfDay < 0.5) {
      const t = (timeOfDay - 0.25) / 0.25;
      c.lerpColors(new THREE.Color("#ffb37a"), new THREE.Color("#87ceeb"), t);
    } else if (timeOfDay < 0.75) {
      const t = (timeOfDay - 0.5) / 0.25;
      c.lerpColors(new THREE.Color("#87ceeb"), new THREE.Color("#ff8c42"), t);
    } else {
      const t = (timeOfDay - 0.75) / 0.25;
      c.lerpColors(new THREE.Color("#ff8c42"), new THREE.Color("#1a1f3d"), t);
    }
    return c;
  }, [timeOfDay]);

  const skyHex = `#${skyColor.getHexString()}`;
  const fogFar = quality === "low" ? 80 : quality === "medium" ? 140 : 250;
  const sunPos: [number, number, number] = [sunX * 100, Math.max(10, sunHeight * 100), 30];

  return (
    <>
      {/* Procedural sky */}
      {quality !== "low" && isDay && (
        <Sky distance={400} sunPosition={sunPos} inclination={0.5} azimuth={0.25} turbidity={3} rayleigh={1.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      )}
      {quality === "low" && <color attach="background" args={[skyHex]} />}
      <fog attach="fog" args={[skyHex, 40, fogFar]} />

      {/* Hemisphere light — sky blue from top, warm ground bounce from bottom.
          Higher intensity for that bright, vibrant look. */}
      <hemisphereLight args={["#b3e5fc", "#c2a875", isDay ? 1.0 : 0.3]} />

      {/* Soft ambient fill */}
      <ambientLight intensity={isDay ? 0.4 : 0.15} color={isDay ? "#ffffff" : "#3d4f8a"} />

      {/* Main directional "sun" — with real-time shadows for depth */}
      <directionalLight
        position={[sunX * 50, Math.max(10, sunHeight * 60), 20]}
        intensity={isDay ? 1.5 : 0.2}
        color={isDay ? "#fff5e1" : "#9bb8ff"}
        castShadow={quality !== "low"}
        shadow-mapSize-width={quality === "high" ? 2048 : 1024}
        shadow-mapSize-height={quality === "high" ? 2048 : 1024}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Ground — vibrant green grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#5fb83a" roughness={0.95} />
      </mesh>

      {/* Sun sphere */}
      {isDay && (
        <mesh position={[sunX * 80, sunHeight * 80 + 10, -40]}>
          <sphereGeometry args={[6, 16, 16]} />
          <meshBasicMaterial color="#fff5b8" />
        </mesh>
      )}
      {!isDay && (
        <mesh position={[-sunX * 60, 30, -40]}>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial color="#e8e8f0" />
        </mesh>
      )}

      {/* Contact shadows — soft blob shadows for depth */}
      {quality !== "low" && (
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={120}
          far={20}
          blur={2.5}
          opacity={0.4}
          color="#1a2a1a"
          resolution={quality === "high" ? 1024 : 512}
        />
      )}

      {/* Environment lighting for PBR reflections (premium look) */}
      {quality === "high" && <DreiEnv preset="sunset" />}
    </>
  );
}
