"use client";

// src/world/Buildings.tsx — Polished low-poly buildings with windows, roofs,
// AC units, and varied colors. Plus market stalls, parked vehicles, lamp posts,
// billboards, trees, and street props.

import { useMemo } from "react";
import * as THREE from "three";

export interface BuildingProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  roofColor?: string;
}

export function Building({
  position,
  size = [8, 10, 8],
  color = "#f4e4bc",
  roofColor = "#ff6a1a",
}: BuildingProps) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Roof slab */}
      <mesh castShadow position={[0, size[1] + 0.3, 0]}>
        <boxGeometry args={[size[0] + 0.6, 0.6, size[2] + 0.6]} />
        <meshStandardMaterial color={roofColor} roughness={0.8} />
      </mesh>
      {/* Roof detail — small box (water tank / AC) */}
      <mesh castShadow position={[size[0] / 3, size[1] + 1, size[2] / 3]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#7c8a99" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Front windows (glowing) */}
      <mesh position={[0, size[1] * 0.55, size[2] / 2 + 0.01]}>
        <planeGeometry args={[size[0] * 0.7, size[1] * 0.35]} />
        <meshStandardMaterial
          color="#87ceeb"
          emissive="#87ceeb"
          emissiveIntensity={0.25}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      {/* Window frame lines */}
      <mesh position={[0, size[1] * 0.7, size[2] / 2 + 0.02]}>
        <planeGeometry args={[size[0] * 0.7, 0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, size[1] * 0.4, size[2] / 2 + 0.02]}>
        <planeGeometry args={[size[0] * 0.7, 0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Vertical window dividers */}
      <mesh position={[-size[0] * 0.18, size[1] * 0.55, size[2] / 2 + 0.02]}>
        <planeGeometry args={[0.1, size[1] * 0.35]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[size[0] * 0.18, size[1] * 0.55, size[2] / 2 + 0.02]}>
        <planeGeometry args={[0.1, size[1] * 0.35]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Door */}
      <mesh position={[0, size[1] * 0.12, size[2] / 2 + 0.02]}>
        <planeGeometry args={[1, 2.4]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function MarketStall({ position, color = "#1fb86f" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Canopy */}
      <mesh castShadow position={[0, 3, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Roof peak */}
      <mesh castShadow position={[0, 3.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3, 0.8, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Poles */}
      {[[-1.7, -1.2], [1.7, -1.2], [-1.7, 1.2], [1.7, 1.2]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 1.5, z]}>
          <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
      ))}
      {/* Table */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[3.6, 0.2, 2.6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* Goods */}
      <mesh castShadow position={[-1, 1.4, 0]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#ff6a1a" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 1.4, 0.5]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#ffc531" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[1, 1.4, -0.3]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#c026d3" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function LampPost({ position, on = true }: { position: [number, number, number]; on?: boolean }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 6, 8]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, 5.8, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial
          color={on ? "#fff5b8" : "#2a2a2a"}
          emissive={on ? "#fff5b8" : "#000000"}
          emissiveIntensity={on ? 1 : 0}
        />
      </mesh>
      {on && (
        <pointLight position={[0.4, 5.7, 0]} intensity={0.5} distance={10} color="#fff5b8" />
      )}
    </group>
  );
}

export function Billboard({ position, color = "#14213d" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[-2, 2, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#5a4a2a" />
      </mesh>
      <mesh castShadow position={[2, 2, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#5a4a2a" />
      </mesh>
      <mesh castShadow position={[0, 5, 0]}>
        <boxGeometry args={[6, 3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 5, 0.16]}>
        <planeGeometry args={[5.6, 2.6]} />
        <meshBasicMaterial color="#ffc531" />
      </mesh>
    </group>
  );
}

export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#6b3410" roughness={0.9} />
      </mesh>
      {/* Foliage clusters */}
      <mesh castShadow position={[0, 4, 0]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#1fb86f" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[1, 3.2, 0.5]}>
        <sphereGeometry args={[1.4, 10, 10]} />
        <meshStandardMaterial color="#178a55" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.8, 3.5, -0.5]}>
        <sphereGeometry args={[1.2, 10, 10]} />
        <meshStandardMaterial color="#1fb86f" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Street cone
export function Cone({ position }: { position: [number, number, number] }) {
  return (
    <mesh castShadow position={position}>
      <coneGeometry args={[0.3, 0.6, 8]} />
      <meshStandardMaterial color="#ff6a1a" />
    </mesh>
  );
}

// Full city layout — uses the new road network
export function CityLayout() {
  const buildings = useMemo(() => {
    const items: { pos: [number, number, number]; size: [number, number, number]; color: string; roof: string }[] = [
      { pos: [-25, 0, -25], size: [10, 14, 10], color: "#f4e4bc", roof: "#ff6a1a" },
      { pos: [-25, 0, 25],  size: [12, 10, 8],  color: "#e8c987", roof: "#1fb86f" },
      { pos: [25, 0, -25],  size: [8, 18, 8],   color: "#d4af37", roof: "#c026d3" },
      { pos: [25, 0, 25],   size: [10, 12, 10], color: "#f4e4bc", roof: "#14213d" },
      { pos: [-40, 0, 0],   size: [6, 8, 6],    color: "#e8c987", roof: "#ff6a1a" },
      { pos: [40, 0, 0],    size: [6, 8, 6],    color: "#f4e4bc", roof: "#1fb86f" },
    ];
    return items;
  }, []);

  const trees = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const r = 30 + Math.random() * 12;
      positions.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return positions;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} position={b.pos} size={b.size} color={b.color} roofColor={b.roof} />
      ))}

      <MarketStall position={[-15, 0, -10]} color="#1fb86f" />
      <MarketStall position={[-12, 0, -10]} color="#ff6a1a" />
      <MarketStall position={[-9, 0, -10]} color="#c026d3" />
      <MarketStall position={[-15, 0, -7]} color="#ffc531" />
      <MarketStall position={[-12, 0, -7]} color="#7c3aed" />

      <LampPost position={[8, 0, 8]} />
      <LampPost position={[-8, 0, 8]} />
      <LampPost position={[8, 0, -8]} />
      <LampPost position={[-8, 0, -8]} />
      <LampPost position={[20, 0, 0]} />
      <LampPost position={[-20, 0, 0]} />

      {trees.map((pos, i) => (
        <Tree key={i} position={pos} scale={0.8 + Math.random() * 0.4} />
      ))}

      <Billboard position={[35, 0, -15]} color="#14213d" />
      <Billboard position={[-35, 0, 15]} color="#c026d3" />

      {/* Street cones near construction */}
      <Cone position={[15, 0, 12]} />
      <Cone position={[16, 0, 12]} />
      <Cone position={[17, 0, 12]} />
    </group>
  );
}

// Parked vehicles — Danfo (yellow bus) and Keke (tricycle)
function Danfo({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[8, 2, 3.5]} />
        <meshStandardMaterial color="#ffc531" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.2, 1.76]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#1fb86f" />
      </mesh>
      <mesh position={[0, 1.2, -1.76]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#1fb86f" />
      </mesh>
      {[[-3, -1.2], [3, -1.2], [-3, 1.2], [3, 1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// Re-export Danfo and Keke for any code that still imports them from Buildings
export { Danfo, Keke };

function Keke({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[2.5, 1.4, 1.8]} />
        <meshStandardMaterial color="#ff6a1a" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[2.6, 0.3, 1.9]} />
        <meshStandardMaterial color="#ffc531" />
      </mesh>
      {[[0, 1.2], [-1, -0.8], [1, -0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

void THREE;
