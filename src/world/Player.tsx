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

const WALK_SPEED = 6;
const RIDE_SPEED = 14;
const BOOST_MULT = 1.8;
const WORLD_RADIUS = 80; // soft boundary

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

    // World-space movement (isometric camera, so directions are fixed).
    // forward = -Z (away from camera), right = +X
    tmpVel.set(0, 0, 0);
    tmpVel.addScaledVector(tmpForward, -input.y); // forward when joystick up
    tmpVel.addScaledVector(tmpRight, input.x);
    if (tmpVel.lengthSq() > 0) {
      tmpVel.normalize().multiplyScalar(speed * boost * dt);
      velocity.lerp(tmpVel, 0.25);
      targetRot.current = Math.atan2(tmpVel.x, tmpVel.z);
    } else {
      velocity.multiplyScalar(0.85);
    }

    g.position.add(velocity);
    // Soft world boundary
    const dist = Math.sqrt(g.position.x * g.position.x + g.position.z * g.position.z);
    if (dist > WORLD_RADIUS) {
      const scale = WORLD_RADIUS / dist;
      g.position.x *= scale;
      g.position.z *= scale;
    }

    // Smooth rotation
    let dr = targetRot.current - g.rotation.y;
    while (dr > Math.PI) dr -= Math.PI * 2;
    while (dr < -Math.PI) dr += Math.PI * 2;
    g.rotation.y += dr * Math.min(1, dt * 10);

    // Leg swing animation when moving
    const moving = velocity.lengthSq() > 0.0001;
    if (moving) {
      legSwing.current += dt * (riding ? 12 : 8);
    } else {
      legSwing.current = 0;
    }

    // Isometric camera follow — stays at fixed angle, tracks player XZ position
    camTarget.copy(g.position).add(camOffset);
    camera.position.lerp(camTarget, Math.min(1, dt * 4));
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
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Mesh>(null);
  const armR = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const s = Math.sin(legSwingRef.current) * 0.5;
    if (legL.current) legL.current.rotation.x = s;
    if (legR.current) legR.current.rotation.x = -s;
    if (armL.current) armL.current.rotation.x = -s * 0.7;
    if (armR.current) armR.current.rotation.x = s * 0.7;
  });

  return (
    <group>
      {/* Legs */}
      <mesh ref={legL} castShadow position={[-0.18, 0.6, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      <mesh ref={legR} castShadow position={[0.18, 0.6, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      {/* Torso (outfit color) */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.4]} />
        <meshStandardMaterial color={avatar.hair === "cap" ? "#1fb86f" : "#ff6a1a"} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 2.2, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={avatar.skinTone} roughness={0.6} />
      </mesh>
      {/* Hair / cap */}
      {avatar.hair === "short" && (
        <mesh castShadow position={[0, 2.45, 0]}>
          <boxGeometry args={[0.5, 0.15, 0.5]} />
          <meshStandardMaterial color={avatar.hairColor} />
        </mesh>
      )}
      {avatar.hair === "afro" && (
        <mesh castShadow position={[0, 2.45, 0]}>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshStandardMaterial color={avatar.hairColor} roughness={0.95} />
        </mesh>
      )}
      {avatar.hair === "cap" && (
        <mesh castShadow position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
          <meshStandardMaterial color="#14213d" />
        </mesh>
      )}
      {avatar.hair === "locs" && (
        <group position={[0, 2.3, 0]}>
          {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
            <mesh key={i} castShadow position={[x, -0.2, 0.2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
              <meshStandardMaterial color={avatar.hairColor} />
            </mesh>
          ))}
        </group>
      )}
      {/* Arms */}
      <mesh ref={armL} castShadow position={[-0.5, 1.5, 0]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color={avatar.skinTone} />
      </mesh>
      <mesh ref={armR} castShadow position={[0.5, 1.5, 0]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color={avatar.skinTone} />
      </mesh>
    </group>
  );
}

function RidingModel({ avatar }: { avatar: AvatarConfig }) {
  return (
    <group>
      {/* Okada bike */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.5, 1.8]} />
        <meshStandardMaterial color="#ff6a1a" />
      </mesh>
      {/* Seat */}
      <mesh castShadow position={[0, 0.8, 0.2]}>
        <boxGeometry args={[0.5, 0.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Wheels */}
      <mesh castShadow position={[0, 0.3, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh castShadow position={[0, 0.3, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Handle */}
      <mesh castShadow position={[0, 1, -0.7]}>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#14213d" />
      </mesh>
      {/* Rider (compact pose) */}
      <mesh castShadow position={[0, 1.2, 0.2]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color="#ff6a1a" />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0.2]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={avatar.skinTone} />
      </mesh>
      <mesh castShadow position={[0, 2, 0.2]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#1fb86f" />
      </mesh>
    </group>
  );
}
