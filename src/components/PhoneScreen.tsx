"use client";

// src/components/PhoneScreen.tsx — Smartphone interface with app grid.
// Apps: Jobs, Messages, Bank, Crew, Leaderboard, Settings, Camera, Ride, Health, etc.

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { formatNaira, type PlayerProfile } from "@/lib/storage";
import {
  updateProfile,
  sendDm,
  searchPlayersByUsername,
  subscribeToDms,
  transferCash,
  type DmMessage,
} from "@/lib/firestore";

interface App {
  id: string;
  label: string;
  icon: string;
  from: string;
  to: string;
  badge?: number;
  locked?: boolean;
}

const APPS: App[] = [
  { id: "jobs", label: "Jobs", icon: "💼", from: "#1fb86f", to: "#178a55" },
  { id: "messages", label: "Messages", icon: "💬", from: "#16a3b1", to: "#0d9488", badge: 3 },
  { id: "bank", label: "Bank", icon: "🏦", from: "#ffc531", to: "#e8a217" },
  { id: "crew", label: "Crew", icon: "👥", from: "#7c3aed", to: "#5b21b6" },
  { id: "leaderboard", label: "Ranks", icon: "🏆", from: "#ff6a1a", to: "#c2410c" },
  { id: "ride", label: "Ride", icon: "🛺", from: "#1fb86f", to: "#16a34a" },
  { id: "health", label: "Health", icon: "❤️", from: "#ef4444", to: "#dc2626" },
  { id: "camera", label: "Camera", icon: "📷", from: "#14213d", to: "#1e293b" },
  { id: "games", label: "Games", icon: "🎮", from: "#c026d3", to: "#a21caf" },
  { id: "nollywood", label: "Nollywood", icon: "🎬", from: "#ff6a1a", to: "#ea580c", locked: true },
  { id: "settings", label: "Settings", icon: "⚙️", from: "#6b7280", to: "#4b5563" },
  { id: "more", label: "More", icon: "•••", from: "#9ca3af", to: "#6b7280" },
];

export default function PhoneScreen({ profile }: { profile: PlayerProfile }) {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const [battery] = useState(78);

  return (
    <div className="rush-slide-up min-h-screen pb-4">
      {/* Phone status bar — premium dark gradient */}
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-rush-navy via-rush-purple to-rush-navy px-4 py-2 text-white shadow-lg">
        <span className="text-xs font-bold">{time}</span>
        <div className="flex items-center gap-2 text-[10px]">
          <span>📶 4G</span>
          <span>🔋 {battery}%</span>
        </div>
      </div>

      {/* If app is open, show its content */}
      {openApp ? (
        <AppContent appId={openApp} profile={profile} onClose={() => setOpenApp(null)} />
      ) : (
        <>
          {/* Wallet card — premium dark gradient like Lagos Life */}
          <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 text-white shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">AfroRush Wallet</span>
              <span className="rounded-full bg-rush-green/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rush-green">● Active</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/40">Cash</div>
                <div className="font-display text-2xl">{formatNaira(profile.cash)}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-white/40">Gold</div>
                <div className="font-display text-lg text-rush-gold">🪙 {profile.gold}</div>
              </div>
            </div>
            {/* Mini stat bar */}
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-2">
              <div className="flex-1 text-center">
                <div className="text-[8px] uppercase tracking-wider text-white/30">Rep</div>
                <div className="text-xs font-bold text-rush-jade">{profile.rep.toLocaleString()}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[8px] uppercase tracking-wider text-white/30">Runs</div>
                <div className="text-xs font-bold text-white">{profile.totalRuns}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[8px] uppercase tracking-wider text-white/30">Crew</div>
                <div className="text-xs font-bold text-white">{profile.crewTag ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* App grid — squircle icons like Lagos Life */}
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Apps</div>
          <div className="grid grid-cols-4 gap-2.5">
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => !app.locked && setOpenApp(app.id)}
                className="flex flex-col items-center gap-1 transition-all active:scale-90"
              >
                <div className="relative">
                  <div
                    className="flex h-12 w-12 items-center justify-center text-xl"
                    style={{
                      borderRadius: "22%",
                      background: `linear-gradient(135deg, ${app.from}, ${app.to})`,
                      boxShadow: "0 3px 8px -1px rgba(20,33,61,0.2), inset 0 -1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {app.locked ? "🔒" : app.icon}
                  </div>
                  {app.badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rush-orange px-1 text-[8px] font-bold text-white">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold text-rush-navy">{app.label}</span>
              </button>
            ))}
          </div>

          {/* Recent activity */}
          <div className="mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Recent</div>
          <div className="space-y-2">
            <ActivityItem icon="🏁" text="Finished Street Race" sub="Earned ₦250 + 15 rep" time="2m ago" />
            <ActivityItem icon="👥" text="Joined crew 'Lagos Bolt Riders'" sub="Tag [LBR]" time="1h ago" />
            <ActivityItem icon="🎁" text="Claimed daily reward" sub="₦500 + 10 gold" time="1d ago" />
          </div>
        </>
      )}
    </div>
  );
}

function AppContent({ appId, profile, onClose }: { appId: string; profile: PlayerProfile; onClose: () => void }) {
  const app = APPS.find((a) => a.id === appId);
  if (!app) return null;

  // Settings app gets a real UI with logout
  if (appId === "settings") {
    return <SettingsApp profile={profile} onClose={onClose} app={app} />;
  }
  // Bank app — send money to other players
  if (appId === "bank") {
    return <BankApp profile={profile} onClose={onClose} app={app} />;
  }
  // Messages app — texting
  if (appId === "messages") {
    return <MessagesApp profile={profile} onClose={onClose} app={app} />;
  }
  // Jobs app — earn Naira
  if (appId === "jobs") {
    return <JobsApp profile={profile} onClose={onClose} app={app} />;
  }
  // Ride app — fast travel
  if (appId === "ride") {
    return <RideApp profile={profile} onClose={onClose} app={app} />;
  }

  return (
    <div className="rush-bounce-in">
      {/* App header */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">
          ←
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
          style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}
        >
          {app.icon}
        </div>
        <h2 className="font-display text-xl text-rush-navy">{app.label}</h2>
      </div>

      {/* App body — placeholder content per app */}
      <div className="rush-glass rounded-3xl p-5 text-center">
        <div className="mb-3 text-5xl">{app.icon}</div>
        <div className="font-display text-lg text-rush-navy">{app.label} app</div>
        <p className="mt-1 text-sm text-rush-navy/60">
          {appId === "jobs" && "Find missions and earn Naira. 3 jobs available today."}
          {appId === "messages" && "3 unread messages from your crew."}
          {appId === "bank" && `Balance: ${formatNaira(profile.cash)} · ${profile.gold} gold`}
          {appId === "crew" && "Your crew: Lagos Bolt Riders [LBR] · 4 members"}
          {appId === "leaderboard" && "You're ranked #12 in Lagos this week."}
          {appId === "ride" && "Call an okada, danfo, or cab to travel."}
          {appId === "health" && "Energy 85% · Mood 72% · Hunger 58%"}
          {appId === "camera" && "Take photos in the world to earn rep."}
          {appId === "games" && "Mini-games: Suya Dice, Ludo, Ayo. Coming soon!"}
          {appId === "more" && "More apps coming soon."}
        </p>
        <button className="mt-4 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
          Open
        </button>
      </div>
    </div>
  );
}

function SettingsApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { signOutUser, refreshProfile } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleSound = async () => {
    setBusy(true);
    try {
      await updateProfile(profile.uid, { soundOn: !profile.soundOn });
      await refreshProfile();
    } finally { setBusy(false); }
  };

  const cycleGraphics = async () => {
    setBusy(true);
    try {
      const next = profile.graphicsQuality === "low" ? "medium" : profile.graphicsQuality === "medium" ? "high" : "low";
      await updateProfile(profile.uid, { graphicsQuality: next });
      await refreshProfile();
    } finally { setBusy(false); }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>
          {app.icon}
        </div>
        <h2 className="font-display text-xl text-rush-navy">{app.label}</h2>
      </div>

      <div className="space-y-3">
        {/* Profile card */}
        <div className="rush-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white" style={{ background: profile.avatar?.skinTone ?? "#c68642" }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-display text-lg text-rush-navy">{profile.username}</div>
              <div className="text-[10px] uppercase tracking-wider text-rush-navy/50">{profile.email ?? "No email"}</div>
            </div>
          </div>
        </div>

        {/* Sound toggle */}
        <button onClick={toggleSound} disabled={busy} className="rush-card flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">{profile.soundOn ? "🔊" : "🔇"}</span>
            <div className="text-left">
              <div className="text-sm font-bold text-rush-navy">Sound & Music</div>
              <div className="text-[10px] text-rush-navy/50">{profile.soundOn ? "On" : "Off"}</div>
            </div>
          </div>
          <div className={`relative h-7 w-12 rounded-full transition-colors ${profile.soundOn ? "bg-rush-green" : "bg-rush-navy/20"}`}>
            <div className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${profile.soundOn ? "left-6" : "left-1"}`} />
          </div>
        </button>

        {/* Graphics quality */}
        <button onClick={cycleGraphics} disabled={busy} className="rush-card flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <div className="text-left">
              <div className="text-sm font-bold text-rush-navy">Graphics Quality</div>
              <div className="text-[10px] uppercase tracking-wider text-rush-navy/50">{profile.graphicsQuality}</div>
            </div>
          </div>
          <span className="text-xs text-rush-navy/40">Tap to change →</span>
        </button>

        {/* Admin link (only for owner) */}
        {profile.uid === "1rf7yswl35QuUyfdQehMs1qdlIy2" && (
          <a href="/admin" className="rush-card flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛠️</span>
              <div className="text-left">
                <div className="text-sm font-bold text-rush-navy">Admin Dashboard</div>
                <div className="text-[10px] text-rush-navy/50">Manage users, crews, economy</div>
              </div>
            </div>
            <span className="text-xs text-rush-navy/40">→</span>
          </a>
        )}

        {/* Logout */}
        <div className="rush-card overflow-hidden">
          {!confirmLogout ? (
            <button onClick={() => setConfirmLogout(true)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="text-xl">🚪</span>
              <div>
                <div className="text-sm font-bold text-red-500">Log Out</div>
                <div className="text-[10px] text-rush-navy/50">Sign out of your account</div>
              </div>
            </button>
          ) : (
            <div className="p-4">
              <div className="mb-3 text-sm font-bold text-rush-navy">Are you sure you want to log out?</div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmLogout(false)} className="flex-1 rounded-xl bg-rush-cream px-4 py-3 text-sm font-bold uppercase tracking-wider text-rush-navy">
                  Cancel
                </button>
                <button onClick={() => signOutUser()} className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pt-2 text-center text-[10px] uppercase tracking-widest text-rush-navy/30">
          AfroRush v1.0 · Built with ❤️
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ icon, text, sub, time }: { icon: string; text: string; sub: string; time: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rush-cream text-base">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="truncate text-xs font-bold text-rush-navy">{text}</div>
        <div className="truncate text-[10px] text-rush-navy/50">{sub}</div>
      </div>
      <span className="text-[10px] text-rush-navy/40">{time}</span>
    </div>
  );
}

// ---------- Bank App — Real Peer-to-Peer Transfer ----------

function BankApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allDms, setAllDms] = useState<DmMessage[]>([]);

  // Live DM subscription so we can show transfer history
  useEffect(() => {
    const unsub = subscribeToDms(profile.uid, (msgs) => setAllDms(msgs));
    return () => unsub();
  }, [profile.uid]);

  // Extract money-transfer DMs as transaction history
  const transactions = useMemo(() => {
    return allDms
      .filter((m) => m.text.startsWith("💸") || m.text.includes("transfer"))
      .slice(-10)
      .reverse();
  }, [allDms]);

  const sendMoney = async () => {
    setError(null); setMessage(null);
    const amt = parseInt(amount);
    if (!recipient.trim() || !amt || amt <= 0) { setError("Enter username and amount"); return; }
    if (amt > profile.cash) { setError("You no get enough cash for this transfer"); return; }
    setBusy(true);
    try {
      const { recipientName } = await transferCash(profile, recipient.trim(), amt, note.trim() || undefined);
      await refreshProfile();
      setMessage(`✓ Sent ₦${amt.toLocaleString()} to @${recipientName}! Dem go see am for Messages.`);
      setRecipient(""); setAmount(""); setNote("");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  // Quick "Bless" presets — the Lagos Life viral hook
  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Bank</h2>
      </div>

      {/* Balance card */}
      <div className="rush-gradient mb-4 overflow-hidden rounded-3xl p-4 text-white shadow-lg">
        <div className="text-[10px] uppercase tracking-widest text-white/70">Balance</div>
        <div className="font-display text-2xl">{formatNaira(profile.cash)}</div>
        <div className="mt-1 text-xs text-white/60">🪙 {profile.gold} gold</div>
      </div>

      {/* Send money — REAL peer-to-peer */}
      <div className="rush-glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Send Money (Real P2P)</span>
          <span className="text-[9px] text-rush-green">● Live</span>
        </div>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient username (e.g. Tunde)"
          className="mb-2 w-full rounded-xl border border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy"
        />
        <div className="mb-2 flex gap-1.5">
          {quickAmounts.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="flex-1 rounded-lg bg-rush-cream/60 py-1.5 text-[10px] font-bold text-rush-navy active:scale-95"
            >
              ₦{a >= 1000 ? `${a / 1000}k` : a}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₦)"
          className="mb-2 w-full rounded-xl border border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={80}
          placeholder="Note (optional) — e.g. 'For the suya 🍢'"
          className="mb-2 w-full rounded-xl border border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy"
        />
        <button
          onClick={sendMoney}
          disabled={busy}
          className="w-full rounded-xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : `Send ₦${amount ? parseInt(amount).toLocaleString() : 0}`}
        </button>
        {message && <div className="mt-2 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
        {error && <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
      </div>

      {/* Your handle — the viral share loop */}
      <div className="mt-3 rush-glass rounded-3xl p-4">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Your Handle</div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg text-rush-navy">@{profile.username}</span>
          <ShareHandleButton username={profile.username} cash={profile.cash} />
        </div>
        <p className="mt-1 text-[10px] text-rush-navy/50">Drop your handle for Twitter/WhatsApp make people bless you with cash 🤑</p>
      </div>

      {/* Transaction history (from DMs) */}
      <div className="mt-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Recent Transfers</div>
        {transactions.length === 0 ? (
          <div className="rounded-2xl bg-white/70 p-4 text-center text-xs text-rush-navy/50">
            No transfers yet. Send money to a friend to start the chain!
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-2xl bg-white/80 p-2.5 backdrop-blur">
                <span className="text-base">💸</span>
                <div className="flex-1 text-left">
                  <div className="text-[11px] font-bold text-rush-navy">{t.text.split("\n")[0]}</div>
                  <div className="text-[9px] text-rush-navy/50">{formatTimeAgo(t.createdAt)} ago</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Share handle button — used by BankApp and hub top bar
function ShareHandleButton({ username, cash }: { username: string; cash: number }) {
  const [copied, setCopied] = useState(false);
  const shareText = `Yo! I dey play AfroRush 🏍️💨 My handle na @${username} and I get ₦${cash.toLocaleString()} cash. Bless me with transfer abeg — open AfroRush!`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://afrorush.vercel.app";

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, "_blank");
  };
  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };
  const copyHandle = async () => {
    try {
      await navigator.clipboard.writeText(`@${username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex gap-1">
      <button onClick={shareToWhatsApp} className="flex h-8 w-8 items-center justify-center rounded-lg bg-rush-green/20 text-base active:scale-90" aria-label="Share to WhatsApp">💬</button>
      <button onClick={shareToX} className="flex h-8 w-8 items-center justify-center rounded-lg bg-rush-purple/20 text-base active:scale-90" aria-label="Share to X">𝕏</button>
      <button onClick={copyHandle} className="flex h-8 w-8 items-center justify-center rounded-lg bg-rush-cream text-base active:scale-90" aria-label="Copy handle">
        {copied ? "✓" : "📋"}
      </button>
    </div>
  );
}

export { ShareHandleButton };

// ---------- Messages App — Real DMs ----------

interface DmThread {
  uid: string;        // other user's uid
  name: string;       // other user's name
  last: string;        // last message preview
  time: string;        // formatted time
  unread: number;
  ts: number;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function MessagesApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const [view, setView] = useState<"list" | "chat">("list");
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [input, setInput] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ uid: string; username: string; photoURL: string | null }>>([]);
  const [searching, setSearching] = useState(false);
  const [allDms, setAllDms] = useState<DmMessage[]>([]);
  const [sending, setSending] = useState(false);

  // Subscribe to all DMs involving me — real-time
  useEffect(() => {
    const unsub = subscribeToDms(profile.uid, (msgs) => setAllDms(msgs));
    return () => unsub();
  }, [profile.uid]);

  // Debounced username search
  useEffect(() => {
    const q = searchUsername.trim();
    if (!q) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchPlayersByUsername(q);
        // Filter out self
        setSearchResults(results.filter((r) => r.uid !== profile.uid));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchUsername, profile.uid]);

  // Build thread list from flat DM array
  const threads: DmThread[] = useMemo(() => {
    const map = new Map<string, DmThread>();
    for (const m of allDms) {
      const isMe = m.fromUid === profile.uid;
      const otherUid = isMe ? m.toUid : m.fromUid;
      const otherName = isMe ? m.toName : m.fromName;
      const existing = map.get(otherUid);
      const unreadInc = !isMe && !m.read ? 1 : 0;
      if (!existing || m.createdAt > existing.ts) {
        map.set(otherUid, {
          uid: otherUid,
          name: otherName || "Player",
          last: m.text,
          time: formatTimeAgo(m.createdAt),
          unread: existing ? existing.unread + unreadInc : unreadInc,
          ts: m.createdAt,
        });
      } else {
        existing.unread += unreadInc;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.ts - a.ts);
  }, [allDms, profile.uid]);

  // Messages for the currently selected thread
  const currentThreadMsgs = useMemo(() => {
    if (!selectedUid) return [];
    return allDms
      .filter((m) => (m.fromUid === selectedUid && m.toUid === profile.uid) || (m.fromUid === profile.uid && m.toUid === selectedUid))
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [allDms, selectedUid, profile.uid]);

  const openChat = (uid: string, name: string) => {
    setSelectedUid(uid);
    setSelectedName(name);
    setView("chat");
    setInput("");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !selectedUid) return;
    setSending(true);
    setInput("");
    try {
      await sendDm(profile, selectedUid, selectedName, text);
    } catch (e) {
      // Revert on error
      setInput(text);
      console.error("DM send failed:", e);
    } finally {
      setSending(false);
    }
  };

  // ---------- Chat view ----------
  if (view === "chat" && selectedUid) {
    return (
      <div className="rush-bounce-in">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => setView("list")} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>💬</div>
          <div className="flex-1">
            <h2 className="font-display text-lg text-rush-navy">{selectedName}</h2>
            <div className="text-[9px] text-rush-navy/50">Real DM · Live</div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex min-h-[300px] flex-col justify-end space-y-2 rounded-3xl bg-white/60 p-4">
          {currentThreadMsgs.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <div className="mb-2 text-4xl">👋</div>
                <div className="text-xs text-rush-navy/60">Say hi to {selectedName}!</div>
                <div className="mt-1 text-[10px] text-rush-navy/40">Messages are delivered when they&apos;re online.</div>
              </div>
            </div>
          )}
          {currentThreadMsgs.map((msg) => {
            const mine = msg.fromUid === profile.uid;
            return (
              <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-rush-green text-white" : "bg-white text-rush-navy"}`}>
                  {msg.text}
                  <div className={`mt-0.5 text-[8px] ${mine ? "text-white/60" : "text-rush-navy/40"}`}>
                    {formatTimeAgo(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && send()}
            placeholder={sending ? "Sending…" : "Type a message…"}
            disabled={sending}
            className="flex-1 rounded-full border border-rush-cream bg-white px-4 py-2.5 text-sm text-rush-navy disabled:opacity-60"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rush-green text-white active:scale-95 disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </div>
    );
  }

  // ---------- List view ----------
  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Messages</h2>
      </div>

      {/* Search bar — find real players by username */}
      <div className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Search username to start chat…"
            className="flex-1 rounded-full border-2 border-rush-cream bg-white px-4 py-2 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rush-cream text-rush-navy/60">
            {searching ? "…" : "🔍"}
          </div>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-1 rounded-2xl bg-white/70 p-2 backdrop-blur-md">
            {searchResults.map((p) => (
              <button
                key={p.uid}
                onClick={() => { openChat(p.uid, p.username); setSearchUsername(""); }}
                className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-rush-cream/50 active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-jade text-xs font-bold text-white">
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-bold text-rush-navy">{p.username}</span>
                <span className="text-[9px] font-bold text-rush-green">CHAT →</span>
              </button>
            ))}
          </div>
        )}
        {searchUsername.trim() && !searching && searchResults.length === 0 && (
          <div className="mt-2 rounded-xl bg-rush-cream/60 p-3 text-center text-xs text-rush-navy/60">
            No player found with that username. They need to sign up first!
          </div>
        )}
      </div>

      {/* Threads (real DMs from Firestore) */}
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Conversations</div>
      <div className="space-y-2">
        {threads.length === 0 && (
          <div className="rounded-2xl bg-white/70 p-6 text-center backdrop-blur-md">
            <div className="mb-2 text-4xl">💬</div>
            <div className="text-sm font-bold text-rush-navy">No conversations yet</div>
            <p className="mt-1 text-xs text-rush-navy/60">Search a username above to start your first chat with another AfroRush player.</p>
          </div>
        )}
        {threads.map((t) => (
          <button
            key={t.uid}
            onClick={() => openChat(t.uid, t.name)}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-jade text-base font-bold text-white">
              {t.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-rush-navy">{t.name}</span>
                <span className="text-[10px] text-rush-navy/40">{t.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-rush-navy/60">{t.last}</span>
                {t.unread > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rush-green px-1 text-[10px] font-bold text-white">
                    {t.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Jobs App ----------

function JobsApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const jobs = [
    { id: "okada-rider", title: "Okada Rider", pay: 500, time: "5 min", emoji: "🏍️", desc: "Carry passengers across the city" },
    { id: "delivery", title: "Delivery Boy", pay: 800, time: "10 min", emoji: "📦", desc: "Deliver packages on time" },
    { id: "suya-seller", title: "Suya Seller", pay: 300, time: "3 min", emoji: "🍢", desc: "Sell suya at the junction" },
    { id: "danfo-driver", title: "Danfo Driver", pay: 1200, time: "15 min", emoji: "🚌", desc: "Drive the yellow bus route" },
    { id: "phone-repair", title: "Phone Repairer", pay: 1000, time: "8 min", emoji: "📱", desc: "Fix screens and chargers" },
    { id: "event-promoter", title: "Event Promoter", pay: 2000, time: "20 min", emoji: "📢", desc: "Promote owambe parties" },
  ];

  const claimJob = async (job: typeof jobs[0]) => {
    if (busy) return;
    setBusy(job.id);
    setMessage(null);
    try {
      const { updateProfile } = await import("@/lib/firestore");
      await updateProfile(profile.uid, { cash: profile.cash + job.pay });
      await refreshProfile();
      setMessage(`You earned ₦${job.pay.toLocaleString()} as a ${job.title}!`);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Jobs</h2>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}

      <div className="space-y-2">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{job.emoji}</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-rush-navy">{job.title}</div>
              <div className="text-[10px] text-rush-navy/50">{job.desc}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                <span className="font-bold text-rush-gold">₦{job.pay.toLocaleString()}</span>
                <span className="text-rush-navy/40">⏱ {job.time}</span>
              </div>
            </div>
            <button
              onClick={() => claimJob(job)}
              disabled={busy !== null}
              className="rounded-lg bg-rush-green px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white active:scale-95 disabled:opacity-50"
            >
              {busy === job.id ? "Working…" : "Start"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Ride App ----------

function RideApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const [message, setMessage] = useState<string | null>(null);

  const rides = [
    { id: "trek", name: "Trek", emoji: "🚶", fare: 0, time: "Slow but free" },
    { id: "okada", name: "Okada", emoji: "🏍️", fare: 250, time: "Fastest in traffic" },
    { id: "keke", name: "Keke", emoji: "🛺", fare: 100, time: "Good for short trips" },
    { id: "danfo", name: "Danfo", emoji: "🚌", fare: 100, time: "Cheapest ride" },
    { id: "cab", name: "Cab", emoji: "🚕", fare: 500, time: "Comfortable + AC" },
  ];

  const travel = async (ride: typeof rides[0]) => {
    setMessage(null);
    if (ride.fare > profile.cash) { setMessage("Not enough cash for this ride"); return; }
    try {
      const { updateProfile } = await import("@/lib/firestore");
      await updateProfile(profile.uid, { cash: profile.cash - ride.fare });
      setMessage(`You hopped on a ${ride.name}! Travelled across the city.`);
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Ride</h2>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}

      <div className="space-y-2">
        {rides.map((ride) => (
          <button key={ride.id} onClick={() => travel(ride)} className="flex w-full items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur active:scale-95">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{ride.emoji}</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-rush-navy">{ride.name}</div>
              <div className="text-[10px] text-rush-navy/50">{ride.time}</div>
            </div>
            <div className="text-xs font-bold text-rush-gold">{ride.fare === 0 ? "FREE" : `₦${ride.fare}`}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
