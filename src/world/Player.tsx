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
      legSwing.current *= 0.85; // ease back to zero
    }

    // Isometric camera follow — tight tracking, no lag
    camTarget.copy(g.position).add(camOffset);
    camera.position.lerp(camTarget, Math.min(1, dt * 6));
    camLookAt.copy(g.position);
    camLookAt.y += 2;
    camera.lookAt(camLookAt);

    // Notify parent (throttled externally if used for multiplayer)
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
    const s = Math.sin(legSwingRef.current) * 0.5;
    if (legL.current) legL.current.rotation.x = s;
    if (legR.current) legR.current.rotation.x = -s;
    if (armL.current) armL.current.rotation.x = -s * 0.7;
    if (armR.current) armR.current.rotation.x = s * 0.7;
    if (bodyRef.current) {
      const idle = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      bodyRef.current.position.y = idle;
    }
  });

  const shirtColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#ffffff";
  const pantsColor = "#1e3a5f";

  return (
    <group ref={bodyRef}>
      {/* LEGS — slender tapered cylinders */}
      <group ref={legL} position={[-0.12, 0.75, 0]}>
        <mesh castShadow position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.07, 0.05, 0.7, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.72, 0.04]}>
          <boxGeometry args={[0.1, 0.06, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
      </group>
      <group ref={legR} position={[0.12, 0.75, 0]}>
        <mesh castShadow position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.07, 0.05, 0.7, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.72, 0.04]}>
          <boxGeometry args={[0.1, 0.06, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
      </group>

      {/* HIPS */}
      <mesh castShadow position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.14, 0.06, 8, 16]} />
        <meshStandardMaterial color={pantsColor} roughness={0.7} />
      </mesh>

      {/* TORSO — tapered capsule */}
      <mesh castShadow position={[0, 1.18, 0]} scale={[1.0, 1.0, 0.7]}>
        <capsuleGeometry args={[0.2, 0.35, 12, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      {/* Shoulders */}
      <mesh castShadow position={[0, 1.35, 0]}>
        <boxGeometry args={[0.42, 0.12, 0.22]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* NECK */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.12, 12]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
      </mesh>

      {/* HEAD — realistic proportions */}
      <mesh castShadow position={[0, 1.67, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>

      {/* Face — eyes, nose, mouth, ears */}
      <mesh position={[-0.05, 1.69, 0.11]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[0.05, 1.69, 0.11]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[-0.05, 1.69, 0.13]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 1.69, 0.13]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 1.66, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.03, 0.06, 8]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.62, 0.12]}>
        <boxGeometry args={[0.06, 0.008, 0.01]} />
        <meshStandardMaterial color="#5a2a1a" roughness={0.6} />
      </mesh>
      <mesh position={[-0.12, 1.67, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>
      <mesh position={[0.12, 1.67, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
      </mesh>

      {/* HAIR */}
      {avatar.hair === "short" && (
        <mesh castShadow position={[0, 1.74, -0.01]}>
          <sphereGeometry args={[0.14, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.7} />
        </mesh>
      )}
      {avatar.hair === "afro" && (
        <mesh castShadow position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.17, 20, 20]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.95} />
        </mesh>
      )}
      {avatar.hair === "cap" && (
        <group position={[0, 1.74, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#14213d" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, -0.02, 0.11]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 12, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#14213d" roughness={0.5} />
          </mesh>
        </group>
      )}
      {avatar.hair === "locs" && (
        <group position={[0, 1.72, 0]}>
          {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
            <mesh key={i} castShadow position={[x, 0.05, 0.08 + (i % 2) * 0.04]}>
              <capsuleGeometry args={[0.025, 0.2, 8, 12]} />
              <meshStandardMaterial color={avatar.hairColor} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}

      {/* ARMS — slender tapered cylinders with mitten hands */}
      <group ref={armL} position={[-0.26, 1.38, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.4, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.3, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, -0.63, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
      </group>
      <group ref={armR} position={[0.26, 1.38, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.4, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.3, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, -0.63, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function RidingModel({ avatar }: { avatar: AvatarConfig }) {
  const shirtColor = avatar.outfit === "outfit-kente" ? "#d4af37"
    : avatar.outfit === "outfit-ankara" ? "#e94f37"
    : avatar.outfit === "outfit-night" ? "#1f2937"
    : avatar.outfit === "outfit-sunset" ? "#f97316"
    : "#ffffff";
  const pantsColor = "#1e3a5f";

  return (
    <group>
      {/* Okada bike */}
      <group>
        <mesh castShadow position={[0, 0.45, 0]} rotation={[0.15, 0, 0]}>
          <capsuleGeometry args={[0.1, 0.9, 8, 16]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.55, 0.08]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.55, -0.2]}>
          <boxGeometry args={[0.25, 0.08, 0.35]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 0.25, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.06, 12, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.25, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.06, 12, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.72, -0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#14213d" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.65, -0.5]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#fff5b8" emissive="#fff5b8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Rider — realistic human on bike */}
      <group position={[0, 0.15, -0.1]}>
        <mesh castShadow position={[-0.1, 0.5, 0.05]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.5, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.1, 0.5, 0.05]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.5, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.05, 8, 16]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, 0.95, -0.08]} rotation={[0.5, 0, 0]} scale={[1, 1, 0.7]}>
          <capsuleGeometry args={[0.14, 0.25, 12, 24]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 1.1, -0.04]}>
          <boxGeometry args={[0.3, 0.08, 0.16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 1.2, -0.1]}>
          <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 1.35, -0.15]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 1.4, -0.15]}>
          <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1fb86f" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh castShadow position={[-0.18, 0.95, -0.15]} rotation={[1.0, 0, 0.15]}>
          <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0.18, 0.95, -0.15]} rotation={[1.0, 0, -0.15]}>
          <cylinderGeometry args={[0.04, 0.035, 0.35, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[-0.18, 0.75, -0.3]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0.18, 0.75, -0.3]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={avatar.skinTone} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
