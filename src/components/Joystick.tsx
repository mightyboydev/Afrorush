"use client";

// src/components/Joystick.tsx — FIXED analog stick at bottom-left.
// Always visible, always in the same spot. Drag within it to move.
// Does NOT interfere with zoom (which uses pinch/scroll on the right side).

import { useRef, useCallback, useState } from "react";

export interface JoystickProps {
  inputRef: React.MutableRefObject<{ x: number; y: number; boost: boolean }>;
}

const MAX_RADIUS = 48;
const DEAD_ZONE = 0.1;

export default function Joystick({ inputRef }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const writeInput = useCallback((dx: number, dy: number) => {
    let nx = dx / MAX_RADIUS;
    let ny = dy / MAX_RADIUS;
    const mag = Math.sqrt(nx * nx + ny * ny);
    if (mag > 1) { nx /= mag; ny /= mag; }
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
    setKnob({ x: 0, y: 0 });
  }, [inputRef]);

  const getBaseCenter = () => {
    const base = baseRef.current;
    if (!base) return { x: 0, y: 0 };
    const rect = base.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const center = getBaseCenter();
    let dx = e.clientX - center.x;
    let dy = e.clientY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_RADIUS) { dx = (dx / dist) * MAX_RADIUS; dy = (dy / dist) * MAX_RADIUS; }
    setKnob({ x: dx, y: dy });
    writeInput(dx, dy);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    e.preventDefault();
    const center = getBaseCenter();
    let dx = e.clientX - center.x;
    let dy = e.clientY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_RADIUS) { dx = (dx / dist) * MAX_RADIUS; dy = (dy / dist) * MAX_RADIUS; }
    setKnob({ x: dx, y: dy });
    writeInput(dx, dy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    reset();
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="pointer-events-auto absolute bottom-20 left-4 z-30 flex h-28 w-28 select-none items-center justify-center rounded-full touch-none"
      style={{ touchAction: "none" }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/50 bg-white/15 backdrop-blur-md shadow-xl" />
      {/* Inner ring */}
      <div className="absolute inset-3 rounded-full border-2 border-white/20" />
      {/* Direction indicators */}
      <div className="absolute top-1 text-[8px] font-bold text-white/50">▲</div>
      <div className="absolute bottom-1 text-[8px] font-bold text-white/50">▼</div>
      <div className="absolute left-1 text-[8px] font-bold text-white/50">◀</div>
      <div className="absolute right-1 text-[8px] font-bold text-white/50">▶</div>
      {/* Knob */}
      <div
        className="absolute h-12 w-12 rounded-full border-2 border-white/90 shadow-lg"
        style={{
          transform: `translate(${knob.x}px, ${knob.y}px)`,
          background: "linear-gradient(135deg, #1fb86f 0%, #178a55 100%)",
          boxShadow: "0 4px 12px -2px rgba(31, 184, 111, 0.6), inset 0 -2px 4px rgba(0,0,0,0.2)",
          transition: activeId.current === null ? "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        }}
      />
    </div>
  );
}
