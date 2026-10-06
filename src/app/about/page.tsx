import type { Metadata } from "next";

// src/app/about/page.tsx — Public, fully server-rendered info page.
// This page has NO client-side JavaScript — it's pure HTML/CSS so that
// AI assistants, search crawlers, and link-preview fetchers can read it
// without needing to execute JS.
//
// Share THIS link with AIs:  https://afrorush.vercel.app/about

export const metadata: Metadata = {
  title: "About AfroRush — African Street Life Simulator & Multiplayer Racing",
  description:
    "AfroRush is a free-to-play browser game that blends a Lagos-life-style social simulator with multiplayer okada racing. Sign up, roll the birth-class dice (Nepo Baby or Lapo Baby), hustle jobs, eat at the Buka, hit Quilox nightclub, take micro-loans, pickpocket other players, and race friends in real-time multiplayer rooms. Built with Next.js, React Three Fiber, and Firebase.",
  keywords: [
    "AfroRush", "African game", "Nigeria game", "Lagos game", "Kaduna game",
    "browser game", "web game", "multiplayer racing", "life simulator",
    "okada racing", "Lagos Life", "African street", "free to play",
  ],
  openGraph: {
    title: "About AfroRush — African Street Life Simulator & Multiplayer Racing",
    description:
      "Free-to-play browser game. Roll the Nepo/Lapo birth dice, hustle jobs, eat at the Buka, race friends in real-time multiplayer rooms. Built with Next.js + Firebase.",
    type: "website",
    images: [{ url: "/afrorush-logo.jpg", width: 512, height: 512, alt: "AfroRush logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AfroRush",
    description: "African street life simulator + multiplayer okada racing. Free to play in your browser.",
    images: ["/afrorush-logo.jpg"],
  },
};

const FEATURES = [
  {
    icon: "🎲",
    title: "Birth Class Roll",
    body: "Every new player rolls the dice: 30% chance to spawn as a Nepo Baby (5M Naira, premium kente outfit) or 70% as a Lapo Baby (zero cash, must hustle from day one). Your starting reality shapes your whole game.",
  },
  {
    icon: "💼",
    title: "Hustle & Jobs",
    body: "8 jobs from Suya Seller (₦300) to Tech Hustler (₦5,000). Each drains stamina and raises hunger — eat at the Buka to recover, or you can't work. Includes Agbero (street toll collector) and Danfo Driver roles.",
  },
  {
    icon: "💸",
    title: "Micro-Loan Debt Trap",
    body: "Lapo Babies can borrow ₦1k–₦50k instantly. Interest compounds at 5% per hour. Auto-deducts from cash as you earn. Borrow wisely or end up stranded.",
  },
  {
    icon: "📅",
    title: "Saturday Bills",
    body: "Every Saturday, ₦3,000 auto-deducted for rent (₦2,500) + electricity (₦500). Just like real Lagos. 24-hour grace period after signup so new players aren't billed immediately.",
  },
  {
    icon: "🍲",
    title: "Buka (Food Court)",
    body: "6 local dishes: Gala + Pure Water (₦50, +10 stamina), Suya + Rice, Amala Shitta (₦300, +40 stamina), Pounded Yam + Egusi (₦500, +60 stamina), Pepper Soup, Small Chops platter.",
  },
  {
    icon: "🎉",
    title: "Quilox Nightlife",
    body: "Pay ₦1,000 cover fee to enter the V/I nightclub. Buy drinks to boost street_cred: Star Beer (₦500/+5), Hennessy shot (₦2k/+15), Moët bottle (₦15k/+50), Azul bottle (₦40k/+90).",
  },
  {
    icon: "🚌",
    title: "Transport + Agbero Encounters",
    body: "6 rides: Trek (free), Danfo (₦100, 30% agbero risk), Keke, Okada, BRT Bus (safe), Cab. Agbero extorts ₦200–500 extra when triggered — take BRT to stay safe.",
  },
  {
    icon: "🚶",
    title: "P2P Street — Pickpocket & Report",
    body: "List online players, pickpocket them (success based on street_cred vs target). Steal 5–20% of their cash. Fail and you're jailed 5 minutes. Or report harassers to police — jails them 10 minutes.",
  },
  {
    icon: "🏦",
    title: "Real Bank — Peer-to-Peer Cash Transfer",
    body: "Search any player by username, send them real Naira. Recipient gets a DM notification ('💸 You don receive ₦X from @sender'). The Lagos Life viral blessing loop — drop your handle on Twitter/WhatsApp and ask for blessings.",
  },
  {
    icon: "💬",
    title: "Real Direct Messages",
    body: "Search real players by username, send real DMs, get live updates via Firestore onSnapshot. No mock contacts — every conversation is a real player somewhere.",
  },
  {
    icon: "🏁",
    title: "Multiplayer Racing (Serverless)",
    body: "Host creates a room → gets 6-char code → shares on WhatsApp/X → friends join → race live on a 2D canvas synced over Firestore. 3 tracks: Third Mainland Bridge, Ikeja Traffic, V/I Beach Road. Lagos obstacles: danfo, agbero, potholes, suya carts. First to 2000m wins.",
  },
  {
    icon: "🏆",
    title: "Share Score — Viral Loop",
    body: "After every race, share your result to WhatsApp/X with auto-generated text: '🏆 I just win Street Race for AfroRush! 5,000m, 12,500 pts. My handle na @tunde — beat me if you sabi! 🏍️💨'",
  },
  {
    icon: "🏙️",
    title: "Multiple Cities",
    body: "Choose your home city: Lagos, Kaduna, Abuja, Kano, Accra, or Nairobi. Each has its own locations — Kaduna hubs include Kaduna Motor Park, ABU Zaria, Murtala Square, Kaduna Mega Mall, Hamdala Hotel, River Kaduna (crocodile-infested!).",
  },
  {
    icon: "🎮",
    title: "3D Yard + WebGL Fallback",
    body: "The /hub page renders an isometric 3D motor-park corner (okada, plastic chairs, suya grill, generator, clothes line). If your phone doesn't support WebGL, it gracefully falls back to a 2D emoji scene — the page never hard-crashes.",
  },
  {
    icon: "📱",
    title: "Mobile-First Browser Game",
    body: "No app store download. No storage limits. No data costs. Open afrorush.vercel.app in any mobile browser and you're playing in 3 seconds. Tap-to-jump, swipe to change lanes, pinch to zoom the 3D yard.",
  },
];

const STACK = [
  { label: "Framework", value: "Next.js 16 (App Router, Turbopack)" },
  { label: "UI", value: "React 19, TypeScript 5, Tailwind CSS 4" },
  { label: "3D", value: "React Three Fiber + drei + three.js" },
  { label: "Realtime DB", value: "Firebase Firestore (onSnapshot)" },
  { label: "Auth", value: "Firebase Auth (Email + Google)" },
  { label: "Race Engine", value: "Phaser 3 (single-player) + Canvas 2D (multiplayer)" },
  { label: "Hosting", value: "Vercel" },
  { label: "Components", value: "shadcn/ui, framer-motion, sonner, vaul" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#b3e5fc] via-[#fff8e7] to-[#fff8e7] text-rush-navy">
      {/* Hero */}
      <header className="mx-auto max-w-2xl px-4 pt-10 pb-6 text-center">
        <img
          src="/afrorush-logo.jpg"
          alt="AfroRush logo"
          width={96}
          height={96}
          className="mx-auto mb-4 h-20 w-20 rounded-2xl border-4 border-white shadow-lg"
        />
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.4em] text-rush-green">
          African Street Racing
        </div>
        <h1 className="font-display text-4xl leading-none sm:text-5xl">
          Afro<span className="text-rush-green">Rush</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-rush-navy/70">
          A free-to-play browser game that blends a Lagos-life-style social
          simulator with multiplayer okada racing. Roll the birth-class dice,
          hustle, eat at the Buka, take loans, race friends live, and become a
          Street Legend.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <a
            href="/"
            className="rounded-full bg-rush-green px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30"
          >
            ▶ Play free
          </a>
          <a
            href="https://gofile.io/d/y1Cwxa5u"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy shadow-md"
          >
            📦 Source code
          </a>
        </div>
      </header>

      {/* Quick facts */}
      <section className="mx-auto max-w-2xl px-4 pb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Free", v: "to play" },
            { k: "Browser", v: "no download" },
            { k: "Realtime", v: "Firestore" },
            { k: "Mobile", v: "first" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-2xl bg-white/80 p-3 text-center shadow-md backdrop-blur"
            >
              <div className="font-display text-lg text-rush-green">{s.k}</div>
              <div className="text-[10px] uppercase tracking-wider text-rush-navy/60">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-2xl px-4 pb-8">
        <h2 className="mb-4 text-center font-display text-2xl">
          What you can do
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white/80 p-4 shadow-md backdrop-blur"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="text-sm font-bold">{f.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-rush-navy/70">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-2xl px-4 pb-8">
        <h2 className="mb-4 text-center font-display text-2xl">How it works</h2>
        <ol className="space-y-3">
          {[
            "Sign up with email or Google — takes 10 seconds.",
            "Roll the birth dice: 30% Nepo Baby (5M cash), 70% Lapo Baby (0 cash).",
            "Customize your avatar (skin tone, hair, outfit) and pick your home city — Lagos, Kaduna, Abuja, Kano, Accra, or Nairobi.",
            "Land in your 3D yard / motor-park corner. See your needs, vitals (stamina, hunger, street_cred), and cash in the top bar.",
            "Open your Phone (bottom nav, 3rd tab) → see the app grid: Jobs, Buka, Quilox, Loan, Street, Bank, Messages, Crew, Ranks, Ride.",
            "Hustle jobs to earn Naira (drains stamina, raises hunger). Eat at the Buka to recover. Pay Saturday bills. Take loans if broke.",
            "Tap Race → pick a mode: Street Race, Delivery, Police Chase, Freestyle, or Multiplayer (create/join room with code).",
            "After each race, share your score on WhatsApp/X with your @handle. Other players can DM you, send you cash, or pickpocket you.",
            "Build street_cred at Quilox to unlock higher pickpocket success. Report harassers to police. Build a crew and climb the leaderboard.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl bg-white/70 p-3 shadow-sm backdrop-blur"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rush-green text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-xs text-rush-navy/80">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Tech stack */}
      <section className="mx-auto max-w-2xl px-4 pb-8">
        <h2 className="mb-4 text-center font-display text-2xl">Tech stack</h2>
        <div className="overflow-hidden rounded-2xl bg-white/80 shadow-md backdrop-blur">
          {STACK.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center justify-between px-4 py-2.5 ${
                i % 2 === 0 ? "bg-white/50" : ""
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-rush-navy/50">
                {s.label}
              </span>
              <span className="text-xs font-semibold text-rush-navy">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* For AI crawlers */}
      <section className="mx-auto max-w-2xl px-4 pb-12">
        <div className="rounded-2xl border-2 border-rush-green/30 bg-rush-green/5 p-4">
          <h3 className="mb-2 text-sm font-bold text-rush-green">
            🤖 Note for AI crawlers
          </h3>
          <p className="text-xs leading-relaxed text-rush-navy/70">
            This page is fully server-rendered HTML — no JavaScript required
            to read it. The main app at{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono">
              /
            </code>{" "}
            is a client-side React application that requires JavaScript to
            run (it loads Firebase auth and 3D rendering). If you&apos;re an
            AI assistant reviewing this site, please read this{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono">
              /about
            </code>{" "}
            page — it contains the full feature list and gameplay description.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-16 text-center">
        <a
          href="/"
          className="inline-block rounded-full bg-gradient-to-r from-rush-green to-rush-gold px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-rush-green/30"
        >
          ▶ Start playing free
        </a>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-rush-navy/40">
          No download · No sign-up wall for browsing
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-rush-navy/10 bg-white/40 px-4 py-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="font-display text-lg">
            Afro<span className="text-rush-green">Rush</span>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-rush-navy/40">
            African Street Racing · Free to play · Browser-based
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-rush-navy/50">
            <a href="/privacy" className="hover:text-rush-navy">Privacy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-rush-navy">Terms</a>
            <span>·</span>
            <a href="/about" className="hover:text-rush-navy">About</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
