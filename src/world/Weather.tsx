"use client";

// src/world/Weather.tsx — weather effects (rain, harmattan haze).

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type WeatherType = "clear" | "rain" | "harmattan";

export interface WeatherProps {
  type: WeatherType;
}

export default function Weather({ type }: WeatherProps) {
  const dropCount = type === "rain" ? 200 : 0;
  const drops = useMemo(
    () =>
      Array.from({ length: dropCount }).map(() => ({
        x: (Math.random() - 0.5) * 100,
        y: Math.random() * 50,
        z: (Math.random() - 0.5) * 100,
        vy: 20 + Math.random() * 15,
      })),
    [dropCount]
  );

  const rainRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useRef(
    drops.map((d) => ({ ...d }))
  ).current;

  useFrame((_, dt) => {
    if (!rainRef.current || type !== "rain") return;
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      p.y -= p.vy * dt;
      if (p.y < 0) p.y = 40 + Math.random() * 10;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(0.05, 0.5, 0.05);
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    }
    rainRef.current.instanceMatrix.needsUpdate = true;
  });

  if (type === "clear") return null;

  return (
    <group>
      {type === "rain" && dropCount > 0 && (
        <instancedMesh ref={rainRef} args={[undefined as never, undefined as never, dropCount]}>
          <cylinderGeometry args={[1, 1, 1, 4]} />
          <meshBasicMaterial color="#b3e5fc" transparent opacity={0.5} />
        </instancedMesh>
      )}
      {type === "harmattan" && (
        <mesh position={[0, 5, 0]}>
          <sphereGeometry args={[80, 16, 16]} />
          <meshBasicMaterial color="#d4a868" transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}
