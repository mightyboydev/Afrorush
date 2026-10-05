"use client";

// src/components/Landing.tsx — Premium landing page inspired by phlifestyle.fun.
// 3D character preview with shuffle + drag to rotate, gender toggle, outfit
// color pickers, clean auth form, live stats, footer links.

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
import { SKIN_TONES, HAIR_STYLES, HAIR_COLORS, DEFAULT_AVATAR, type AvatarConfig } from "@/lib/storage";

// 3D character preview — ssr:false
const CharacterPreview3D = dynamic(() => import("@/components/CharacterPreview"), { ssr: false });

const SHIRT_COLORS = ["#ffffff", "#1a1a1a", "#1e3a5f", "#87ceeb", "#1fb86f", "#e94f37", "#ffc531", "#7c3aed"];
const PANTS_COLORS = ["#1e3a5f", "#1a1a1a", "#2a2a3a", "#5a3a1a", "#1fb86f"];

export default function Landing() {
  const { state, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  // Character customization state (for signup preview)
  const [gender, setGender] = useState<"man" | "woman">("man");
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [shirtColor, setShirtColor] = useState("#ffffff");
  const [pantsColor, setPantsColor] = useState("#1e3a5f");

  // Animated live stats
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

  // Shuffle character look
  const shuffle = () => {
    const skins = SKIN_TONES;
    const hairs = HAIR_STYLES;
    const hairColors = HAIR_COLORS;
    const shirts = SHIRT_COLORS;
    const pants = PANTS_COLORS;
    setAvatar({
      skinTone: skins[Math.floor(Math.random() * skins.length)],
      hair: hairs[Math.floor(Math.random() * hairs.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      outfit: "outfit-street",
    });
    setShirtColor(shirts[Math.floor(Math.random() * shirts.length)]);
    setPantsColor(pants[Math.floor(Math.random() * pants.length)]);
  };

  // Build avatar with custom colors for preview
  const previewAvatar: AvatarConfig = {
    ...avatar,
    outfit: shirtColor === "#ffffff" ? "outfit-street" : shirtColor === "#d4af37" ? "outfit-kente" : "outfit-street",
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7]">
      {/* Decorative clouds */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-16 w-32 rounded-full bg-white/80 blur-md rush-float" />
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

      {/* Hero */}
      <div className="relative z-10 px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-2 inline-block rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rush-green rush-pill">
            🟢 {onlineCount.toLocaleString()} riding now · free
          </div>
          <h1 className="font-display text-4xl leading-tight text-rush-navy sm:text-5xl">
            Step into the<br />
            <span className="text-rush-green">streets of Africa</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-xs text-rush-navy/60">
            Walk, ride, race, build a crew. A loud, alive 3D world.
          </p>
        </div>

        {/* Main card with character preview + auth form (side by side on desktop, stacked on mobile) */}
        <div className="mx-auto mt-5 max-w-md">
          <div className="rush-card overflow-hidden p-5">

            {/* Tab switch */}
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-rush-cream p-1">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === "signup" ? "bg-rush-green text-white shadow" : "text-rush-navy/60"
                }`}
              >
                Create Account
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

            {mode === "signup" ? (
              <div className="space-y-3">
                {/* Character preview + form layout (like phlifestyle) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Left: 3D character preview */}
                  <div className="relative">
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#b3e5fc]/30 to-[#fff8e7]/30">
                      <CharacterPreview3D avatar={previewAvatar} height={200} />
                    </div>
                    {/* Shuffle button */}
                    <button
                      onClick={shuffle}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm rush-soft-shadow active:scale-90"
                      aria-label="Shuffle look"
                    >
                      🎲
                    </button>
                    <div className="mt-1 text-center text-[9px] text-rush-navy/40">Drag to rotate</div>
                  </div>

                  {/* Right: Form fields */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Rider name"
                      maxLength={20}
                      className="w-full rounded-xl border-2 border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="w-full rounded-xl border-2 border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border-2 border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
                    />
                    {/* Gender toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("man")}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider ${
                          gender === "man" ? "bg-rush-navy text-white" : "bg-rush-cream text-rush-navy/60"
                        }`}
                      >
                        👨 Man
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("woman")}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider ${
                          gender === "woman" ? "bg-rush-purple text-white" : "bg-rush-cream text-rush-navy/60"
                        }`}
                      >
                        👩 Woman
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color pickers (like phlifestyle) */}
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-rush-navy/50">Shirt Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SHIRT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setShirtColor(c)}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${shirtColor === c ? "scale-110 border-rush-navy" : "border-white"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-rush-navy/50">Skin Tone</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, skinTone: tone })}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${avatar.skinTone === tone ? "scale-110 border-rush-navy" : "border-white"}`}
                        style={{ background: tone }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-rush-navy/50">Hair</label>
                  <div className="flex flex-wrap gap-1">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, hair: h })}
                        className={`rounded-lg border-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          avatar.hair === h ? "border-rush-green bg-rush-green/10 text-rush-green" : "border-rush-cream bg-white text-rush-navy/60"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {state.error && (
                  <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</div>
                )}

                <button
                  type="submit"
                  onClick={submit}
                  disabled={busy}
                  className="w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 transition-all hover:bg-rush-green-dark disabled:opacity-50"
                >
                  {busy ? "Please wait…" : "Sign up · it's free"}
                </button>
              </div>
            ) : (
              /* Login form */
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full rounded-xl border-2 border-rush-cream bg-white px-3 py-3 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full rounded-xl border-2 border-rush-cream bg-white px-3 py-3 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
                />
                {state.error && (
                  <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</div>
                )}
                <button
                  type="submit"
                  onClick={submit}
                  disabled={busy}
                  className="w-full rounded-2xl bg-rush-navy px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg disabled:opacity-50"
                >
                  {busy ? "Please wait…" : "Log in"}
                </button>
              </div>
            )}

            {/* Google */}
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

          {/* Terms */}
          <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-rush-navy/40">
            By continuing you agree to our{" "}
            <a href="/terms" className="underline hover:text-rush-navy">Terms</a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-rush-navy">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-4 px-4 pb-4 text-center sm:px-6 safe-pb">
        <div className="mb-1 flex items-center justify-center gap-3 text-[10px] text-rush-navy/40">
          <a href="/privacy" className="hover:text-rush-navy">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-rush-navy">Terms</a>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-rush-navy/30">
          AfroRush
        </div>
      </footer>

      {/* Setup hint (only if auth not enabled) */}
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
