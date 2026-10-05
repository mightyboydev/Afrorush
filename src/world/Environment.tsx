"use client";

// src/world/Environment.tsx — sky, lighting, ground plane, day/night cycle.

import { useRef, useMemo } from "react";
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
  const fogFar = quality === "low" ? 60 : quality === "medium" ? 100 : 200;

  return (
    <>
      <color attach="background" args={[skyHex]} />
      <fog attach="fog" args={[skyHex, 30, fogFar]} />

      <ambientLight intensity={isDay ? 0.7 : 0.25} color={isDay ? "#ffffff" : "#3d4f8a"} />

      <directionalLight
        position={[sunX * 50, Math.max(5, sunHeight * 60), 20]}
        intensity={isDay ? 1.2 : 0.15}
        color={isDay ? "#fff5e1" : "#9bb8ff"}
        castShadow={quality === "high" && isDay}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#c2a875" roughness={0.95} />
      </mesh>

      <RoadStrip />

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
    </>
  );
}

function RoadStrip() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[12, 120]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={`lane-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(i - 6) * 10, 0.02, 0]}>
            <planeGeometry args={[4, 0.4]} />
            <meshBasicMaterial color="#ffc531" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, (i - 6) * 10]}>
            <planeGeometry args={[0.4, 4]} />
            <meshBasicMaterial color="#ffc531" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
