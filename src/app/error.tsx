"use client";

// src/app/error.tsx — Friendly error boundary. Catches runtime errors (e.g.
// Three.js crashes) and shows a recoverable fallback instead of the raw
// stack trace. Includes a "Reload" button.

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging
    console.error("[App error boundary]", error);
  }, [error]);

  // Detect WebGL errors specifically — show a friendlier message
  const isWebGLError =
    error.message.toLowerCase().includes("webgl") ||
    error.message.toLowerCase().includes("canvas") ||
    error.message.toLowerCase().includes("three");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7] p-6 text-center">
      {/* Logo */}
      <div className="mb-4 flex flex-col items-center">
        <img
          src="/afrorush-logo.jpg"
          alt="AfroRush"
          width={72}
          height={72}
          className="mb-3 h-16 w-16 rounded-2xl border-4 border-white rush-soft-shadow"
        />
        <h1 className="text-2xl font-display text-rush-navy">
          Afro<span className="text-rush-green">Rush</span>
        </h1>
      </div>

      {/* Friendly message */}
      <div className="rush-card max-w-sm p-5">
        <div className="mb-2 text-4xl">{isWebGLError ? "📱" : "😅"}</div>
        <h2 className="mb-1 text-lg font-bold text-rush-navy">
          {isWebGLError ? "Your phone no fit run 3D" : "Something scatter"}
        </h2>
        <p className="text-xs text-rush-navy/60">
          {isWebGLError
            ? "WebGL no dey your device. The 3D parts no go work but you fit still play the rest of the game — sign in, race, hustle, and chat with friends."
            : "E happen small. Try reload the page — if e continue, clear your browser cache and try again."}
        </p>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded-2xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy active:scale-95"
          >
            Try again
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.location.href = "/";
            }}
            className="flex-1 rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white active:scale-95"
          >
            Home
          </button>
        </div>

        {/* Technical details (collapsed) */}
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-rush-navy/40">
            Technical details
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-rush-navy/5 p-2 text-[9px] text-rush-navy/60">
            {error.message}
            {error.stack && "\n\n" + error.stack.split("\n").slice(0, 5).join("\n")}
          </pre>
        </details>
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-widest text-rush-navy/40">
        AfroRush · Free to play
      </p>
    </main>
  );
}
