"use client";

// src/components/Joystick.tsx — Premium floating analog joystick.
// Touch anywhere on the left half of the screen → joystick appears there.
// Tight, responsive, no lag, no slipperiness. Snaps back on release.

import { useRef, useCallback, useEffect, useState } from "react";

export interface JoystickProps {
  inputRef: React.MutableRefObject<{ x: number; y: number; boost: boolean }>;
}

const MAX_RADIUS = 56; // px from base center — slightly larger for precision
const DEAD_ZONE = 0.12; // ignore tiny movements (prevents drift / slip)

export default function Joystick({ inputRef }: JoystickProps) {
  const activeId = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // joystick base position
  const [knob, setKnob] = useState({ x: 0, y: 0 }); // knob offset

  // Write input to the ref (clamped + dead-zone applied)
  const writeInput = useCallback((dx: number, dy: number) => {
    let nx = dx / MAX_RADIUS;
    let ny = dy / MAX_RADIUS;
    const mag = Math.sqrt(nx * nx + ny * ny);
    if (mag > 1) { nx /= mag; ny /= mag; }
    // Dead zone — prevents micro-drift when nearly centered
    if (Math.abs(nx) < DEAD_ZONE) nx = 0;
    else nx = Math.sign(nx) * (Math.abs(nx) - DEAD_ZONE) / (1 - DEAD_ZONE);
    if (Math.abs(ny) < DEAD_ZONE) ny = 0;
    else ny = Math.sign(ny) * (Math.abs(ny) - DEAD_ZONE) / (1 - DEAD_ZONE);
    inputRef.current.x = nx;
    inputRef.current.y = ny;
  }, [inputRef]);

  const reset = useCallback(() => {
    inputRef.current.x = 0;
    inputRef.current.y = 0;
    activeId.current = null;
    origin.current = null;
    setVisible(false);
    setKnob({ x: 0, y: 0 });
  }, [inputRef]);

  // Handle pointer down anywhere on the left half of the screen
  const onPointerDown = (e: React.PointerEvent) => {
    if (activeId.current !== null) return;
    // Only respond to touches on the left half
    if (e.clientX > window.innerWidth / 2) return;
    activeId.current = e.pointerId;
    origin.current = { x: e.clientX, y: e.clientY };
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);
    writeInput(0, 0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId || !origin.current) return;
    let dx = e.clientX - origin.current.x;
    let dy = e.clientY - origin.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS;
      dy = (dy / dist) * MAX_RADIUS;
    }
    setKnob({ x: dx, y: dy });
    writeInput(dx, dy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    reset();
  };

  // Global listeners so the joystick keeps tracking even if finger slides off the original element
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (activeId.current !== e.pointerId || !origin.current) return;
      let dx = e.clientX - origin.current.x;
      let dy = e.clientY - origin.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }
      setKnob({ x: dx, y: dy });
      writeInput(dx, dy);
    };
    const up = (e: PointerEvent) => {
      if (activeId.current !== e.pointerId) return;
      reset();
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [writeInput, reset]);

  return (
    <div
      className="pointer-events-auto absolute inset-y-0 left-0 z-20"
      style={{ width: "50%", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {visible && (
        <div
          className="absolute flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{ left: pos.x, top: pos.y }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/40 bg-white/10 backdrop-blur-md" />
          {/* Inner ring */}
          <div className="absolute inset-3 rounded-full border-2 border-white/20" />
          {/* Knob */}
          <div
            className="absolute h-14 w-14 rounded-full border-2 border-white/80 shadow-lg"
            style={{
              transform: `translate(${knob.x}px, ${knob.y}px)`,
              background: "linear-gradient(135deg, #1fb86f 0%, #178a55 100%)",
              boxShadow: "0 4px 12px -2px rgba(31, 184, 111, 0.6), inset 0 -2px 4px rgba(0,0,0,0.2)",
              transition: activeId.current === null ? "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
            }}
          />
        </div>
      )}
    </div>
  );
}
