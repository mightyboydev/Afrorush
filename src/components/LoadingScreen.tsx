"use client";

// src/components/LoadingScreen.tsx — branded loading screen with logo + progress bar.

import { useEffect, useState } from "react";

export interface LoadingScreenProps {
  message?: string;
  progress?: number; // 0..100
}

export default function LoadingScreen({ message = "Loading the city…", progress }: LoadingScreenProps) {
  // If real progress is provided, use it directly; otherwise animate a fake bar.
  const [fake, setFake] = useState(0);
  const shown = progress ?? fake;

  useEffect(() => {
    if (progress !== undefined) return; // real progress — skip animation
    let raf = 0;
    let val = 0;
    const tick = () => {
      val = Math.min(95, val + Math.random() * 3);
      setFake(val);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <main className="page-bg-day fixed inset-0 z-[100] flex flex-col items-center justify-center safe-pt safe-pb">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-3xl bg-rush-leaf blur-2xl opacity-30" />
          <img
            src="/afrorush-logo.jpg"
            alt="AfroRush"
            width={112}
            height={112}
            className="relative h-24 w-24 rounded-3xl border-4 border-white rush-soft-shadow sm:h-28 sm:w-28"
          />
        </div>
        <h1 className="text-3xl font-display text-rush-ink sm:text-4xl">
          Afro<span className="text-rush-leaf">Rush</span>
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-rush-ink-soft">
          3D African Street World
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 max-w-[80vw]">
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/70 rush-soft-shadow">
          <div
            className="progress-bar h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${shown}%` }}
          />
        </div>
        <div className="mt-2 text-center text-xs font-semibold uppercase tracking-widest text-rush-ink-soft tabular-nums">
          {message} {Math.round(shown)}%
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 px-6 text-center text-[10px] uppercase tracking-widest text-rush-ink-soft/60">
        Free to play · Ride safe out there
      </div>
    </main>
  );
}
