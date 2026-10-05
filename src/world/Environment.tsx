"use client";

// src/world/Environment.tsx — Hemisphere lighting, soft ambient, contact shadows,
// day/night sky cycle. Designed for a bright, polished, isometric look.

import { useMemo } from "react";
import { ContactShadows, Sky } from "@react-three/drei";
import * as THREE from "three";

export interface EnvironmentProps {
  timeOfDay: number; // 0..1 (0=midnight, 0.25=sunrise, 0.5=noon, 0.75=sunset)
  quality: "low" | "medium" | "high";
}

export default function Environment({ timeOfDay, quality }: EnvironmentProps) {
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

  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunHeight = Math.sin(sunAngle);
  const sunX = Math.cos(sunAngle);
  const isDay = sunHeight > -0.1;
  const skyHex = `#${skyColor.getHexString()}`;
  const fogFar = quality === "low" ? 80 : quality === "medium" ? 140 : 250;

  // Sun position for the drei <Sky>
  const sunPos: [number, number, number] = [sunX * 100, Math.max(5, sunHeight * 100), 30];

  return (
    <>
      {/* Drei procedural sky (skip on low quality for perf) */}
      {quality !== "low" && isDay && (
        <Sky
          distance={400}
          sunPosition={sunPos}
          inclination={0.5}
          azimuth={0.25}
          turbidity={3}
          rayleigh={1.5}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}
      {quality === "low" && (
        <color attach="background" args={[skyHex]} />
      )}
      <fog attach="fog" args={[skyHex, 40, fogFar]} />

      {/* Hemisphere light — sky color from top, warm ground bounce from bottom.
          This is the KEY to that soft, polished, "everything is evenly lit" look. */}
      <hemisphereLight
        args={["#b3e5fc", "#c2a875", isDay ? 0.8 : 0.25]}
      />

      {/* Soft ambient fill */}
      <ambientLight intensity={isDay ? 0.3 : 0.1} color={isDay ? "#ffffff" : "#3d4f8a"} />

      {/* Main directional "sun" light — no shadows (we use ContactShadows instead) */}
      <directionalLight
        position={[sunX * 50, Math.max(5, sunHeight * 60), 20]}
        intensity={isDay ? 1.0 : 0.1}
        color={isDay ? "#fff5e1" : "#9bb8ff"}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#8db965" roughness={0.95} />
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

      {/* Contact shadows — soft blob shadows under everything.
          This gives depth without the perf cost of real-time shadow maps. */}
      {quality !== "low" && (
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={120}
          far={20}
          blur={2.5}
          opacity={0.35}
          color="#1a2a1a"
          resolution={quality === "high" ? 1024 : 512}
        />
      )}
    </>
  );
}
