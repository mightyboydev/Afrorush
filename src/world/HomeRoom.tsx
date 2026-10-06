"use client";

// src/world/HomeRoom.tsx — Polished isometric "yard / motor-park corner" scene.
// Inspired by Lagos Life: small detailed compound with okada, plastic chairs,
// suya grill, generator, low fence, concrete + dirt floor. Player is a smaller
// figure standing inside the scene (not a giant mannequin). Soft shadows.

import { useRef, Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, SoftShadows } from "@react-three/drei";
import * as THREE from "three";
import type { AvatarConfig } from "@/lib/storage";

export interface HomeRoomProps {
  avatar: AvatarConfig;
  quality?: "low" | "medium" | "high";
  onReady?: () => void;
}

// ---------- WebGL detector ----------
function hasWebGL(): boolean {
  if (typeof window === "undefined") return true; // assume ok during SSR
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function HomeRoom({ avatar, quality = "medium", onReady }: HomeRoomProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  // Fallback: simple 2D scene with CSS gradient + emoji character
  if (webglOk === false) {
    return <SceneFallback avatar={avatar} onReady={onReady} />;
  }
  if (webglOk === null) {
    return <div className="h-full w-full" />; // wait for client detection
  }

  const dpr = quality === "high" ? 2.0 : quality === "medium" ? 1.5 : 1.0;

  return (
    <Canvas
      shadows
      dpr={dpr}
      // Isometric-style camera: high angle, looking down at ~30°
      camera={{ position: [6, 7.5, 6], fov: 28, near: 0.1, far: 60 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color("#caa974"));
        scene.fog = new THREE.Fog("#caa974", 18, 32);
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <SoftShadows size={12} samples={6} focus={0.85} />
        {/* Warm afternoon light */}
        <ambientLight intensity={0.55} color="#ffe4b5" />
        <hemisphereLight args={["#ffe4b5", "#3a2a1a", 0.45]} />
        <directionalLight
          position={[6, 9, 4]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0004}
          color="#fff0d4"
        />
        <pointLight position={[-3, 3.5, -3]} intensity={0.35} color="#ff9f43" distance={9} />

        <Yard avatar={avatar} />
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={14}
          far={5}
          blur={3}
          opacity={0.32}
          color="#3a2a1a"
          resolution={1024}
        />
      </Suspense>
    </Canvas>
  );
}

// ===================== FALLBACK =====================

function SceneFallback({ avatar, onReady }: { avatar: AvatarConfig; onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  // Warm "compound" gradient backdrop
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f5d28a 0%, #e8c068 35%, #c9a25c 65%, #8b6a3a 100%)",
        }}
      />
      {/* Sun */}
      <div
        className="absolute right-6 top-10 h-16 w-16 rounded-full"
        style={{ background: "radial-gradient(circle, #fff5d6 0%, #ffd86b 60%, transparent 100%)" }}
      />
      {/* Floor pattern */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #8b6a3a 0 14px, #a47e44 14px 28px)",
          borderTop: "3px solid #6b4f24",
        }}
      />
      {/* Stylised character */}
      <div className="absolute inset-x-0 bottom-1/3 flex justify-center">
        <div
          className="text-7xl"
          style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }}
        >
          🧍🏽
        </div>
      </div>
      {/* Decorative props */}
      <div className="absolute bottom-1/4 left-6 text-4xl">🏍️</div>
      <div className="absolute bottom-1/4 right-6 text-4xl">🪑</div>
      <div className="absolute top-1/3 left-8 text-3xl opacity-80">🌤️</div>
    </div>
  );
}

// ===================== 3D YARD =====================

function Yard({ avatar }: { avatar: AvatarConfig }) {
  // Compute shirt color from outfit (kept consistent with previous Room)
  const shirtColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#ffffff";

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      <Ground />
      <PerimeterFence />
      <Okada />
      <PlasticChairs />
      <SuyaGrill />
      <Generator />
      <SideTable />
      <ClothesLine />
      <PottedPlant />
      <CeilingFanPole />
      {/* Player is offset to a corner so it feels grounded in the space */}
      <group position={[0.2, 0, 0.5]} rotation={[0, -0.6, 0]}>
        <RoomAvatar avatar={avatar} shirtColor={shirtColor} />
      </group>
    </group>
  );
}

// ---------- GROUND ----------
function Ground() {
  // Concrete slab (centre) + dirt edges ring (around)
  return (
    <group>
      {/* Big dirt base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#8b6a3a" roughness={1} />
      </mesh>
      {/* Concrete slab — main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#b8a880" roughness={0.95} />
      </mesh>
      {/* Concrete tile lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.025, i - 4]}
          >
            <planeGeometry args={[9, 0.04]} />
            <meshStandardMaterial color="#8b7a52" roughness={0.95} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[i - 4, 0.025, 0]}
          >
            <planeGeometry args={[0.04, 9]} />
            <meshStandardMaterial color="#8b7a52" roughness={0.95} />
          </mesh>
        </group>
      ))}
      {/* A few grass tufts at edges for lived-in feel */}
      <GrassTufts />
    </group>
  );
}

function GrassTufts() {
  // Pre-compute positions so they don't move every render
  const tufts = useMemo(
    () => [
      [-6.5, 6.5], [-7.2, 5], [-6, 7.2], [6.5, -6.5], [7, -5], [6, -7.2],
      [-6.5, -6.5], [6.5, 6.5], [-7.5, -3], [7.5, 3],
    ],
    []
  );
  return (
    <group>
      {tufts.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2, 3, 4].map((j) => (
            <mesh
              key={j}
              castShadow
              position={[
                (j - 2) * 0.08,
                0.15,
                (Math.sin(j) * 0.05),
              ]}
              rotation={[(Math.PI / 2) + (j - 2) * 0.25, 0, 0]}
            >
              <planeGeometry args={[0.05, 0.4]} />
              <meshStandardMaterial color="#3d8a3a" roughness={1} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ---------- FENCE ----------
function PerimeterFence() {
  // Low concrete block fence with a few block posts
  const fenceMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a08560", roughness: 0.95 }),
    []
  );
  return (
    <group>
      {/* Back fence */}
      <mesh position={[0, 0.45, -5.5]} castShadow receiveShadow>
        <boxGeometry args={[11, 0.9, 0.2]} />
        <primitive object={fenceMat} attach="material" />
      </mesh>
      {/* Left fence */}
      <mesh position={[-5.5, 0.45, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[11, 0.9, 0.2]} />
        <primitive object={fenceMat} attach="material" />
      </mesh>
      {/* Right fence — with a gap (entrance) */}
      <mesh position={[5.5, 0.45, -3.5]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.9, 0.2]} />
        <primitive object={fenceMat} attach="material" />
      </mesh>
      <mesh position={[5.5, 0.45, 3.5]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.9, 0.2]} />
        <primitive object={fenceMat} attach="material" />
      </mesh>
      {/* Front fence — split for entrance */}
      <mesh position={[-3.5, 0.45, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.9, 0.2]} />
        <primitive object={fenceMat} attach="material" />
      </mesh>
      <mesh position={[3.5, 0.45, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.9, 0.2]} />
        <primitive object={fenceMat} attach="material" />
      </mesh>
      {/* Fence posts */}
      {[
        [-5.5, 0, -5.5], [5.5, 0, -5.5], [-5.5, 0, 5.5], [5.5, 0, 5.5],
        [5.5, 0, -1.5], [5.5, 0, 1.5], [-1.5, 0, 5.5], [1.5, 0, 5.5],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.6, z]} castShadow>
          <boxGeometry args={[0.35, 1.2, 0.35]} />
          <meshStandardMaterial color="#8b7050" roughness={0.95} />
        </mesh>
      ))}
      {/* A hanging cloth on the back fence — Ankara splash of colour */}
      <mesh position={[-2, 1.3, -5.42]} castShadow>
        <planeGeometry args={[1.8, 0.9]} />
        <meshStandardMaterial color="#e94f37" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2.4, 1.45, -5.41]} castShadow>
        <planeGeometry args={[1.0, 0.6]} />
        <meshStandardMaterial color="#ffc531" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-1.6, 1.2, -5.41]} castShadow>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial color="#1fb86f" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------- OKADA (motorcycle) ----------
function Okada() {
  const wheelRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    // Wheel doesn't spin (parked), but slight sway
    if (wheelRef.current) {
      wheelRef.current.rotation.z = Math.sin(performance.now() / 1000) * 0.005;
    }
  });
  return (
    <group ref={wheelRef} position={[-2.2, 0, 1.8]} rotation={[0, -0.4, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.5, 0.4, 1.4]} />
        <meshStandardMaterial color="#d2601a" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Fuel tank */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.45, 0.25, 0.6]} />
        <meshStandardMaterial color="#b8521a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Seat */}
      <mesh castShadow position={[0, 0.72, 0.5]}>
        <boxGeometry args={[0.42, 0.16, 0.55]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Handlebars */}
      <mesh castShadow position={[0, 0.95, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#333" metalness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.18, 0.95, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh castShadow position={[0.18, 0.95, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Headlight */}
      <mesh position={[0, 0.7, -0.72]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#fff5d6" emissive="#fff5d6" emissiveIntensity={0.4} />
      </mesh>
      {/* Wheels */}
      <Wheel position={[0, 0.32, -0.7]} />
      <Wheel position={[0, 0.32, 0.7]} />
      {/* Side mirror */}
      <mesh castShadow position={[0.18, 1.1, -0.45]}>
        <boxGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color="#888" metalness={0.7} />
      </mesh>
    </group>
  );
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.07, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ---------- PLASTIC CHAIRS ----------
interface ChairProps {
  position: [number, number, number];
  rotation?: number;
  color?: string;
  legColor?: string;
}
function Chair({ position, rotation = 0, color = "#1fb86f", legColor = "#178a55" }: ChairProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.45, 0.04, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Back */}
      <mesh castShadow position={[0, 0.7, -0.21]}>
        <boxGeometry args={[0.45, 0.5, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[
        [-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.22, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function PlasticChairs() {
  return (
    <group>
      <Chair position={[1.5, 0, 2.5]} />
      <Chair position={[2.4, 0, 2.8]} rotation={-0.3} />
      {/* Yellow chair off to the side */}
      <Chair position={[3.0, 0, 1.5]} rotation={0.4} color="#ffc531" legColor="#e8a217" />
    </group>
  );
}

// ---------- SUYA GRILL ----------
function SuyaGrill() {
  const smokeRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (smokeRef.current) {
      const t = state.clock.elapsedTime;
      smokeRef.current.position.y = 1.0 + (Math.sin(t * 1.2) * 0.05 + 0.05);
      (smokeRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + Math.sin(t * 1.4) * 0.1;
    }
  });
  return (
    <group position={[3.5, 0, -1.5]}>
      {/* Table */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.6]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.7} />
      </mesh>
      {[
        [-0.5, -0.22], [0.5, -0.22], [-0.5, 0.22], [0.5, 0.22],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.22, z]}>
          <boxGeometry args={[0.05, 0.45, 0.05]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      ))}
      {/* Grill tray (mesh look) */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.0, 0.12, 0.4]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Coals (orange glow) */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.85, 0.04, 0.3]} />
        <meshStandardMaterial color="#ff6a1a" emissive="#ff6a1a" emissiveIntensity={1.2} />
      </mesh>
      {/* Suya sticks (4 sticks in a row) */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <group key={i} position={[x, 0.65, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
            <meshStandardMaterial color="#8b5a2a" roughness={0.8} />
          </mesh>
          {/* Meat chunks */}
          {[-0.15, 0, 0.15].map((dx, j) => (
            <mesh key={j} castShadow position={[dx, 0.05, 0]}>
              <boxGeometry args={[0.07, 0.06, 0.06]} />
              <meshStandardMaterial color="#7a3a1a" roughness={0.8} emissive="#3a1a08" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Smoke puff */}
      <mesh ref={smokeRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color="#cccccc" transparent opacity={0.3} />
      </mesh>
      {/* Small "suya spot" sign */}
      <mesh castShadow position={[0, 1.0, -0.3]}>
        <boxGeometry args={[0.6, 0.18, 0.04]} />
        <meshStandardMaterial color="#ff6a1a" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ---------- GENERATOR ----------
function Generator() {
  return (
    <group position={[-3.5, 0, -2.5]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.0, 0.7, 0.6]} />
        <meshStandardMaterial color="#3a4a3a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Top cover */}
      <mesh castShadow position={[0, 0.78, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.55]} />
        <meshStandardMaterial color="#2a3a2a" metalness={0.5} />
      </mesh>
      {/* Exhaust pipe */}
      <mesh castShadow position={[0.6, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} />
      </mesh>
      {/* Fuel tank cap */}
      <mesh castShadow position={[0, 0.81, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#222" metalness={0.5} />
      </mesh>
      {/* Handle */}
      <mesh castShadow position={[-0.45, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.15, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#222" metalness={0.5} />
      </mesh>
    </group>
  );
}

// ---------- SIDE TABLE WITH PURE WATER SACHETS ----------
function SideTable() {
  return (
    <group position={[2.0, 0, 3.5]}>
      {/* Table top */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.7} />
      </mesh>
      {/* Single leg (round stool-style) */}
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 8]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      {/* Pure water sachets — small translucent rectangles stacked */}
      {[
        [-0.1, 0.0], [0.1, 0.0], [0.0, 0.05],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.6, z]}>
          <boxGeometry args={[0.22, 0.04, 0.12]} />
          <meshStandardMaterial color="#bcd9f0" transparent opacity={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* A bottle of soft drink */}
      <mesh castShadow position={[0.25, 0.7, -0.1]}>
        <cylinderGeometry args={[0.06, 0.06, 0.25, 12]} />
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0.25, 0.85, -0.1]}>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

// ---------- CLOTHES LINE ----------
function ClothesLine() {
  const positions = useMemo(
    () => [
      { x: -4.5, z: -3.5, color: "#e94f37" },
      { x: -4.0, z: -3.5, color: "#ffc531" },
      { x: -3.5, z: -3.5, color: "#1fb86f" },
      { x: -3.0, z: -3.5, color: "#7c3aed" },
    ],
    []
  );
  return (
    <group>
      {/* Two poles */}
      {[
        [-4.8, -3.5], [-2.8, -3.5],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 1.4, z]}>
          <cylinderGeometry args={[0.04, 0.04, 2.8, 8]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* Line */}
      <mesh position={[-3.8, 2.4, -3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 2, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Hanging clothes */}
      {positions.map((c, i) => (
        <mesh key={i} castShadow position={[c.x, 2.0, c.z]}>
          <planeGeometry args={[0.4, 0.7]} />
          <meshStandardMaterial color={c.color} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- POTTED PLANT ----------
function PottedPlant() {
  return (
    <group position={[-3.5, 0, 4.5]}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.25, 0.18, 0.5, 12]} />
        <meshStandardMaterial color="#8b4513" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#2d6b1a" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.2, 1.1, 0.1]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color="#3d8a3a" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ---------- CEILING FAN POLE (decorative — for outdoor feel) ----------
function CeilingFanPole() {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (fanRef.current) fanRef.current.rotation.y += dt * 1.2;
  });
  return (
    <group position={[0, 0, -4]}>
      {/* Pole */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      {/* Fan — mounted high */}
      <group ref={fanRef} position={[0, 2.6, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            castShadow
            position={[Math.cos((i * Math.PI) / 2) * 0.5, 0, Math.sin((i * Math.PI) / 2) * 0.5]}
            rotation={[0, (i * Math.PI) / 2, 0.08]}
          >
            <boxGeometry args={[0.85, 0.02, 0.12]} />
            <meshStandardMaterial color="#8b6914" roughness={0.6} />
          </mesh>
        ))}
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.13, 12]} />
          <meshStandardMaterial color="#333" metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- PLAYER AVATAR ----------
function RoomAvatar({ avatar, shirtColor }: { avatar: AvatarConfig; shirtColor: string }) {
  const bodyRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bodyRef.current) {
      // Gentle idle bob — feels alive without being distracting
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      bodyRef.current.rotation.y = -0.6 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Legs */}
      <mesh castShadow position={[-0.1, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.1, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.65, 12]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* Shoes */}
      <mesh castShadow position={[-0.1, 0.04, 0.04]}>
        <boxGeometry args={[0.09, 0.05, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.1, 0.04, 0.04]}>
        <boxGeometry args={[0.09, 0.05, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* Hips */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.11, 0.04, 8, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* Torso */}
      <mesh castShadow position={[0, 1.1, 0]} scale={[1, 1, 0.65]}>
        <capsuleGeometry args={[0.16, 0.28, 12, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Shoulders */}
      <mesh castShadow position={[0, 1.26, 0]}>
        <boxGeometry args={[0.34, 0.09, 0.16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Neck */}
      <mesh castShadow position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 0.09, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.52, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.035, 1.54, 0.085]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#fff" roughness={0.2} />
      </mesh>
      <mesh position={[0.035, 1.54, 0.085]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#fff" roughness={0.2} />
      </mesh>
      <mesh position={[-0.035, 1.54, 0.095]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.035, 1.54, 0.095]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Hair */}
      {avatar.hair === "short" && (
        <mesh castShadow position={[0, 1.58, -0.01]}>
          <sphereGeometry args={[0.11, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.7} />
        </mesh>
      )}
      {avatar.hair === "afro" && (
        <mesh castShadow position={[0, 1.59, 0]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.95} />
        </mesh>
      )}
      {avatar.hair === "cap" && (
        <group position={[0, 1.58, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#14213d" roughness={0.5} />
          </mesh>
        </group>
      )}
      {/* Arms */}
      <mesh castShadow position={[-0.22, 1.22, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.3, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.22, 1.22, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.3, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Hands */}
      <mesh castShadow position={[-0.22, 1.05, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.22, 1.05, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>
    </group>
  );
}
