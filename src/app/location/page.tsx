"use client";

// src/app/location/page.tsx — Placeholder room for each location.
// Different background colour + title + "Coming soon – but looking fire".

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const LOCATIONS: Record<string, { name: string; emoji: string; color: string; desc: string }> = {
  "motor-park": { name: "Motor Park", emoji: "🛺", color: "#1fb86f", desc: "The social hub. Okadas, danfos, keke everywhere. Meet other riders here." },
  "garage": { name: "Garage", emoji: "🏍️", color: "#ff6a1a", desc: "Customize your bike, outfit, sticker, horn and exhaust on a 3D turntable." },
  "race-track": { name: "Race Track", emoji: "🏁", color: "#ffc531", desc: "Street Race, Delivery Rush, Police Chase, Freestyle Run. Show your skills." },
  "market": { name: "Market", emoji: "🛍️", color: "#c026d3", desc: "Stalls, bargaining NPCs, shop with Naira and gold coins." },
  "suya-spot": { name: "Suya Spot", emoji: "🍢", color: "#ff6a1a", desc: "Daily free reward, food buffs, mini challenges." },
  "crew-hq": { name: "Crew HQ", emoji: "👥", color: "#7c3aed", desc: "Crew room, members, crew chat, crew wars board." },
};

function LocationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "motor-park";
  const loc = LOCATIONS[id] ?? LOCATIONS["motor-park"];

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 safe-pt safe-pb"
      style={{ background: `linear-gradient(135deg, ${loc.color}33 0%, #fff8e7 60%)` }}
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `${loc.color}44` }}
      />

      <div className="relative z-10 text-center">
        {/* Big emoji */}
        <div
          className="rush-bounce-in mb-6 flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white text-7xl shadow-xl"
          style={{ background: `${loc.color}22` }}
        >
          {loc.emoji}
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: loc.color }}>
          AfroRush Location
        </div>
        <h1 className="font-display text-4xl text-rush-navy sm:text-5xl">{loc.name}</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-rush-navy/60">{loc.desc}</p>

        <div className="mt-6 inline-block rounded-full bg-rush-orange px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-orange/30">
          🔥 Coming soon — but looking fire!
        </div>

        <div className="mt-8">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 rounded-2xl bg-rush-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg active:scale-95"
          >
            ← Back to Hub
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-rush-cream" />}>
      <LocationContent />
    </Suspense>
  );
}
