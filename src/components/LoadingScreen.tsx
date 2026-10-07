"use client";

// src/components/LoadingScreen.tsx — branded loading screen with Kaduna mascot
// + progress bar. Harmattan palette.

import { useEffect, useState } from "react";
import { LoadingMascot } from "@/ui/mascot";

export interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export default function LoadingScreen({ message = "Loading the city…", progress }: LoadingScreenProps) {
  const [fake, setFake] = useState(0);
  const shown = progress ?? fake;

  useEffect(() => {
    if (progress !== undefined) return;
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
    <main className="page-bg-night fixed inset-0 z-[100] flex flex-col items-center justify-center safe-pt safe-pb">
      {/* Harmattan dust drift decorative (now glowing gold on dark) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="ar-dust-drift absolute rounded-full"
            style={{
              left: `${(i * 8.5) % 100}%`,
              top: `${(i * 17) % 100}%`,
              width: `${1 + (i % 3) * 0.5}px`,
              height: `${1 + (i % 3) * 0.5}px`,
              background: "var(--ar-gold)",
              boxShadow: `0 0 ${4 + (i % 3) * 2}px var(--ar-gold)`,
              opacity: 0.6,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Mascot (bobbing) with glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full blur-2xl opacity-50" style={{ background: "var(--ar-gold)" }} />
        <LoadingMascot size={120} className="relative" />
      </div>

      {/* Wordmark with gradient */}
      <h1 className="text-3xl font-display sm:text-4xl" style={{ letterSpacing: "-0.025em" }}>
        <span style={{ color: "var(--ar-text)" }}>Afro</span>
        <span style={{ background: "var(--ar-sunset-gradient)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Rush</span>
      </h1>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-rush-ink-soft">
        Kaduna Street World
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-64 max-w-[80vw]">
        <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: "rgba(245,234,208,0.08)", boxShadow: "inset 0 1px 0 rgba(245,234,208,0.10)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${shown}%`,
              background: "var(--ar-sunset-gradient)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 12px rgba(124,58,237,0.5)",
            }}
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
