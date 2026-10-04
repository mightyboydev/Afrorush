"use client";

// src/components/Lobby.tsx — main hub after login.
// Shows online players, your crew, leaderboards, garage, mode select, race entry, stats.

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  BIKE_CATALOG,
  OUTFIT_CATALOG,
  STICKER_CATALOG,
  HORN_CATALOG,
  EXHAUST_CATALOG,
  CREW_COLORS,
  MODE_INFO,
  getItem,
  formatNaira,
  levelFromRep,
  nextRepTarget,
  levelTitle,
  type CatalogItem,
  type Crew,
  type PlayerProfile,
  type RaceMode,
} from "@/lib/storage";
import {
  createCrew,
  joinCrew,
  leaveCrew,
  purchaseItem,
  subscribeToCrews,
  subscribeToCrewLeaderboard,
  subscribeToLeaderboard,
  subscribeToOnlinePlayers,
  updateLoadout,
  updateProfile,
  type LeaderboardEntry,
} from "@/lib/firestore";

type Tab = "home" | "garage" | "crews" | "leaderboard" | "stats";

interface LobbyProps {
  onStartRace: (mode: RaceMode) => void;
}

export default function Lobby({ onStartRace }: LobbyProps) {
  const { state, signOutUser } = useAuth();
  const { profile, unlocked } = state;
  const [tab, setTab] = useState<Tab>("home");

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-rush-gold border-t-transparent" />
          <div className="text-sm uppercase tracking-widest">Loading profile…</div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#1a0f33] text-white">
      <div className="pointer-events-none absolute inset-0 rush-pattern opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2b1055]/30 via-[#1a0f33]/50 to-[#1a0f33]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <LobbyHeader profile={profile} onSignOut={signOutUser} />

        <Tabs tab={tab} setTab={setTab} />

        <div className="flex-1 px-4 pb-6 sm:px-6">
          {tab === "home" && <HomeTab profile={profile} onStartRace={onStartRace} />}
          {tab === "garage" && <GarageTab profile={profile} unlocked={unlocked} />}
          {tab === "crews" && <CrewsTab profile={profile} />}
          {tab === "leaderboard" && <LeaderboardTab profile={profile} />}
          {tab === "stats" && <StatsTab profile={profile} />}
        </div>

        <footer className="px-4 py-3 text-center text-[10px] uppercase tracking-widest text-white/30 sm:px-6">
          AfroRush · Synced across devices via Firebase
        </footer>
      </div>
    </main>
  );
}

// ---------- Header ----------

function LobbyHeader({ profile, onSignOut }: { profile: PlayerProfile; onSignOut: () => Promise<void> }) {
  const lvl = levelFromRep(profile.rep);
  const next = nextRepTarget(profile.rep);
  const base = Math.pow(lvl - 1, 2) * 100;
  const pct = Math.min(100, ((profile.rep - base) / (next - base)) * 100);
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="flex items-center gap-3">
        <Avatar profile={profile} size={48} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">{profile.username}</span>
            {profile.crewTag && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black"
                style={{ background: profile.crewColor ?? "#fff" }}
              >
                [{profile.crewTag}]
              </span>
            )}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/50">
            {levelTitle(lvl)} · Level {lvl}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-black/40 px-3 py-2 text-right backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Cash</div>
          <div className="font-mono text-sm font-bold text-rush-gold">{formatNaira(profile.cash)}</div>
        </div>
        <div className="rounded-lg bg-black/40 px-3 py-2 text-right backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Rep</div>
          <div className="font-mono text-sm font-bold text-rush-jade">{profile.rep.toLocaleString()}</div>
        </div>
        <button
          onClick={onSignOut}
          className="touch-btn rounded-lg bg-black/40 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/60 backdrop-blur-sm hover:bg-rush-flame/30 hover:text-white"
        >
          Exit
        </button>
      </div>
      <div className="w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rush-jade via-rush-gold to-rush-flame transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}

function Avatar({ profile, size = 36 }: { profile: PlayerProfile | LeaderboardEntry; size?: number }) {
  const bike = "bikeId" in profile ? getItem((profile as PlayerProfile).loadout.bikeId) : undefined;
  const bikeColor = bike?.color ?? "#d2601a";
  if ("photoURL" in profile && profile.photoURL) {
    return (
      <img
        src={profile.photoURL}
        alt={profile.username}
        width={size}
        height={size}
        className="rounded-full border-2"
        style={{ width: size, height: size, borderColor: bikeColor }}
        referrerPolicy="no-referrer"
      />
    );
  }
  const initial = profile.username.charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 font-bold text-white"
      style={{ width: size, height: size, background: bikeColor, borderColor: bikeColor, fontSize: size * 0.45 }}
    >
      {initial}
    </div>
  );
}

// ---------- Tabs ----------

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "Lobby", icon: "🏠" },
    { id: "garage", label: "Garage", icon: "🔧" },
    { id: "crews", label: "Crews", icon: "👥" },
    { id: "leaderboard", label: "Ranks", icon: "🏆" },
    { id: "stats", label: "Stats", icon: "📊" },
  ];
  return (
    <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto px-4 sm:px-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`touch-btn whitespace-nowrap rounded-t-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            tab === t.id
              ? "bg-black/40 text-rush-gold backdrop-blur-sm"
              : "bg-transparent text-white/40 hover:bg-black/20 hover:text-white/70"
          }`}
        >
          <span className="mr-1">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Home Tab ----------

function HomeTab({ profile, onStartRace }: { profile: PlayerProfile; onStartRace: (m: RaceMode) => void }) {
  const [online, setOnline] = useState<LeaderboardEntry[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);

  useEffect(() => subscribeToOnlinePlayers((players) => {
    setOnline(players.map((p) => ({
      uid: p.uid,
      username: p.username,
      photoURL: p.photoURL,
      rep: 0,
      cash: 0,
      crewTag: p.crewTag,
      crewColor: p.crewColor,
      totalScore: 0,
    })));
  }), []);
  useEffect(() => subscribeToCrews(setCrews), []);

  // Derive myCrew from the live crews list + the profile's crewId.
  // No setState-in-effect needed — pure derivation.
  const myCrew = profile.crewId
    ? crews.find((c) => c.id === profile.crewId) ?? null
    : null;

  const modes: RaceMode[] = ["street-race", "delivery-rush", "police-chase", "freestyle-run"];

  return (
    <div className="space-y-4 pt-3">
      {/* Online players strip */}
      <Section title="Online Now" badge={`${online.length} rider${online.length === 1 ? "" : "s"}`}>
        {online.length === 0 ? (
          <EmptyHint>No one else online — be the first to hit the streets today.</EmptyHint>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {online.map((p) => (
              <div key={p.uid} className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-black/30 px-3 py-2 backdrop-blur-sm">
                <Avatar profile={p} size={36} />
                <div className="max-w-[64px] truncate text-[10px] font-bold uppercase tracking-wider text-white">
                  {p.username}
                </div>
                {p.crewTag && (
                  <span
                    className="rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black"
                    style={{ background: p.crewColor ?? "#fff" }}
                  >
                    {p.crewTag}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Your Crew card */}
      <Section title="Your Crew">
        {profile.crewId && myCrew ? (
          <div
            className="rounded-2xl border-2 p-4 backdrop-blur-sm"
            style={{ borderColor: myCrew.color, background: `${myCrew.color}22` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Crew</div>
                <div className="text-2xl font-black uppercase" style={{ textShadow: `0 0 24px ${myCrew.color}` }}>
                  {myCrew.name}
                </div>
              </div>
              <div className="text-right">
                <div className="rounded bg-black/40 px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-white">
                  [{myCrew.tag}]
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-white/60">
                  {myCrew.memberCount} members · {myCrew.totalRep.toLocaleString()} rep
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyHint>
            You're not in a crew yet. Head to the <strong className="text-rush-magenta">Crews</strong> tab to start or join one.
          </EmptyHint>
        )}
      </Section>

      {/* Race modes grid */}
      <Section title="Race Now" subtitle="Pick your battle">
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((m) => {
            const info = MODE_INFO[m];
            const high = profile.highScores[m] ?? 0;
            return (
              <button
                key={m}
                onClick={() => onStartRace(m)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-sm transition-all hover:scale-[1.01] hover:border-white/30"
                style={{ boxShadow: `inset 4px 0 0 ${info.accent}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: info.accent }}>
                      {info.tag}
                    </div>
                    <div className="mt-1 text-lg font-black uppercase text-white">{info.name}</div>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ background: `${info.accent}33`, color: info.accent }}
                  >
                    {m === "street-race" ? "🏁" : m === "delivery-rush" ? "📦" : m === "police-chase" ? "🚓" : "∞"}
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/60">{info.desc}</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Best</span>
                  <span className="font-mono text-xs font-bold text-rush-gold">{high.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ---------- Garage Tab ----------

function GarageTab({ profile, unlocked }: { profile: PlayerProfile; unlocked: string[] }) {
  const [cat, setCat] = useState<CatalogItem["category"]>("bike");
  const catalogs: Record<CatalogItem["category"], CatalogItem[]> = {
    bike: BIKE_CATALOG,
    outfit: OUTFIT_CATALOG,
    sticker: STICKER_CATALOG,
    horn: HORN_CATALOG,
    exhaust: EXHAUST_CATALOG,
  };
  const items = catalogs[cat];
  const equippedId =
    cat === "bike" ? profile.loadout.bikeId
    : cat === "outfit" ? profile.loadout.outfitId
    : cat === "sticker" ? profile.loadout.stickerId
    : cat === "horn" ? profile.loadout.hornId
    : profile.loadout.exhaustId;

  const handleBuy = async (item: CatalogItem) => {
    if (unlocked.includes(item.id) || profile.cash < item.price) return;
    await purchaseItem(profile.uid, item.id, item.price);
    await updateLoadout(profile.uid, { ...profile.loadout, [`${item.category}Id`]: item.id });
  };
  const handleEquip = async (item: CatalogItem) => {
    await updateLoadout(profile.uid, { ...profile.loadout, [`${item.category}Id`]: item.id });
  };

  return (
    <div className="space-y-4 pt-3">
      <SectionHeader title="Garage" subtitle="Customize your ride & style" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {(["bike", "outfit", "sticker", "horn", "exhaust"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`touch-btn whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              cat === c ? "bg-rush-flame text-white shadow-lg shadow-rush-flame/30" : "bg-black/30 text-white/60 hover:bg-black/50"
            }`}
          >
            {c === "bike" ? "🏍️ Bikes" : c === "outfit" ? "👕 Outfits" : c === "sticker" ? "✨ Stickers" : c === "horn" ? "📯 Horns" : "💨 Exhaust"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const owned = unlocked.includes(item.id);
          const equipped = equippedId === item.id;
          const canAfford = profile.cash >= item.price;
          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition-all ${
                equipped ? "border-rush-gold bg-rush-gold/10" : "border-white/10 bg-black/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 text-2xl"
                  style={{ background: item.color ? `${item.color}33` : "#222", color: item.color ?? "#fff" }}
                >
                  {cat === "bike" ? "🏍️" : cat === "outfit" ? "👕" : cat === "sticker" ? "✨" : cat === "horn" ? "📯" : "💨"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-white">{item.name}</div>
                    {equipped && (
                      <span className="rounded bg-rush-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                        Equipped
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/60">{item.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-mono text-sm font-bold text-rush-gold">
                      {item.price === 0 ? "FREE" : formatNaira(item.price)}
                    </div>
                    {owned ? (
                      <button
                        onClick={() => handleEquip(item)}
                        disabled={equipped}
                        className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {equipped ? "Equipped" : "Equip"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className="rounded-lg bg-rush-flame px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                      >
                        {canAfford ? "Buy" : "Need ₦"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
        <div className="text-[10px] uppercase tracking-widest text-white/50">Current Loadout</div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {(["bike", "outfit", "exhaust"] as const).map((c) => {
            const id = c === "bike" ? profile.loadout.bikeId : c === "outfit" ? profile.loadout.outfitId : profile.loadout.exhaustId;
            const item = getItem(id);
            return (
              <div key={c} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1">
                {item?.color && <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />}
                <span className="text-[10px] uppercase tracking-widest text-white/40">{c}</span>
                <span className="font-bold text-white">{item?.name ?? "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Crews Tab ----------

function CrewsTab({ profile }: { profile: PlayerProfile }) {
  const { refreshProfile } = useAuth();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [color, setColor] = useState(CREW_COLORS[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToCrews(setCrews), []);

  const submitCreate = async () => {
    if (busy || !name.trim()) return;
    setBusy(true);
    try {
      await createCrew(profile, name, tag, color);
      await refreshProfile();
      setCreating(false);
      setName(""); setTag(""); setColor(CREW_COLORS[0]);
    } finally { setBusy(false); }
  };

  const handleJoin = async (crew: Crew) => {
    if (busy || profile.crewId === crew.id) return;
    setBusy(true);
    try {
      if (profile.crewId) await leaveCrew(profile);
      await joinCrew(profile, crew);
      await refreshProfile();
    } finally { setBusy(false); }
  };

  const handleLeave = async () => {
    if (busy || !profile.crewId) return;
    setBusy(true);
    try {
      await leaveCrew(profile);
      await refreshProfile();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 pt-3">
      <SectionHeader title="Crews" subtitle="Rep your colours on the street" />

      {/* Your crew status */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
        {profile.crewId ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: profile.crewColor ?? "#fff" }} />
              <div>
                <div className="font-bold text-white">{profile.crewName}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">[{profile.crewTag}]</div>
              </div>
            </div>
            <button
              onClick={handleLeave}
              disabled={busy}
              className="rounded-lg bg-rush-magenta/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-rush-magenta/50 disabled:opacity-50"
            >
              Leave
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-white/60">You're not in a crew yet.</div>
            <button
              onClick={() => setCreating(true)}
              className="rounded-lg bg-gradient-to-r from-rush-flame to-rush-gold px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-rush-flame/30 hover:opacity-90"
            >
              + Start a Crew
            </button>
          </div>
        )}
      </div>

      {/* Create crew form */}
      {creating && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-rush-gold">Create Crew</div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/50">Crew Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="e.g. Lagos Bolt Riders"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 focus:border-rush-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/50">Crew Tag (3 chars)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                maxLength={3}
                placeholder="AFR"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-lg font-bold uppercase tracking-widest text-white placeholder:text-white/30 focus:border-rush-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-widest text-white/50">Crew Colour</label>
              <div className="flex flex-wrap gap-2">
                {CREW_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${color === c ? "scale-110 border-white" : "border-white/20"}`}
                    style={{ background: c }}
                    aria-label={`Crew color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCreating(false)}
                className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={submitCreate}
                disabled={busy || !name.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-rush-flame to-rush-gold px-4 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-rush-flame/30 hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create Crew"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All crews list */}
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-widest text-white/50">All Crews · {crews.length}</div>
        {crews.length === 0 ? (
          <EmptyHint>No crews yet — be the first to start one.</EmptyHint>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {crews.map((c) => {
              const mine = profile.crewId === c.id;
              return (
                <div key={c.id} className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">[{c.tag}] · {c.memberCount} members</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-rush-jade">{c.totalRep.toLocaleString()}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40">rep</div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    {mine ? (
                      <span className="rounded bg-rush-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">Your Crew</span>
                    ) : (
                      <button
                        onClick={() => handleJoin(c)}
                        disabled={busy}
                        className="rounded-lg bg-rush-jade/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rush-jade/50 disabled:opacity-50"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Leaderboard Tab ----------

function LeaderboardTab({ profile }: { profile: PlayerProfile }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [view, setView] = useState<"players" | "crews">("players");

  useEffect(() => subscribeToLeaderboard(setEntries), []);
  useEffect(() => subscribeToCrewLeaderboard(setCrews), []);

  return (
    <div className="space-y-4 pt-3">
      <SectionHeader title="Leaderboards" subtitle="Top riders & crews across Africa" />

      <div className="flex gap-1 rounded-xl bg-black/40 p-1">
        <button
          onClick={() => setView("players")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            view === "players" ? "bg-rush-flame text-white" : "text-white/60"
          }`}
        >
          Riders
        </button>
        <button
          onClick={() => setView("crews")}
          className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            view === "crews" ? "bg-rush-flame text-white" : "text-white/60"
          }`}
        >
          Crews
        </button>
      </div>

      {view === "players" ? (
        entries.length === 0 ? (
          <EmptyHint>No riders yet. Be the first!</EmptyHint>
        ) : (
          <div className="space-y-2">
            {entries.map((e, i) => {
              const isMe = e.uid === profile.uid;
              return (
                <div
                  key={e.uid}
                  className={`flex items-center gap-3 rounded-xl border p-3 backdrop-blur-sm ${
                    isMe ? "border-rush-gold bg-rush-gold/10" : "border-white/10 bg-black/30"
                  }`}
                >
                  <RankBadge rank={i + 1} />
                  <Avatar profile={e} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold text-white">{e.username}</span>
                      {e.crewTag && (
                        <span
                          className="rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black"
                          style={{ background: e.crewColor ?? "#fff" }}
                        >
                          {e.crewTag}
                        </span>
                      )}
                      {isMe && <span className="text-[10px] uppercase tracking-widest text-rush-gold">You</span>}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">
                      {e.totalScore.toLocaleString()} score · {formatNaira(e.cash)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-rush-jade">{e.rep.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">rep</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : crews.length === 0 ? (
        <EmptyHint>No crews yet.</EmptyHint>
      ) : (
        <div className="space-y-2">
          {crews.map((c, i) => {
            const mine = profile.crewId === c.id;
            return (
              <div
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border p-3 backdrop-blur-sm ${
                  mine ? "border-rush-gold bg-rush-gold/10" : "border-white/10 bg-black/30"
                }`}
              >
                <RankBadge rank={i + 1} />
                <span className="h-4 w-4 rounded-full" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-white">{c.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">[{c.tag}]</span>
                    {mine && <span className="text-[10px] uppercase tracking-widest text-rush-gold">Your Crew</span>}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">{c.memberCount} members</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-rush-jade">{c.totalRep.toLocaleString()}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">rep</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  if (medal) return <span className="text-2xl">{medal}</span>;
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-white/60">
      {rank}
    </span>
  );
}

// ---------- Stats Tab ----------

function StatsTab({ profile }: { profile: PlayerProfile }) {
  const { refreshProfile } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  const lvl = levelFromRep(profile.rep);
  const modes: RaceMode[] = ["street-race", "delivery-rush", "police-chase", "freestyle-run"];

  const toggleSound = async () => {
    await updateProfile(profile.uid, { soundOn: !profile.soundOn });
    await refreshProfile();
  };

  const totalScore = Object.values(profile.highScores).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 pt-3">
      <SectionHeader title="Stats & Settings" subtitle="Your rider journey" />

      {/* Profile card */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Avatar profile={profile} size={64} />
          <div className="flex-1">
            <div className="text-xl font-black text-white">{profile.username}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              {levelTitle(lvl)} · Level {lvl}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs">
              <span className="text-rush-gold">{formatNaira(profile.cash)}</span>
              <span className="text-rush-jade">{profile.rep.toLocaleString()} rep</span>
              <span className="text-white/60">{profile.totalRuns} runs</span>
              <span className="text-white/60">{totalScore.toLocaleString()} score</span>
            </div>
          </div>
        </div>
      </div>

      {/* High scores */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
        <div className="mb-3 text-[10px] uppercase tracking-widest text-white/50">High Scores</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {modes.map((m) => {
            const info = MODE_INFO[m];
            const score = profile.highScores[m] ?? 0;
            return (
              <div key={m} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: info.accent }} />
                  <span className="text-sm font-bold text-white">{info.name}</span>
                </div>
                <span className="font-mono text-sm font-bold text-rush-gold">{score.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
        <div className="mb-3 text-[10px] uppercase tracking-widest text-white/50">Settings</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Sound & Music</div>
            <div className="text-xs text-white/50">Engine, pickups, horns</div>
          </div>
          <button
            onClick={toggleSound}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              profile.soundOn ? "bg-rush-jade" : "bg-white/20"
            }`}
            aria-label="Toggle sound"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
                profile.soundOn ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
        {confirmReset && (
          <div className="mt-4 rounded-lg border border-rush-flame/40 bg-rush-flame/10 p-3 text-xs text-rush-flame">
            To fully reset progress, sign out and delete your account from the Firebase console, or just sign out and create a new account.
          </div>
        )}
        <div className="mt-4 border-t border-white/10 pt-4">
          {confirmReset ? (
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white">Close</button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="text-xs font-bold uppercase tracking-widest text-rush-flame hover:underline">
              Account help
            </button>
          )}
        </div>
      </div>

      {/* How to play */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
        <div className="mb-3 text-[10px] uppercase tracking-widest text-white/50">How to Play</div>
        <ul className="space-y-1.5 text-xs text-white/70">
          <li>← → or A/D — steer your okada left and right</li>
          <li>↑ / Space / Boost button — use nitro boost (drains bar)</li>
          <li>↓ / Shift / Brake button — slow down for tight spots</li>
          <li>P — pause · H — honk your horn</li>
          <li>On mobile: tap the on-screen buttons</li>
          <li>Grab Suya for a boost, Jollof for nitro, ₦ for cash, ★ for rep</li>
          <li>Near-miss overtakes give massive style points and combo!</li>
        </ul>
      </div>
    </div>
  );
}

// ---------- Shared ----------

function Section({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-rush-gold">{subtitle ?? title}</div>
          {subtitle && <h3 className="text-lg font-black uppercase text-white">{title}</h3>}
        </div>
        {badge && (
          <span className="rounded-full bg-rush-flame/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rush-flame">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-widest text-rush-gold">{subtitle}</div>
      <h2 className="text-2xl font-black uppercase text-white sm:text-3xl">{title}</h2>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-xs text-white/50">
      {children}
    </div>
  );
}
