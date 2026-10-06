"use client";

// src/components/Onboarding.tsx — 3-step first-login setup.
// Step 1: Rider name. Step 2: Avatar (skin tone, hair, outfit). Step 3: Starting bike + city.

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/firestore";
import {
  BIKE_CATALOG,
  OUTFIT_CATALOG,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  CITIES,
  DEFAULT_AVATAR,
  type AvatarConfig,
} from "@/lib/storage";

// 3D character preview — ssr:false because it uses Three.js
const CharacterPreview3D = dynamic(() => import("@/components/CharacterPreview"), { ssr: false });

export default function Onboarding() {
  const { state, refreshProfile } = useAuth();
  const profile = state.profile!;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.username !== "Rider" ? profile.username : "");
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [bikeId, setBikeId] = useState("bike-spark");
  const [city, setCity] = useState("lagos");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNext = step === 0 ? name.trim().length >= 2 : step === 1 ? true : true;

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateProfile(profile.uid, {
        username: name.trim() || profile.username,
        avatar,
        city,
        loadout: { ...profile.loadout, bikeId },
        onboardingComplete: true,
      });
      await refreshProfile();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (!canNext) return;
    if (step < 2) setStep(step + 1);
    else await finish();
  };

  const steps = ["Your Name", "Your Look", "Your Ride"];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 safe-pt sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/afrorush-logo.jpg" alt="AfroRush" width={32} height={32} className="h-8 w-8 rounded-lg border-2 border-white rush-soft-shadow" />
          <span className="font-display text-base text-rush-navy">
            Afro<span className="text-rush-green">Rush</span>
          </span>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-rush-navy/50">
          Step {step + 1} of 3
        </div>
      </header>

      {/* Step indicator dots */}
      <div className="mt-4 flex justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step ? "w-8 bg-rush-green" : i < step ? "w-2 bg-rush-green/50" : "w-2 bg-rush-navy/20"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-md px-4 py-6 sm:px-6">
        <h2 className="text-center font-display text-2xl text-rush-navy">{steps[step]}</h2>

        {step === 0 && (
          <div className="mt-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tunde, Kofi, Amina…"
              maxLength={20}
              autoFocus
              className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-4 text-lg text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
            />
            <p className="mt-2 text-xs text-rush-navy/60">
              This is the name other riders will see in the city. You can change it later in Settings.
            </p>

            {/* Live 3D character preview */}
            <div className="mt-6">
              <CharacterPreview3D avatar={avatar} height={280} />
              <p className="mt-2 text-center text-[10px] text-rush-navy/40">Drag to rotate your character</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-5">
            {/* Skin tone */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">Skin Tone</label>
              <div className="flex gap-2">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAvatar({ ...avatar, skinTone: tone })}
                    className={`h-12 w-12 rounded-2xl border-4 transition-all ${
                      avatar.skinTone === tone ? "border-rush-green scale-110" : "border-white"
                    }`}
                    style={{ background: tone }}
                    aria-label={`Skin tone ${tone}`}
                  />
                ))}
              </div>
            </div>

            {/* Hair style */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">Hair / Head</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setAvatar({ ...avatar, hair: h })}
                    className={`rounded-2xl border-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      avatar.hair === h ? "border-rush-green bg-rush-green/10 text-rush-green" : "border-rush-cream bg-white text-rush-navy/60"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair color */}
            {avatar.hair !== "cap" && avatar.hair !== "bald" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">Hair Color</label>
                <div className="flex gap-2">
                  {HAIR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar({ ...avatar, hairColor: c })}
                      className={`h-10 w-10 rounded-xl border-4 transition-all ${
                        avatar.hairColor === c ? "border-rush-green scale-110" : "border-white"
                      }`}
                      style={{ background: c }}
                      aria-label={`Hair color ${c}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Outfit */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">Outfit</label>
              <div className="grid grid-cols-2 gap-2">
                {OUTFIT_CATALOG.slice(0, 4).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setAvatar({ ...avatar, outfit: o.id })}
                    className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all ${
                      avatar.outfit === o.id ? "border-rush-green bg-rush-green/5" : "border-rush-cream bg-white"
                    }`}
                  >
                    <span className="h-8 w-8 rounded-lg" style={{ background: o.color }} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-rush-navy">{o.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live 3D character preview */}
            <div className="mt-4">
              <CharacterPreview3D avatar={avatar} height={240} />
              <p className="mt-1 text-center text-[10px] text-rush-navy/40">Drag to rotate</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            {/* Bike selection */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">Starting Bike</label>
              <div className="grid grid-cols-1 gap-2">
                {BIKE_CATALOG.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBikeId(b.id)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
                      bikeId === b.id ? "border-rush-green bg-rush-green/5" : "border-rush-cream bg-white"
                    }`}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                      style={{ background: `${b.color}22`, color: b.color }}
                    >
                      🏍️
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-rush-navy">{b.name}</div>
                      <div className="text-xs text-rush-navy/60">{b.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* City selection */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-rush-navy/60">Home City</label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCity(c.id)}
                    className={`rounded-2xl border-2 p-3 text-left transition-all ${
                      city === c.id ? "border-rush-green bg-rush-green/5" : "border-rush-cream bg-white"
                    }`}
                  >
                    <div className="text-sm font-bold text-rush-navy" style={{ color: c.accent }}>{c.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-rush-navy/60">{c.country}</div>
                    <div className="mt-0.5 text-[9px] leading-tight text-rush-navy/50">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-rush-cream/50 p-3 text-center text-xs text-rush-navy/70">
              You can change your bike, outfit, and city any time in the Garage.
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 px-4 pb-6 safe-pb sm:px-6">
        <div className="mx-auto flex max-w-md gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={busy}
              className="flex-1 rounded-2xl bg-white px-4 py-4 text-sm font-bold uppercase tracking-wider text-rush-navy shadow-md disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext || busy}
            className="flex-[2] rounded-2xl bg-rush-green px-4 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 transition-all hover:bg-rush-green-dark disabled:opacity-50"
          >
            {busy ? "Saving…" : step < 2 ? "Continue" : "Enter the City"}
          </button>
        </div>
      </div>
    </main>
  );
}

function AvatarPreview({ avatar, size = 80 }: { avatar: AvatarConfig; size?: number }) {
  // Simple flat SVG preview that matches the 3D model
  const s = size;
  return (
    <div
      className="flex items-end justify-center rounded-3xl bg-gradient-to-b from-rush-sky/40 to-rush-cream rush-soft-shadow"
      style={{ width: s * 1.4, height: s * 1.6 }}
    >
      <svg width={s} height={s * 1.4} viewBox="0 0 80 112">
        {/* Legs */}
        <rect x="28" y="68" width="10" height="32" rx="3" fill="#2a2a3a" />
        <rect x="42" y="68" width="10" height="32" rx="3" fill="#2a2a3a" />
        {/* Torso (outfit) */}
        <rect x="22" y="42" width="36" height="30" rx="6" fill={avatar.hair === "cap" ? "#1fb86f" : "#ff6a1a"} />
        {/* Head */}
        <rect x="28" y="18" width="24" height="24" rx="4" fill={avatar.skinTone} />
        {/* Hair */}
        {avatar.hair === "short" && <rect x="26" y="14" width="28" height="8" rx="2" fill={avatar.hairColor} />}
        {avatar.hair === "afro" && <circle cx="40" cy="20" r="18" fill={avatar.hairColor} />}
        {avatar.hair === "cap" && <rect x="26" y="14" width="28" height="10" rx="2" fill="#14213d" />}
        {avatar.hair === "bald" && null}
        {avatar.hair === "locs" && (
          <>
            <rect x="28" y="16" width="4" height="14" rx="1" fill={avatar.hairColor} />
            <rect x="34" y="14" width="4" height="16" rx="1" fill={avatar.hairColor} />
            <rect x="42" y="14" width="4" height="16" rx="1" fill={avatar.hairColor} />
            <rect x="48" y="16" width="4" height="14" rx="1" fill={avatar.hairColor} />
          </>
        )}
        {/* Eyes */}
        <circle cx="36" cy="30" r="1.5" fill="#14213d" />
        <circle cx="44" cy="30" r="1.5" fill="#14213d" />
        {/* Smile */}
        <path d="M 36 36 Q 40 39 44 36" stroke="#14213d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Arms */}
        <rect x="14" y="44" width="8" height="22" rx="3" fill={avatar.skinTone} />
        <rect x="58" y="44" width="8" height="22" rx="3" fill={avatar.skinTone} />
      </svg>
    </div>
  );
}
