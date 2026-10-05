"use client";

// src/world/Roads.tsx — Proper road grid with sidewalks, intersections, lane markings,
// and moving traffic (cars that follow waypoint paths).

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Road network — a cross + ring road through Motor Park
const ROAD_WIDTH = 10;
const SIDEWALK_WIDTH = 1.5;

// Waypoints for traffic cars to follow (figure-8 through the city)
const TRAFFIC_PATHS: [number, number, number][][] = [
  // Path 1: Outer ring clockwise
  [
    [-40, 0.5, -40], [-40, 0.5, 40], [40, 0.5, 40], [40, 0.5, -40], [-40, 0.5, -40],
  ],
  // Path 2: Cross road
  [
    [-50, 0.5, 0], [50, 0.5, 0],
  ],
  // Path 3: Vertical road
  [
    [0, 0.5, -50], [0, 0.5, 50],
  ],
];

export function RoadNetwork() {
  return (
    <group>
      {/* Horizontal main road */}
      <RoadSegment position={[0, 0.02, 0]} rotation={[0, 0, 0]} length={120} width={ROAD_WIDTH} />
      {/* Vertical main road */}
      <RoadSegment position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} length={120} width={ROAD_WIDTH} />
      {/* Ring road (4 segments) */}
      <RoadSegment position={[0, 0.02, 40]} rotation={[0, 0, 0]} length={90} width={ROAD_WIDTH - 2} />
      <RoadSegment position={[0, 0.02, -40]} rotation={[0, 0, 0]} length={90} width={ROAD_WIDTH - 2} />
      <RoadSegment position={[40, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} length={90} width={ROAD_WIDTH - 2} />
      <RoadSegment position={[-40, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} length={90} width={ROAD_WIDTH - 2} />

      {/* Sidewalks along main roads */}
      <Sidewalk position={[0, 0.05, ROAD_WIDTH / 2 + 0.5]} length={120} />
      <Sidewalk position={[0, 0.05, -ROAD_WIDTH / 2 - 0.5]} length={120} />
      <Sidewalk position={[ROAD_WIDTH / 2 + 0.5, 0.05, 0]} length={120} rotation={Math.PI / 2} />
      <Sidewalk position={[-ROAD_WIDTH / 2 - 0.5, 0.05, 0]} length={120} rotation={Math.PI / 2} />

      {/* Intersection markings (crosswalk zebra stripes) */}
      <Crosswalk position={[0, 0.03, 0]} />

      {/* Traffic */}
      <Traffic />
    </group>
  );
}

function RoadSegment({
  position,
  rotation,
  length,
  width,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  width: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.85} />
      </mesh>
      {/* Center yellow line (dashed) */}
      {Array.from({ length: Math.floor(length / 8) }).map((_, i) => (
        <mesh
          key={`center-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[(i - Math.floor(length / 8) / 2) * 8 + 4, 0.01, 0]}
        >
          <planeGeometry args={[4, 0.3]} />
          <meshBasicMaterial color="#ffc531" />
        </mesh>
      ))}
      {/* White edge lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, width / 2 - 0.3]}>
        <planeGeometry args={[length, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -width / 2 + 0.3]}>
        <planeGeometry args={[length, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Sidewalk({
  position,
  length,
  rotation = 0,
}: {
  position: [number, number, number];
  length: number;
  rotation?: number;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, rotation]}
      position={position}
      receiveShadow
    >
      <planeGeometry args={[SIDEWALK_WIDTH, length]} />
      <meshStandardMaterial color="#d4c5a0" roughness={0.9} />
    </mesh>
  );
}

function Crosswalk({ position }: { position: [number, number, number] }) {
  // Zebra stripes at intersection
  return (
    <group position={position}>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i}>
          {/* North side */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[i * 1.5 - 3.75, 0.04, 5.5]}>
            <planeGeometry args={[1, 3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* South side */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[i * 1.5 - 3.75, 0.04, -5.5]}>
            <planeGeometry args={[1, 3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* East side */}
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[5.5, 0.04, i * 1.5 - 3.75]}>
            <planeGeometry args={[1, 3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* West side */}
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[-5.5, 0.04, i * 1.5 - 3.75]}>
            <planeGeometry args={[1, 3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- Traffic (moving cars) ----------

function Traffic() {
  const cars = useMemo(
    () => [
      { path: TRAFFIC_PATHS[0], speed: 8, color: "#ff6a1a", offset: 0, type: "sedan" as const },
      { path: TRAFFIC_PATHS[0], speed: 8, color: "#1fb86f", offset: 0.33, type: "danfo" as const },
      { path: TRAFFIC_PATHS[0], speed: 8, color: "#16a3b1", offset: 0.66, type: "sedan" as const },
      { path: TRAFFIC_PATHS[1], speed: 10, color: "#c026d3", offset: 0.2, type: "sedan" as const },
      { path: TRAFFIC_PATHS[2], speed: 10, color: "#ffc531", offset: 0.5, type: "danfo" as const },
      { path: TRAFFIC_PATHS[2], speed: 12, color: "#14213d", offset: 0.8, type: "sedan" as const },
    ],
    []
  );

  return (
    <group>
      {cars.map((car, i) => (
        <TrafficCar key={i} {...car} />
      ))}
    </group>
  );
}

function TrafficCar({
  path,
  speed,
  color,
  offset,
  type,
}: {
  path: [number, number, number][];
  speed: number;
  color: string;
  offset: number;
  type: "sedan" | "danfo";
}) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(offset);
  const segmentIdx = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const pts = path;
    const seg = segmentIdx.current;
    const from = pts[seg];
    const to = pts[(seg + 1) % pts.length];
    const segLen = Math.sqrt(
      Math.pow(to[0] - from[0], 2) + Math.pow(to[2] - from[2], 2)
    );
    progress.current += (speed * dt) / segLen;
    if (progress.current >= 1) {
      progress.current -= 1;
      segmentIdx.current = (seg + 1) % pts.length;
    }
    const t = progress.current;
    const x = from[0] + (to[0] - from[0]) * t;
    const z = from[2] + (to[2] - from[2]) * t;
    ref.current.position.set(x, 0.4, z);
    // Face direction of travel
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    ref.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={ref}>
      {type === "sedan" ? <SedanModel color={color} /> : <DanfoModel color={color} />}
    </group>
  );
}

function SedanModel({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 0.5, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.4, 0.5, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.72, 0.91]}>
        <planeGeometry args={[1.3, 0.4]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, -0.91]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.3, 0.4]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, 1], [0.8, 1], [-0.8, -1], [0.8, -1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z * 1.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[0.5, 0.3, 1.6]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#fff5b8" />
      </mesh>
      <mesh position={[-0.5, 0.3, 1.6]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#fff5b8" />
      </mesh>
    </group>
  );
}

function DanfoModel({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[2, 1.2, 4]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Green stripe */}
      <mesh position={[0, 0.6, 1.01]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="#1fb86f" />
      </mesh>
      <mesh position={[0, 0.6, -1.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="#1fb86f" />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 1.0, 1.01]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.0, -1.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// NPC pedestrians walking on sidewalks
export function Pedestrians() {
  const peds = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        path: [
          [-ROAD_WIDTH / 2 - 1, 0, -40 + i * 10] as [number, number, number],
          [-ROAD_WIDTH / 2 - 1, 0, 40 - i * 5] as [number, number, number],
        ],
        speed: 2 + Math.random(),
        color: ["#ff6a1a", "#1fb86f", "#c026d3", "#16a3b1", "#ffc531"][i % 5],
        offset: Math.random(),
      })),
    []
  );

  return (
    <group>
      {peds.map((p, i) => (
        <Pedestrian key={i} {...p} />
      ))}
    </group>
  );
}

function Pedestrian({
  path,
  speed,
  color,
  offset,
}: {
  path: [number, number, number][];
  speed: number;
  color: string;
  offset: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(offset);
  const dir = useRef(1);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const from = path[0];
    const to = path[1];
    const segLen = Math.sqrt(
      Math.pow(to[0] - from[0], 2) + Math.pow(to[2] - from[2], 2)
    );
    progress.current += (speed * dt * dir.current) / segLen;
    if (progress.current >= 1) { progress.current = 1; dir.current = -1; }
    if (progress.current <= 0) { progress.current = 0; dir.current = 1; }
    const t = progress.current;
    ref.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      0,
      from[2] + (to[2] - from[2]) * t
    );
    const dx = (to[0] - from[0]) * dir.current;
    const dz = (to[2] - from[2]) * dir.current;
    ref.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={ref}>
      {/* Simple low-poly pedestrian */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#8d5524" />
      </mesh>
      {/* Legs */}
      <mesh castShadow position={[-0.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      <mesh castShadow position={[0.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
    </group>
  );
}
