"use client";

// src/components/AuthScreen.tsx — Login & signup screen, African-styled.

import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function AuthScreen() {
  const { state, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, username.trim());
      }
    } catch {
      // error surfaced via state.error in auth context
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    try { await signInWithGoogle(); } catch { /* surfaced */ } finally { setBusy(false); }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#120716] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 rush-pattern opacity-60" />
      <div className="pointer-events-none absolute inset-0 street-stripes opacity-[0.07]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-rush-flame/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-rush-magenta/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-block -rotate-2 rounded-md border-2 border-black bg-rush-gold px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black shadow-[3px_3px_0_#000]">
            African street culture + racing
          </div>
          <h1 className="font-street text-6xl uppercase leading-none text-white drop-shadow-[4px_4px_0_#000] sm:text-7xl">
            Afro<span className="text-rush-flame">Rush</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-base font-black uppercase text-rush-gold">
            Na street we dey. Ride. Link up. Rep your crew.
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-white/60">
            Enter the motor park, find your people and become street legend.
          </p>
        </div>

        {/* Card */}
        <div className="street-card p-5 sm:p-6">
          {/* Tab switch */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-black/40 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-lg py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                mode === "login" ? "bg-rush-flame text-white shadow-lg shadow-rush-flame/30" : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-lg py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                mode === "signup" ? "bg-rush-jade text-white shadow-lg shadow-rush-jade/30" : "text-white/60 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field
                label="Rider Name"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="e.g. Lagos Bolt"
                maxLength={20}
                autoComplete="username"
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@street.com"
              autoComplete="email"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
            />

            {state.error && (
              <div className="rounded-lg border border-rush-flame/40 bg-rush-flame/15 px-3 py-2 text-xs text-rush-flame">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-xl street-btn bg-rush-flame px-4 py-3 text-sm text-white disabled:opacity-50 ${
                mode === "signup" ? "!bg-rush-jade" : ""
              }`}
            >
              {busy ? "Wait small…" : mode === "login" ? "Enter the park" : "Join the street"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>
        </div>

        {/* Setup hint — only shows if auth fails */}
        {state.error && state.error.toLowerCase().includes("not enabled") && (
          <div className="mt-4 rounded-xl border border-rush-gold/30 bg-rush-gold/10 p-4 text-xs text-white/80">
            <div className="mb-2 font-bold uppercase tracking-widest text-rush-gold">First-time setup</div>
            <p className="mb-2">
              Firebase Auth isn&apos;t enabled for your project yet. Open the Firebase console →
              <span className="text-white"> Build → Authentication → Sign-in method</span> and enable:
            </p>
            <ul className="ml-4 list-disc space-y-0.5 text-white/70">
              <li><strong>Email/Password</strong> (for email sign-in)</li>
              <li><strong>Google</strong> (for the Google button)</li>
            </ul>
            <p className="mt-2 text-white/60">
              Project: <code className="rounded bg-black/40 px-1.5 py-0.5 text-rush-gold">afrorush-7b35a</code>
            </p>
            <a
              href="https://console.firebase.google.com/project/afrorush-7b35a/authentication/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded-lg bg-rush-gold px-3 py-1.5 font-bold uppercase tracking-widest text-black"
            >
              Open Firebase Console →
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-[10px] uppercase tracking-widest text-white/30">
          By continuing you agree to ride hard, race fair, and rep your city.
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  maxLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 focus:border-rush-gold focus:outline-none"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.594.103-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
