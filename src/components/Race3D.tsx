"use client";

// src/components/Race3D.tsx — Premium 3D racing game using react-three-fiber.
// Third-person chase camera, 3D sports car, track with guardrails, trees.
// Dark futuristic HUD with glassmorphism.

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import type { RaceMode, Loadout } from "@/lib/storage";
import { getItem } from "@/lib/storage";

export interface Race3DProps {
  mode: RaceMode;
  loadout: Loadout;
  soundOn: boolean;
  onExit: () => void;
  onFinish: (result: {
    mode: RaceMode;
    finished: boolean;
    distance: number;
    score: number;
    style: number;
    cashEarned: number;
    repEarned: number;
    durationMs: number;
    reason: "finished" | "crashed" | "quit";
    packages: number;
  }) => void;
}

const TRACK_LENGTH = 1000;
const ROAD_WIDTH = 10;
const MAX_SPEED = 120;
const BOOST_SPEED = 180;

export default function Race3D({ mode, loadout, onExit, onFinish }: Race3DProps) {
  const inputRef = useRef({ left: false, right: false, boost: false, brake: false });
  const [hud, setHud] = useState({ speed: 0, distance: 0, score: 0, nitro: 100, goal: 0 });
  const [countdown, setCountdown] = useState(3);
  const [paused, setPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const speedRef = useRef(0);
  const distRef = useRef(0);
  const scoreRef = useRef(0);
  const nitroRef = useRef(100);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") inputRef.current.right = true;
      if (e.key === " " || e.key === "ArrowUp") inputRef.current.boost = true;
      if (e.key === "Shift" || e.key === "ArrowDown") inputRef.current.brake = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") inputRef.current.right = false;
      if (e.key === " " || e.key === "ArrowUp") inputRef.current.boost = false;
      if (e.key === "Shift" || e.key === "ArrowDown") inputRef.current.brake = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => {
      setCountdown((c) => {
        if (c <= 1) { startTimeRef.current = Date.now(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const id = setInterval(() => {
      setHud({ speed: Math.round(speedRef.current * 3.6), distance: Math.round(distRef.current), score: Math.round(scoreRef.current), nitro: Math.round(nitroRef.current), goal: Math.min(100, (distRef.current / TRACK_LENGTH) * 100) });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const handleFinish = (reason: "finished" | "crashed" | "quit") => {
    const durationMs = Date.now() - startTimeRef.current;
    const cashEarned = Math.round(scoreRef.current / 10);
    const repEarned = Math.round(scoreRef.current / 20);
    onFinish({ mode, finished: reason === "finished", distance: Math.round(distRef.current), score: Math.round(scoreRef.current), style: 0, cashEarned, repEarned, durationMs, reason, packages: 0 });
  };

  const bike = getItem(loadout.bikeId);
  const carColor = bike?.color ?? "#ff6a1a";

  const press = (key: "left" | "right" | "boost" | "brake") => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); inputRef.current[key] = true; },
    onPointerUp: (e: React.PointerEvent) => { e.preventDefault(); inputRef.current[key] = false; },
    onPointerLeave: () => { inputRef.current[key] = false; },
    onPointerCancel: () => { inputRef.current[key] = false; },
  });

  return (
    <div className="fixed inset-0 z-[60] bg-black" style={{ width: "100%", height: "100%" }}>
      <Canvas shadows dpr={1.5} style={{ width: "100%", height: "100%" }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} camera={{ position: [0, 5, 10], fov: 60, near: 0.1, far: 500 }}>
        <Suspense fallback={null}>
          <RaceScene inputRef={inputRef} speedRef={speedRef} distRef={distRef} scoreRef={scoreRef} nitroRef={nitroRef} pausedRef={pausedRef} carColor={carColor} countdown={countdown} onFinish={handleFinish} />
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.7} mipmapBlur />
            <Vignette eskil={false} offset={0.2} darkness={0.4} />
            <SMAA />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Dark HUD */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/80 to-transparent px-3 py-2 safe-pt">
        <div className="flex gap-2">
          <div className="rounded-xl bg-white/5 px-3 py-1.5 backdrop-blur-md"><div className="text-[8px] uppercase tracking-widest text-white/40">Speed</div><div className="font-mono text-lg font-bold text-cyan-400">{hud.speed}<span className="text-[8px] text-white/40"> km/h</span></div></div>
          <div className="rounded-xl bg-white/5 px-3 py-1.5 backdrop-blur-md"><div className="text-[8px] uppercase tracking-widest text-white/40">Score</div><div className="font-mono text-lg font-bold text-amber-400">{hud.score.toLocaleString()}</div></div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl bg-white/5 px-3 py-1.5 backdrop-blur-md"><div className="text-[8px] uppercase tracking-widest text-white/40">Dist</div><div className="font-mono text-lg font-bold text-white">{hud.distance}m</div></div>
          <button onClick={() => setPaused((p) => !p)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white">❚❚</button>
          <button onClick={() => handleFinish("quit")} className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/80 backdrop-blur-md text-white text-xs">✕</button>
        </div>
      </div>

      {/* Nitro + Goal */}
      <div className="absolute inset-x-3 top-14 z-20 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400">NITRO</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-[width] duration-100" style={{ width: `${hud.nitro}%` }} /></div>
          <span className="font-mono text-[8px] text-cyan-400">{hud.nitro}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400">GOAL</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-[width] duration-200" style={{ width: `${hud.goal}%` }} /></div>
          <span className="font-mono text-[8px] text-amber-400">{hud.goal}%</span>
        </div>
      </div>

      {/* Countdown */}
      {countdown > 0 && <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60"><div className="font-display text-8xl font-bold text-amber-400 animate-pulse">{countdown}</div></div>}

      {/* Touch controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-3 pb-4 safe-pb">
        <div className="flex gap-2">
          <button {...press("left")} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-2xl text-white active:bg-white/30 touch-none" style={{ touchAction: "none" }}>◀</button>
          <button {...press("right")} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-2xl text-white active:bg-white/30 touch-none" style={{ touchAction: "none" }}>▶</button>
        </div>
        <div className="flex gap-2">
          <button {...press("brake")} className="flex h-12 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white active:bg-red-500/50 touch-none" style={{ touchAction: "none" }}>Brake</button>
          <button {...press("boost")} className="flex h-16 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30 active:scale-95 touch-none" style={{ touchAction: "none" }}>⚡ Boost</button>
        </div>
      </div>

      {/* Pause */}
      {paused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="mb-4 font-display text-3xl text-amber-400">PAUSED</div>
            <button onClick={() => setPaused(false)} className="mb-2 w-full rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-black">Resume</button>
            <button onClick={() => handleFinish("quit")} className="w-full rounded-xl bg-red-500/80 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white">Exit Race</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RaceScene({ inputRef, speedRef, distRef, scoreRef, nitroRef, pausedRef, carColor, countdown, onFinish }: {
  inputRef: React.MutableRefObject<{ left: boolean; right: boolean; boost: boolean; brake: boolean }>;
  speedRef: React.MutableRefObject<number>; distRef: React.MutableRefObject<number>; scoreRef: React.MutableRefObject<number>; nitroRef: React.MutableRefObject<number>;
  pausedRef: React.MutableRefObject<boolean>; carColor: string; countdown: number; onFinish: (r: "finished" | "quit") => void;
}) {
  const carRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const carPos = useRef(new THREE.Vector3(0, 0, 0));
  const carRot = useRef(0);
  const steerAngle = useRef(0);

  useFrame((_, dt) => {
    if (countdown > 0 || pausedRef.current) return;
    const input = inputRef.current;
    const targetSpeed = input.brake ? 20 : input.boost && nitroRef.current > 0 ? BOOST_SPEED : MAX_SPEED;
    speedRef.current += (targetSpeed - speedRef.current) * dt * 2;
    if (input.boost && nitroRef.current > 0) nitroRef.current = Math.max(0, nitroRef.current - dt * 25);
    else nitroRef.current = Math.min(100, nitroRef.current + dt * 8);

    const speedFactor = Math.min(1, speedRef.current / 30);
    if (input.left) steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, -0.4, dt * 5);
    else if (input.right) steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, 0.4, dt * 5);
    else steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, 0, dt * 5);
    carRot.current += steerAngle.current * 2.5 * speedFactor * dt;

    const moveDist = speedRef.current * dt;
    carPos.current.x += Math.sin(carRot.current) * moveDist;
    carPos.current.z -= Math.cos(carRot.current) * moveDist;
    distRef.current += moveDist;
    scoreRef.current += moveDist * (input.boost ? 1.5 : 1);

    if (carRef.current) {
      carRef.current.position.copy(carPos.current);
      carRef.current.rotation.y = carRot.current;
      carRef.current.rotation.z = -steerAngle.current * 0.1;
    }

    const speedRatio = speedRef.current / BOOST_SPEED;
    const camX = carPos.current.x - Math.sin(carRot.current) * 8;
    const camZ = carPos.current.z + Math.cos(carRot.current) * 8;
    camera.position.lerp(new THREE.Vector3(camX, 4 + speedRatio * 0.3, camZ), dt * 5);
    const targetFov = 60 + speedRatio * 15;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * 3);
    camera.updateProjectionMatrix();
    camera.lookAt(carPos.current.x, 1, carPos.current.z - 5);

    if (distRef.current >= TRACK_LENGTH) onFinish("finished");
  });

  return (
    <>
      <color attach="background" args={["#1a1a2e"]} />
      <fog attach="fog" args={["#1a1a2e", 50, 200]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight args={["#4a90d9", "#3a5a2a", 0.5]} />

      {/* 3D Car */}
      <group ref={carRef} position={[0, 0.5, 0]}>
        <mesh castShadow position={[0, 0.3, 0]}><boxGeometry args={[2, 0.5, 4]} /><meshStandardMaterial color={carColor} roughness={0.2} metalness={0.8} /></mesh>
        <mesh castShadow position={[0, 0.1, 0]}><boxGeometry args={[2.2, 0.3, 4.2]} /><meshStandardMaterial color={carColor} roughness={0.3} metalness={0.7} /></mesh>
        <mesh castShadow position={[0, 0.7, -0.3]}><boxGeometry args={[1.6, 0.5, 1.8]} /><meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.9} /></mesh>
        <mesh position={[0, 0.7, 0.7]} rotation={[0.3, 0, 0]}><boxGeometry args={[1.4, 0.4, 0.05]} /><meshStandardMaterial color="#87ceeb" transparent opacity={0.6} roughness={0} metalness={1} /></mesh>
        <mesh position={[-0.6, 0.3, 2]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#fff5b8" emissive="#fff5b8" emissiveIntensity={2} /></mesh>
        <mesh position={[0.6, 0.3, 2]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#fff5b8" emissive="#fff5b8" emissiveIntensity={2} /></mesh>
        <mesh position={[-0.6, 0.3, -2]}><boxGeometry args={[0.3, 0.1, 0.05]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} /></mesh>
        <mesh position={[0.6, 0.3, -2]}><boxGeometry args={[0.3, 0.1, 0.05]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} /></mesh>
        <mesh castShadow position={[0, 0.6, -1.8]}><boxGeometry args={[1.8, 0.05, 0.4]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        {/* Wheels */}
        {[[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]].map(([x, z], i) => (
          <mesh key={i} castShadow position={[x, 0, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.4, 0.4, 0.3, 20]} /><meshStandardMaterial color="#1a1a1a" roughness={0.7} /></mesh>
        ))}
      </group>

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -200]} receiveShadow><planeGeometry args={[ROAD_WIDTH, TRACK_LENGTH + 100]} /><meshStandardMaterial color="#2a2a2e" roughness={0.9} /></mesh>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={`d-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -i * 20]}><planeGeometry args={[0.3, 8]} /><meshStandardMaterial color="#ffc531" /></mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-ROAD_WIDTH / 2, 0.01, -200]}><planeGeometry args={[0.2, TRACK_LENGTH + 100]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_WIDTH / 2, 0.01, -200]}><planeGeometry args={[0.2, TRACK_LENGTH + 100]} /><meshStandardMaterial color="#fff" /></mesh>

      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(ROAD_WIDTH / 2 + 50), 0, -200]} receiveShadow><planeGeometry args={[100, TRACK_LENGTH + 100]} /><meshStandardMaterial color="#3a6b1a" roughness={0.95} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_WIDTH / 2 + 50, 0, -200]} receiveShadow><planeGeometry args={[100, TRACK_LENGTH + 100]} /><meshStandardMaterial color="#3a6b1a" roughness={0.95} /></mesh>

      {/* Guardrails + curbs */}
      {Array.from({ length: 40 }).map((_, i) => (
        <group key={`g-${i}`}>
          <mesh castShadow position={[-ROAD_WIDTH / 2 - 0.5, 0.5, -i * 25]}><boxGeometry args={[0.1, 1, 3]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
          <mesh castShadow position={[ROAD_WIDTH / 2 + 0.5, 0.5, -i * 25]}><boxGeometry args={[0.1, 1, 3]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
          <mesh position={[-ROAD_WIDTH / 2, 0.05, -i * 25 - 5]}><boxGeometry args={[0.5, 0.1, 5]} /><meshStandardMaterial color={i % 2 === 0 ? "#e94f37" : "#fff"} /></mesh>
          <mesh position={[ROAD_WIDTH / 2, 0.05, -i * 25 - 5]}><boxGeometry args={[0.5, 0.1, 5]} /><meshStandardMaterial color={i % 2 === 0 ? "#e94f37" : "#fff"} /></mesh>
        </group>
      ))}

      {/* Trees */}
      {Array.from({ length: 30 }).map((_, i) => (
        <group key={`t-${i}`} position={[(i % 2 === 0 ? -1 : 1) * (ROAD_WIDTH / 2 + 5 + Math.random() * 30), 0, -i * 30]} scale={0.8 + Math.random() * 0.4}>
          <mesh castShadow position={[0, 1.5, 0]}><cylinderGeometry args={[0.2, 0.3, 3, 8]} /><meshStandardMaterial color="#4a3020" /></mesh>
          <mesh castShadow position={[0, 3.5, 0]}><sphereGeometry args={[1.5, 12, 12]} /><meshStandardMaterial color="#2d6b1a" /></mesh>
        </group>
      ))}

      {/* Skydome */}
      <mesh position={[0, 0, -150]}><sphereGeometry args={[300, 16, 16]} /><meshBasicMaterial color="#1a1a2e" side={THREE.BackSide} /></mesh>
    </>
  );
}
