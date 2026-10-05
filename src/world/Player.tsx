"use client";

// src/world/Player.tsx — third-person player character with walk + ride controls.

import { useRef, useImperativeHandle, forwardRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { AvatarConfig } from "@/lib/storage";

export interface PlayerHandle {
  getPosition: () => THREE.Vector3;
  getRotation: () => number;
}

export interface PlayerProps {
  avatar: AvatarConfig;
  riding: boolean;
  inputRef: React.MutableRefObject<{ x: number; y: number; boost: boolean }>;
  quality: "low" | "medium" | "high";
  onMove?: (pos: THREE.Vector3, riding: boolean) => void;
}

const WALK_SPEED = 7;     // slightly faster walk
const RIDE_SPEED = 16;    // slightly faster ride
const BOOST_MULT = 1.7;
const WORLD_RADIUS = 80;
const ACCEL = 18;         // high = snappy (no slippery lerp)
const DECEL = 20;         // high = stops fast when released
const ROT_SPEED = 14;     // rotation smoothing

const Player = forwardRef<PlayerHandle, PlayerProps>(function Player(
  { avatar, riding, inputRef, quality, onMove },
  ref
) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const legSwing = useRef(0);
  const { camera } = useThree();

  // Cached vectors to avoid allocations in the frame loop.
  // Using refs (not useMemo) so the linter doesn't flag in-place mutation.
  const tmpForward = useRef(new THREE.Vector3(0, 0, -1)).current; // forward = -Z (isometric)
  const tmpRight = useRef(new THREE.Vector3(1, 0, 0)).current;
  const tmpVel = useRef(new THREE.Vector3()).current;
  const camOffset = useRef(new THREE.Vector3(0, 35, 35)).current; // isometric camera offset
  const camTarget = useRef(new THREE.Vector3()).current;
  const camLookAt = useRef(new THREE.Vector3()).current;
  const velocity = useRef(new THREE.Vector3()).current;
  const upVec = useRef(new THREE.Vector3(0, 1, 0)).current;
  const targetRot = useRef(0);

  // Expose imperative handle for parent (used by multiplayer later).
  useImperativeHandle(ref, () => ({
    getPosition: () => groupRef.current ? groupRef.current.position.clone() : new THREE.Vector3(),
    getRotation: () => groupRef.current ? groupRef.current.rotation.y : 0,
  }), []);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const input = inputRef.current;
    const speed = riding ? RIDE_SPEED : WALK_SPEED;
    const boost = input.boost ? BOOST_MULT : 1;
    const maxSpeed = speed * boost;

    // Desired velocity from input (world-space, isometric)
    tmpVel.set(0, 0, 0);
    tmpVel.addScaledVector(tmpForward, -input.y); // forward when joystick up
    tmpVel.addScaledVector(tmpRight, input.x);
    if (tmpVel.lengthSq() > 0) {
      tmpVel.normalize().multiplyScalar(maxSpeed);
      targetRot.current = Math.atan2(tmpVel.x, tmpVel.z);
    }

    // Snappy acceleration / deceleration — no slippery lerp.
    // Accelerate toward desired velocity at ACCEL rate, decelerate at DECEL.
    const currentSpeed = velocity.length();
    if (tmpVel.lengthSq() > 0) {
      // Moving — accelerate toward desired velocity
      const desiredX = tmpVel.x;
      const desiredZ = tmpVel.z;
      const ax = (desiredX - velocity.x) * Math.min(1, dt * ACCEL);
      const az = (desiredZ - velocity.z) * Math.min(1, dt * ACCEL);
      velocity.x += ax;
      velocity.z += az;
    } else {
      // No input — decelerate to zero fast
      const decel = Math.min(1, dt * DECEL);
      velocity.x -= velocity.x * decel;
      velocity.z -= velocity.z * decel;
      // Snap to zero if very slow (prevents infinite tiny drift)
      if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
      if (Math.abs(velocity.z) < 0.01) velocity.z = 0;
    }

    g.position.x += velocity.x * dt;
    g.position.z += velocity.z * dt;

    // Soft world boundary
    const dist = Math.sqrt(g.position.x * g.position.x + g.position.z * g.position.z);
    if (dist > WORLD_RADIUS) {
      const scale = WORLD_RADIUS / dist;
      g.position.x *= scale;
      g.position.z *= scale;
    }

    // Smooth rotation — fast snap
    let dr = targetRot.current - g.rotation.y;
    while (dr > Math.PI) dr -= Math.PI * 2;
    while (dr < -Math.PI) dr += Math.PI * 2;
    g.rotation.y += dr * Math.min(1, dt * ROT_SPEED);

    // Leg swing animation when moving
    const moving = currentSpeed > 0.05;
    if (moving) {
      legSwing.current += dt * (riding ? 14 : 10);
    } else {
      legSwing.current *= 0.85;
    }

    // Camera follow is handled by CameraControls in City.tsx.
    // Player just moves; camera tracks player position via external lookAt.
    // We store the player position in a ref that CameraControls reads.
    if (onMove) onMove(g.position.clone(), riding);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={modelRef}>
        {/* Player model */}
        {!riding && <WalkingModel avatar={avatar} legSwingRef={legSwing} />}
        {riding && <RidingModel avatar={avatar} />}
      </group>
    </group>
  );
});

export default Player;

function WalkingModel({
  avatar,
  legSwingRef,
}: {
  avatar: AvatarConfig;
  legSwingRef: React.MutableRefObject<number>;
}) {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const s = Math.sin(legSwingRef.current) * 0.6;
    if (legL.current) legL.current.rotation.x = s;
    if (legR.current) legR.current.rotation.x = -s;
    if (armL.current) armL.current.rotation.x = -s * 0.8;
    if (armR.current) armR.current.rotation.x = s * 0.8;
    // Idle bounce — subtle up/down when standing
    if (bodyRef.current) {
      const idle = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      bodyRef.current.position.y = idle;
    }
  });

  // Outfit color from avatar
  const outfitColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#1fb86f";

  return (
    <group ref={bodyRef}>
      {/* Legs — capsule cylinders (smooth, not boxy) */}
      <group ref={legL} position={[-0.15, 0.7, 0]}>
        <mesh castShadow position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        {/* Shoe */}
        <mesh castShadow position={[0, -0.65, 0.05]}>
          <boxGeometry args={[0.18, 0.1, 0.28]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      </group>
      <group ref={legR} position={[0.15, 0.7, 0]}>
        <mesh castShadow position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.65, 0.05]}>
          <boxGeometry args={[0.18, 0.1, 0.28]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      </group>

      {/* Hips */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.18, 0.1, 8, 16]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
      </mesh>

      {/* Torso — rounded (capsule) with outfit color */}
      <mesh castShadow position={[0, 1.35, 0]}>
        <capsuleGeometry args={[0.28, 0.4, 12, 24]} />
        <meshStandardMaterial color={outfitColor} roughness={0.6} />
      </mesh>

      {/* Chest detail — stripe for ankara/kente */}
      {(avatar.outfit === "outfit-kente" || avatar.outfit === "outfit-ankara") && (
        <mesh position={[0, 1.35, 0.28]}>
          <planeGeometry args={[0.4, 0.6]} />
          <meshStandardMaterial color="#ffc531" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Arms — capsules (smooth) */}
      <group ref={armL} position={[-0.38, 1.6, 0]}>
        <mesh castShadow position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
          <meshStandardMaterial color={outfitColor} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.6} />
        </mesh>
      </group>
      <group ref={armR} position={[0.38, 1.6, 0]}>
        <mesh castShadow position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
          <meshStandardMaterial color={outfitColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.6} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh castShadow position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.6} />
      </mesh>

      {/* Head — sphere (smooth, not box) */}
      <mesh castShadow position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>

      {/* Face — eyes */}
      <mesh position={[-0.1, 2.05, 0.29]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.1, 2.05, 0.29]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Eye whites */}
      <mesh position={[-0.1, 2.05, 0.28]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 2.05, 0.28]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Mouth — small smile */}
      <mesh position={[0, 1.88, 0.25]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Hair styles — smooth, cartoon-like */}
      {avatar.hair === "short" && (
        <mesh castShadow position={[0, 2.18, -0.02]}>
          <sphereGeometry args={[0.29, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.8} />
        </mesh>
      )}
      {avatar.hair === "afro" && (
        <mesh castShadow position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.36, 20, 20]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.95} />
        </mesh>
      )}
      {avatar.hair === "cap" && (
        <group position={[0, 2.2, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#14213d" roughness={0.6} />
          </mesh>
          {/* Cap brim */}
          <mesh castShadow position={[0, -0.05, 0.22]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#14213d" roughness={0.6} />
          </mesh>
        </group>
      )}
      {avatar.hair === "locs" && (
        <group position={[0, 2.1, 0]}>
          {[-0.2, -0.07, 0.07, 0.2].map((x, i) => (
            <mesh key={i} castShadow position={[x, 0.1, 0.15 + (i % 2) * 0.08]}>
              <capsuleGeometry args={[0.05, 0.4, 8, 12]} />
              <meshStandardMaterial color={avatar.hairColor} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}
      {avatar.hair === "bald" && null}
    </group>
  );
}

function RidingModel({ avatar }: { avatar: AvatarConfig }) {
  const outfitColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#1fb86f";

  return (
    <group>
      {/* Okada bike — proper shape, not a box */}
      <group>
        {/* Frame body — curved */}
        <mesh castShadow position={[0, 0.6, 0]} rotation={[0.15, 0, 0]}>
          <capsuleGeometry args={[0.15, 1.2, 8, 16]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Fuel tank */}
        <mesh castShadow position={[0, 0.75, 0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Seat */}
        <mesh castShadow position={[0, 0.78, -0.25]}>
          <boxGeometry args={[0.35, 0.12, 0.5]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* Wheels — with rims */}
        <mesh castShadow position={[0, 0.35, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.08, 12, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.35, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.08, 12, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Handlebars */}
        <mesh castShadow position={[0, 1.0, -0.55]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <meshStandardMaterial color="#14213d" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Headlight */}
        <mesh position={[0, 0.9, -0.7]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#fff5b8" emissive="#fff5b8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Rider — compact pose on bike */}
      <group position={[0, 0.2, -0.15]}>
        {/* Torso leaning forward */}
        <mesh castShadow position={[0, 1.1, 0]} rotation={[0.3, 0, 0]}>
          <capsuleGeometry args={[0.22, 0.3, 12, 24]} />
          <meshStandardMaterial color={outfitColor} roughness={0.6} />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 1.55, -0.15]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
        {/* Helmet */}
        <mesh castShadow position={[0, 1.62, -0.15]}>
          <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#1fb86f" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Arms reaching to handlebars */}
        <mesh castShadow position={[-0.25, 1.15, -0.2]} rotation={[1.2, 0, 0.2]}>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial color={outfitColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0.25, 1.15, -0.2]} rotation={[1.2, 0, -0.2]}>
          <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
          <meshStandardMaterial color={outfitColor} roughness={0.6} />
        </mesh>
        {/* Legs bent */}
        <mesh castShadow position={[-0.15, 0.7, 0.1]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.15, 0.7, 0.1]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
