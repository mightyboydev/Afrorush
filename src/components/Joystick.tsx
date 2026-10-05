"use client";

// src/components/Joystick.tsx — mobile virtual joystick (left thumb) +
// drag-to-look area (right thumb). Feeds into inputRef.

import { useRef, useCallback } from "react";

export interface JoystickProps {
  inputRef: React.MutableRefObject<{ x: number; y: number; boost: boolean }>;
  onLook?: (dx: number, dy: number) => void;
}

const MAX_RADIUS = 50; // px from base center

export default function Joystick({ inputRef, onLook }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0 });

  const updateKnob = useCallback((dx: number, dy: number) => {
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    inputRef.current.x = dx / MAX_RADIUS;
    inputRef.current.y = dy / MAX_RADIUS;
  }, [inputRef]);

  const resetKnob = useCallback(() => {
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
    inputRef.current.x = 0;
    inputRef.current.y = 0;
    activeId.current = null;
  }, [inputRef]);

  // Joystick touch handlers
  const onJoyStart = (e: React.PointerEvent) => {
    e.preventDefault();
    if (activeId.current !== null) return;
    activeId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onJoyMove(e);
  };
  const onJoyMove = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    e.preventDefault();
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS;
      dy = (dy / dist) * MAX_RADIUS;
    }
    updateKnob(dx, dy);
  };
  const onJoyEnd = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    resetKnob();
  };

  // Look handlers (drag on the right side of the screen)
  const onLookStart = (e: React.PointerEvent) => {
    if (lookId.current !== null) return;
    lookId.current = e.pointerId;
    lookLast.current = { x: e.clientX, y: e.clientY };
  };
  const onLookMove = (e: React.PointerEvent) => {
    if (lookId.current !== e.pointerId) return;
    const dx = e.clientX - lookLast.current.x;
    const dy = e.clientY - lookLast.current.y;
    lookLast.current = { x: e.clientX, y: e.clientY };
    onLook?.(dx, dy);
  };
  const onLookEnd = (e: React.PointerEvent) => {
    if (lookId.current !== e.pointerId) return;
    lookId.current = null;
  };

  return (
    <>
      {/* Right-side look area (transparent, fills right half) */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={onLookStart}
        onPointerMove={onLookMove}
        onPointerUp={onLookEnd}
        onPointerCancel={onLookEnd}
      />

      {/* Joystick base (bottom-left) */}
      <div
        ref={baseRef}
        onPointerDown={onJoyStart}
        onPointerMove={onJoyMove}
        onPointerUp={onJoyEnd}
        onPointerCancel={onJoyEnd}
        className="joystick-base pointer-events-auto absolute bottom-6 left-6 z-30 flex h-32 w-32 select-none items-center justify-center rounded-full"
        style={{ touchAction: "none" }}
      >
        <div
          ref={knobRef}
          className="joystick-knob h-14 w-14 rounded-full"
          style={{ transition: "transform 0.05s ease-out" }}
        />
      </div>
    </>
  );
}
