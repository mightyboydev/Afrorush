"use client";

// src/world/Buildings.tsx — low-poly buildings for Motor Park district.

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
      {/* Roof */}
      <mesh castShadow position={[0, size[1] + 0.5, 0]}>
        <boxGeometry args={[size[0] + 0.6, 1, size[2] + 0.6]} />
        <meshStandardMaterial color={roofColor} roughness={0.8} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, size[1] * 0.55, size[2] / 2 + 0.01]}>
        <planeGeometry args={[size[0] * 0.6, size[1] * 0.3]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, size[1] * 0.55, -size[2] / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size[0] * 0.6, size[1] * 0.3]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// A stylized market stall — colorful canopy + table.
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
      {/* Table */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[3.6, 0.2, 2.6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* Table legs */}
      {[[-1.6, -1], [1.6, -1], [-1.6, 1], [1.6, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]}>
          <boxGeometry args={[0.2, 1.2, 0.2]} />
          <meshStandardMaterial color="#6b3410" />
        </mesh>
      ))}
      {/* Goods on the table */}
      <mesh castShadow position={[-1, 1.4, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#ff6a1a" />
      </mesh>
      <mesh castShadow position={[0, 1.4, 0.5]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#ffc531" />
      </mesh>
      <mesh castShadow position={[1, 1.4, -0.3]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#c026d3" />
      </mesh>
    </group>
  );
}

// A parked danfo bus (yellow with stripes).
export function Danfo({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[8, 2, 3.5]} />
        <meshStandardMaterial color="#ffc531" roughness={0.6} />
      </mesh>
      {/* Yellow body with green stripe (Naija style) */}
      <mesh position={[0, 1.2, 1.76]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#1fb86f" />
      </mesh>
      <mesh position={[0, 1.2, -1.76]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#1fb86f" />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 2.2, 1.77]}>
        <planeGeometry args={[7, 0.6]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 2.2, -1.77]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[7, 0.6]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.2} />
      </mesh>
      {/* Wheels */}
      {[[-3, -1.2], [3, -1.2], [-3, 1.2], [3, 1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// A parked keke (tricycle).
export function Keke({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[2.5, 1.4, 1.8]} />
        <meshStandardMaterial color="#ff6a1a" roughness={0.6} />
      </mesh>
      {/* Canopy */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[2.6, 0.3, 1.9]} />
        <meshStandardMaterial color="#ffc531" />
      </mesh>
      {/* Wheels */}
      {[[0, 1.2], [-1, -0.8], [1, -0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// A simple lamp post.
export function LampPost({ position, on = true }: { position: [number, number, number]; on?: boolean }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 6, 8]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} />
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
        <pointLight position={[0.4, 5.7, 0]} intensity={0.6} distance={12} color="#fff5b8" />
      )}
    </group>
  );
}

// A billboard placeholder.
export function Billboard({ position, color = "#14213d" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Posts */}
      <mesh castShadow position={[-2, 2, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#5a4a2a" />
      </mesh>
      <mesh castShadow position={[2, 2, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#5a4a2a" />
      </mesh>
      {/* Board */}
      <mesh castShadow position={[0, 5, 0]}>
        <boxGeometry args={[6, 3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Ad face */}
      <mesh position={[0, 5, 0.16]}>
        <planeGeometry args={[5.6, 2.6]} />
        <meshBasicMaterial color="#ffc531" />
      </mesh>
    </group>
  );
}

// A tree (low-poly — sphere canopy + cylinder trunk).
export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#6b3410" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 4, 0]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#1fb86f" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[1, 3.2, 0.5]}>
        <sphereGeometry args={[1.4, 10, 10]} />
        <meshStandardMaterial color="#178a55" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Full city layout for the Motor Park district.
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
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 35 + Math.random() * 10;
      positions.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Buildings around the perimeter */}
      {buildings.map((b, i) => (
        <Building key={i} position={b.pos} size={b.size} color={b.color} roofColor={b.roof} />
      ))}

      {/* Market stalls in a cluster */}
      <MarketStall position={[-15, 0, -10]} color="#1fb86f" />
      <MarketStall position={[-12, 0, -10]} color="#ff6a1a" />
      <MarketStall position={[-9, 0, -10]} color="#c026d3" />
      <MarketStall position={[-15, 0, -7]} color="#ffc531" />
      <MarketStall position={[-12, 0, -7]} color="#7c3aed" />

      {/* Parked vehicles */}
      <Danfo position={[15, 0, -8]} rotation={0.2} />
      <Danfo position={[18, 0, -8]} rotation={0.2} />
      <Keke position={[10, 0, 8]} rotation={-0.3} />
      <Keke position={[13, 0, 8]} rotation={-0.3} />

      {/* Lamp posts around the hub */}
      <LampPost position={[8, 0, 8]} />
      <LampPost position={[-8, 0, 8]} />
      <LampPost position={[8, 0, -8]} />
      <LampPost position={[-8, 0, -8]} />
      <LampPost position={[20, 0, 0]} />
      <LampPost position={[-20, 0, 0]} />

      {/* Trees scattered around */}
      {trees.map((pos, i) => (
        <Tree key={i} position={pos} scale={0.8 + Math.random() * 0.4} />
      ))}

      {/* Billboards */}
      <Billboard position={[35, 0, -15]} color="#14213d" />
      <Billboard position={[-35, 0, 15]} color="#c026d3" />
    </group>
  );
}
