"use client";

// src/components/Landing.tsx — logged-out landing page.
// Bright, friendly, with floating place pills, live stats, news banner,
// bottom sheet with Sign up free / Log in.

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DISTRICTS } from "@/lib/storage";

export default function Landing() {
  const { state, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  // Animated live stats (Phase 5 will pull real numbers)
  const [onlineCount, setOnlineCount] = useState(1247);
  useEffect(() => {
    const id = setInterval(() => {
      setOnlineCount((n) => n + Math.floor((Math.random() - 0.4) * 5));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "login") await signInWithEmail(email.trim(), password);
      else await signUpWithEmail(email.trim(), password, username.trim());
    } catch { /* surfaced via state.error */ } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    try { await signInWithGoogle(); } catch { /* surfaced */ } finally { setBusy(false); }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7]">
      {/* Sky gradient + floating clouds (CSS) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-16 w-32 rounded-full bg-white/80 blur-md rush-float" style={{ animationDelay: "0s" }} />
        <div className="absolute right-[15%] top-[15%] h-12 w-24 rounded-full bg-white/70 blur-md rush-float" style={{ animationDelay: "1s" }} />
        <div className="absolute left-[60%] top-[5%] h-20 w-40 rounded-full bg-white/60 blur-md rush-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Top header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 safe-pt sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/afrorush-logo.jpg" alt="AfroRush" width={40} height={40} className="h-10 w-10 rounded-xl border-2 border-white rush-soft-shadow" />
          <span className="font-display text-xl text-rush-navy">
            Afro<span className="text-rush-green">Rush</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "login" ? "bg-rush-navy text-white" : "bg-white/80 text-rush-navy"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className="rounded-full bg-rush-green px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30"
          >
            Sign up free
          </button>
        </div>
      </header>

      {/* Hero / world preview */}
      <div className="relative z-10 px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-2 inline-block rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rush-green rush-pill">
            🟢 {onlineCount.toLocaleString()} riding now · free
          </div>
          <h1 className="font-display text-4xl leading-tight text-rush-navy sm:text-5xl">
            Step into the<br />
            <span className="text-rush-green">streets of Africa</span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-rush-navy/70">
            Walk, ride an okada, take missions, hang out with players, join a crew and race. A loud, alive 3D world is waiting.
          </p>
        </div>

        {/* Floating place pills (decorative preview of the city) */}
        <div className="relative mx-auto mt-8 h-56 max-w-md">
          {DISTRICTS.slice(0, 6).map((d, i) => {
            const positions = [
              { top: "0%", left: "5%" },
              { top: "10%", left: "70%" },
              { top: "40%", left: "0%" },
              { top: "55%", left: "75%" },
              { top: "75%", left: "20%" },
              { top: "85%", left: "55%" },
            ];
            const p = positions[i];
            return (
              <div
                key={d.id}
                className="rush-pill rush-float absolute flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-bold text-rush-navy"
                style={{ top: p.top, left: p.left, animationDelay: `${i * 0.4}s` }}
              >
                <span className="text-base">{d.emoji}</span>
                <span style={{ color: d.color }}>{d.name}</span>
              </div>
            );
          })}
          {/* Center hub circle */}
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rush-green/20 backdrop-blur-sm" />
          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-rush-green text-white rush-soft-shadow">
            <span className="text-2xl">🛺</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">Motor Park</span>
          </div>
        </div>
      </div>

      {/* News banner */}
      <div className="relative z-10 mx-auto mt-4 max-w-md px-4">
        <div className="rush-card flex items-center gap-3 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-orange text-sm">🔥</span>
          <div className="flex-1 text-xs">
            <div className="font-bold text-rush-navy">Weekend Race: Double Rep!</div>
            <div className="text-rush-navy/60">Saturday & Sunday — all race modes earn 2× rep</div>
          </div>
        </div>
      </div>

      {/* Bottom sheet — Sign up / Log in */}
      <div className="relative z-10 mt-6 px-4 pb-8 sm:px-6 safe-pb">
        <div className="rush-card mx-auto max-w-md p-5">
          {/* Online avatars row */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {["#1fb86f", "#ff6a1a", "#ffc531", "#c026d3", "#16a3b1"].map((c, i) => (
                <div
                  key={i}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                  style={{ background: c }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-xs text-rush-navy/70">
              <span className="font-bold text-rush-navy">{onlineCount.toLocaleString()} riders</span> online now · free
            </div>
          </div>

          {/* Tab switch */}
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-rush-cream p-1">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                mode === "signup" ? "bg-rush-green text-white shadow" : "text-rush-navy/60"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                mode === "login" ? "bg-rush-navy text-white shadow" : "text-rush-navy/60"
              }`}
            >
              Log In
            </button>
          </div>

          <form onSubmit={submit} className="space-y-2">
            {mode === "signup" && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Rider name"
                maxLength={20}
                className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
            />

            {state.error && (
              <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 transition-all hover:bg-rush-green-dark disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Sign up free" : "Log in"}
            </button>
          </form>

          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-rush-cream" />
            <span className="text-[10px] uppercase tracking-widest text-rush-navy/40">or</span>
            <div className="h-px flex-1 bg-rush-cream" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy transition-all hover:bg-rush-cream/30 disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-rush-navy/40">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline hover:text-rush-navy">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-rush-navy">Privacy Policy</a>
        </p>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-4 px-4 pb-4 text-center sm:px-6 safe-pb">
        <div className="mb-1 flex items-center justify-center gap-3 text-[10px] text-rush-navy/40">
          <a href="/privacy" className="hover:text-rush-navy">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-rush-navy">Terms</a>
          <span>·</span>
          <a href="/admin" className="hover:text-rush-navy">Admin</a>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-rush-navy/30">
          AfroRush · Built with ❤️ in Lagos
        </div>
      </footer>

      {/* Setup hint (only if auth not enabled yet) */}
      {state.error && state.error.toLowerCase().includes("not enabled") && (
        <div className="mx-4 mb-6 max-w-md rounded-2xl border-2 border-rush-gold bg-rush-gold/10 p-4 text-xs text-rush-navy sm:mx-auto">
          <div className="mb-2 font-bold uppercase tracking-wider text-rush-gold">First-time setup</div>
          <p className="mb-2">Open Firebase Console → Authentication → Sign-in method → enable Email/Password and Google.</p>
          <a
            href="https://console.firebase.google.com/project/afrorush-7b35a/authentication/providers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-rush-gold px-3 py-1.5 font-bold uppercase tracking-wider text-rush-navy"
          >
            Open Firebase Console →
          </a>
        </div>
      )}
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.594.103-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
