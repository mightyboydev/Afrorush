"use client";

// src/components/PhoneScreen.tsx — Smartphone interface with app grid.
// Apps: Jobs, Messages, Bank, Crew, Leaderboard, Settings, Camera, Ride, Health, etc.

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { formatNaira, type PlayerProfile } from "@/lib/storage";
import {
  updateProfile,
  sendDm,
  searchPlayersByUsername,
  subscribeToDms,
  transferCash,
  subscribeToOnlinePlayers,
  takeMicroLoan,
  repayMicroLoan,
  pickpocket,
  reportToPolice,
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
  { id: "buka", label: "Buka", icon: "🍲", from: "#ff6a1a", to: "#c2410c" },
  { id: "quilox", label: "Quilox", icon: "🎉", from: "#7c3aed", to: "#5b21b6" },
  { id: "loan", label: "Loan", icon: "💸", from: "#ef4444", to: "#dc2626" },
  { id: "street", label: "Street", icon: "🚶", from: "#14213d", to: "#1e293b" },
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
          <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#7c3aed] to-[#f97316] p-4 text-white shadow-[0_8px_28px_rgba(22,32,60,0.4)]">
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
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-ink-soft">Apps</div>
          <div className="grid grid-cols-4 gap-2.5">
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => !app.locked && setOpenApp(app.id)}
                className="btn-press flex flex-col items-center gap-1.5"
              >
                <div className="relative">
                  <div
                    className="flex size-[58px] items-center justify-center text-[28px] leading-none shadow-lg"
                    style={{
                      borderRadius: "22%",
                      background: `linear-gradient(145deg, ${app.from}, ${app.to})`,
                      boxShadow:
                        "inset 0 1px rgba(255,255,255,0.3), 0 4px 12px -2px rgba(22,32,60,0.25)",
                    }}
                  >
                    {app.locked ? "🔒" : app.icon}
                  </div>
                  {app.badge && (
                    <span className="rush-pop absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rush-rose px-1 text-[9px] font-bold text-white">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="line-clamp-2 w-full text-center text-[11px] font-medium leading-[1.15] text-rush-ink">{app.label}</span>
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
  // Jobs app — earn Naira (drains stamina + raises hunger)
  if (appId === "jobs") {
    return <JobsApp profile={profile} onClose={onClose} app={app} />;
  }
  // Buka app — buy food to restore stamina + reduce hunger
  if (appId === "buka") {
    return <BukaApp profile={profile} onClose={onClose} app={app} />;
  }
  // Quilox app — nightlife, pay cover fee + buy drinks for street_cred
  if (appId === "quilox") {
    return <QuiloxApp profile={profile} onClose={onClose} app={app} />;
  }
  // Loan app — Lapo Babies take micro-loans, repay with interest
  if (appId === "loan") {
    return <LoanApp profile={profile} onClose={onClose} app={app} />;
  }
  // Street app — pickpocket + report other online players
  if (appId === "street") {
    return <StreetApp profile={profile} onClose={onClose} app={app} />;
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
      toast.success(`💸 Sent ₦${amt.toLocaleString()} to @${recipientName}!`);
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

// ---------- Jobs App (Lagos Life: drains stamina + raises hunger) ----------

function JobsApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Each job has stamina_cost (drains stamina) + hunger_gain (raises hunger)
  // Pay scales with how gruelling the work is.
  const jobs = [
    { id: "suya-seller", title: "Suya Seller", pay: 300, time: "3 min", emoji: "🍢", desc: "Sell suya at the junction", stamina: 10, hunger: 8 },
    { id: "okada-rider", title: "Okada Rider", pay: 500, time: "5 min", emoji: "🏍️", desc: "Carry passengers across the city", stamina: 15, hunger: 12 },
    { id: "phone-repair", title: "Phone Repairer", pay: 1000, time: "8 min", emoji: "📱", desc: "Fix screens and chargers", stamina: 12, hunger: 10 },
    { id: "delivery", title: "Delivery Boy", pay: 800, time: "10 min", emoji: "📦", desc: "Deliver packages on time", stamina: 20, hunger: 15 },
    { id: "danfo-driver", title: "Danfo Driver", pay: 1200, time: "15 min", emoji: "🚌", desc: "Drive the yellow bus route", stamina: 25, hunger: 18 },
    { id: "event-promoter", title: "Event Promoter", pay: 2000, time: "20 min", emoji: "📢", desc: "Promote owambe parties", stamina: 30, hunger: 20 },
    { id: "agbero", title: "Agbero (Tout)", pay: 1500, time: "10 min", emoji: "🧍", desc: "Collect danfo dues — risky but pays", stamina: 20, hunger: 15 },
    { id: "tech-hustler", title: "Tech Hustler", pay: 5000, time: "30 min", emoji: "💻", desc: "Remote dev work — clean money", stamina: 35, hunger: 8 },
  ];

  const currentStamina = profile.vitals?.stamina ?? 80;
  const currentHunger = profile.vitals?.hunger ?? 20;
  const isExhausted = currentStamina < 10;
  const isStarving = currentHunger > 90;

  const claimJob = async (job: typeof jobs[0]) => {
    if (busy) return;
    setError(null); setMessage(null);
    if (currentStamina < job.stamina) {
      setError(`You no get enough stamina (need ${job.stamina}, you get ${Math.round(currentStamina)}). Go Buka chop first!`);
      return;
    }
    if (isStarving) {
      setError("You dey starve! Go Buka chop before you fit work.");
      return;
    }
    setBusy(job.id);
    try {
      const { updateProfile } = await import("@/lib/firestore");
      // Apply: pay + drain stamina + raise hunger
      const newStamina = Math.max(0, currentStamina - job.stamina);
      const newHunger = Math.min(100, currentHunger + job.hunger);
      await updateProfile(profile.uid, {
        cash: profile.cash + job.pay,
        vitals: {
          stamina: newStamina,
          hunger: newHunger,
          street_cred: profile.vitals?.street_cred ?? 10,
        },
        vitalsUpdatedAt: Date.now(),
      });
      await refreshProfile();
      setMessage(`✓ You hustle as ${job.title}! +₦${job.pay.toLocaleString()} · -${job.stamina} stamina · +${job.hunger} hunger`);
      toast.success(`💼 Hustled ${job.title} for ₦${job.pay.toLocaleString()}!`);
    } catch (e) {
      setError((e as Error).message);
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

      {/* Vitals indicator */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className={`rounded-xl p-2 text-center ${isExhausted ? "bg-red-100" : "bg-white/70"}`}>
          <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Stamina</div>
          <div className={`text-sm font-bold ${isExhausted ? "text-red-600" : "text-rush-green"}`}>⚡ {Math.round(currentStamina)}</div>
        </div>
        <div className={`rounded-xl p-2 text-center ${isStarving ? "bg-red-100" : "bg-white/70"}`}>
          <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Hunger</div>
          <div className={`text-sm font-bold ${isStarving ? "text-red-600" : "text-rush-orange"}`}>🍽️ {Math.round(currentHunger)}</div>
        </div>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      <div className="space-y-2">
        {jobs.map((job) => {
          const cantWork = currentStamina < job.stamina || isStarving;
          return (
            <div key={job.id} className={`flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur ${cantWork ? "opacity-60" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{job.emoji}</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-rush-navy">{job.title}</div>
                <div className="text-[10px] text-rush-navy/50">{job.desc}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                  <span className="font-bold text-rush-gold">₦{job.pay.toLocaleString()}</span>
                  <span className="text-rush-navy/40">⚡-{job.stamina} · 🍽️+{job.hunger}</span>
                </div>
              </div>
              <button
                onClick={() => claimJob(job)}
                disabled={busy !== null || cantWork}
                className="rounded-lg bg-rush-green px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white active:scale-95 disabled:opacity-50"
              >
                {busy === job.id ? "Working…" : cantWork ? "Tired" : "Hustle"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Ride App (with agbero encounters on cheap rides) ----------

function RideApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Risk = chance of agbero encounter. Safe = BRT/Cab. Risky = Danfo/Keke.
  const rides = [
    { id: "trek", name: "Trek", emoji: "🚶", fare: 0, time: "Slow but free", risk: 0, staminaCost: 15 },
    { id: "danfo", name: "Danfo", emoji: "🚌", fare: 100, time: "Cheap but agbero fit show", risk: 0.30, staminaCost: 5 },
    { id: "keke", name: "Keke", emoji: "🛺", fare: 150, time: "Quick hop, small risk", risk: 0.15, staminaCost: 5 },
    { id: "okada", name: "Okada", emoji: "🏍️", fare: 250, time: "Fastest in traffic", risk: 0.05, staminaCost: 8 },
    { id: "brt", name: "BRT Bus", emoji: "🚍", fare: 350, time: "Safe + dedicated lane", risk: 0, staminaCost: 3 },
    { id: "cab", name: "Cab", emoji: "🚕", fare: 500, time: "Comfortable + AC", risk: 0, staminaCost: 0 },
  ];

  const travel = async (ride: typeof rides[0]) => {
    if (busy) return;
    setError(null); setMessage(null);
    if (ride.fare > profile.cash) { setError("Not enough cash for this ride"); return; }
    setBusy(ride.id);
    try {
      const { updateProfile } = await import("@/lib/firestore");
      let finalFare = ride.fare;
      let msg = `You hopped on ${ride.name}! Travelled across the city.`;

      // Agbero encounter on risky rides
      if (ride.risk > 0 && Math.random() < ride.risk) {
        const extortAmount = Math.min(profile.cash - ride.fare, 200 + Math.floor(Math.random() * 300));
        finalFare += extortAmount;
        msg = `🚨 Agbero catch you for ${ride.name}! Dem extort ₦${extortAmount} extra. Total cost: ₦${finalFare}. Next time, take BRT!`;
      }

      // Apply fare + stamina drain
      const newStamina = Math.max(0, (profile.vitals?.stamina ?? 80) - ride.staminaCost);
      await updateProfile(profile.uid, {
        cash: profile.cash - finalFare,
        vitals: {
          stamina: newStamina,
          hunger: profile.vitals?.hunger ?? 20,
          street_cred: profile.vitals?.street_cred ?? 10,
        },
        vitalsUpdatedAt: Date.now(),
      });
      await refreshProfile();
      setMessage(msg);
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(null); }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Ride</h2>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      <div className="space-y-2">
        {rides.map((ride) => (
          <button
            key={ride.id}
            onClick={() => travel(ride)}
            disabled={busy !== null}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur active:scale-95 disabled:opacity-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{ride.emoji}</div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rush-navy">{ride.name}</span>
                {ride.risk > 0 && <span className="rounded-full bg-rush-orange/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-rush-orange">⚠️ Risk</span>}
                {ride.risk === 0 && ride.fare > 0 && <span className="rounded-full bg-rush-green/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-rush-green">✓ Safe</span>}
              </div>
              <div className="text-[10px] text-rush-navy/50">{ride.time}</div>
              {ride.staminaCost > 0 && <div className="text-[9px] text-rush-navy/40">⚡-{ride.staminaCost} stamina</div>}
            </div>
            <div className="text-xs font-bold text-rush-gold">{ride.fare === 0 ? "FREE" : `₦${ride.fare}`}</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[9px] text-rush-navy/40">
        Danfo/Keke get agbero risk (extortion up to ₦500). BRT/Cab/Okada safe.
      </p>
    </div>
  );
}

// ---------- Buka App — Food Court (restores stamina + reduces hunger) ----------

function BukaApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const menu = [
    { id: "gala-pure-water", name: "Gala + Pure Water", emoji: "🥤", price: 50, stamina: 10, hunger: 15, desc: "Quick snack. Cheap fix." },
    { id: "suya-rice", name: "Suya + Rice", emoji: "🍢", price: 200, stamina: 25, hunger: 30, desc: "Spicy suya with jollof." },
    { id: "amala-shitta", name: "Amala Shitta", emoji: "🍲", price: 300, stamina: 40, hunger: 50, desc: "Smooth amala + ewedu. Big restoration!" },
    { id: "pounded-yam", name: "Pounded Yam + Egusi", emoji: "🥘", price: 500, stamina: 60, hunger: 70, desc: "Heavyweight. Full restoration." },
    { id: "pepper-soup", name: "Pepper Soup (Catfish)", emoji: "🐟", price: 800, stamina: 35, hunger: 30, desc: "Calms the soul + small street_cred boost." },
    { id: "small-chops", name: "Small Chops Platter", emoji: "🍤", price: 1000, stamina: 20, hunger: 15, desc: "Party snacks — for the flex." },
  ];

  const buy = async (item: typeof menu[0]) => {
    if (busy) return;
    setError(null); setMessage(null);
    if (profile.cash < item.price) { setError("You no get enough cash for this food."); return; }
    setBusy(item.id);
    try {
      const { updateProfile } = await import("@/lib/firestore");
      const newStamina = Math.min(100, (profile.vitals?.stamina ?? 80) + item.stamina);
      const newHunger = Math.max(0, (profile.vitals?.hunger ?? 20) - item.hunger);
      const credBoost = item.id === "pepper-soup" ? 3 : item.id === "small-chops" ? 5 : 0;
      const newCred = Math.min(100, (profile.vitals?.street_cred ?? 10) + credBoost);
      await updateProfile(profile.uid, {
        cash: profile.cash - item.price,
        vitals: { stamina: newStamina, hunger: newHunger, street_cred: newCred },
        vitalsUpdatedAt: Date.now(),
      });
      await refreshProfile();
      setMessage(`✓ You chop ${item.name}! +${item.stamina} stamina · -${item.hunger} hunger${credBoost ? ` · +${credBoost} street_cred` : ""}`);
      toast.success(`${item.emoji} Chopped ${item.name}! +${item.stamina} stamina`);
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(null); }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Buka</h2>
      </div>

      {/* Vitals */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/70 p-2 text-center">
          <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Stamina</div>
          <div className="text-sm font-bold text-rush-green">⚡ {Math.round(profile.vitals?.stamina ?? 80)}</div>
        </div>
        <div className="rounded-xl bg-white/70 p-2 text-center">
          <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Hunger</div>
          <div className="text-sm font-bold text-rush-orange">🍽️ {Math.round(profile.vitals?.hunger ?? 20)}</div>
        </div>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      <div className="space-y-2">
        {menu.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{item.emoji}</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-rush-navy">{item.name}</div>
              <div className="text-[10px] text-rush-navy/50">{item.desc}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                <span className="font-bold text-rush-gold">₦{item.price.toLocaleString()}</span>
                <span className="text-rush-navy/40">⚡+{item.stamina} · 🍽️-{item.hunger}</span>
              </div>
            </div>
            <button
              onClick={() => buy(item)}
              disabled={busy !== null || profile.cash < item.price}
              className="rounded-lg bg-rush-orange px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white active:scale-95 disabled:opacity-50"
            >
              {busy === item.id ? "Chopping…" : "Chop"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Quilox App — Nightlife (street_cred boost) ----------

function QuiloxApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inside, setInside] = useState(false);

  const COVER_FEE = 1000;

  const drinks = [
    { id: "star", name: "Star Beer", emoji: "🍺", price: 500, cred: 5 },
    { id: "hennessy", name: "Hennessy Shot", emoji: "🥃", price: 2000, cred: 15 },
    { id: "champagne", name: "Moët Bottle", emoji: "🍾", price: 15000, cred: 50 },
    { id: "hennesy-bottle", name: "Hennessy Bottle", emoji: "🥃", price: 25000, cred: 70 },
    { id: "azul", name: "Azul Bottle", emoji: "💙", price: 40000, cred: 90 },
  ];

  const payCover = async () => {
    if (busy) return;
    if (profile.cash < COVER_FEE) { setError(`Cover fee na ₦${COVER_FEE}. You no get enough.`); return; }
    setBusy("cover");
    try {
      const { updateProfile } = await import("@/lib/firestore");
      await updateProfile(profile.uid, { cash: profile.cash - COVER_FEE });
      await refreshProfile();
      setInside(true);
      setMessage("✓ You don enter Quilox! Order drinks to flex street_cred 🥂");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  const buyDrink = async (drink: typeof drinks[0]) => {
    if (busy) return;
    if (profile.cash < drink.price) { setError("You no get enough cash."); return; }
    setBusy(drink.id);
    try {
      const { updateProfile } = await import("@/lib/firestore");
      const newCred = Math.min(100, (profile.vitals?.street_cred ?? 10) + drink.cred);
      await updateProfile(profile.uid, {
        cash: profile.cash - drink.price,
        vitals: {
          stamina: profile.vitals?.stamina ?? 80,
          hunger: profile.vitals?.hunger ?? 20,
          street_cred: newCred,
        },
        vitalsUpdatedAt: Date.now(),
      });
      await refreshProfile();
      setMessage(`🥂 You pop ${drink.name}! +${drink.cred} street_cred. Total cred: ${newCred}`);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Quilox</h2>
      </div>

      {/* Premium dark gradient card */}
      <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#7c3aed] to-[#f97316] p-4 text-white shadow-[0_8px_28px_rgba(22,32,60,0.4)]">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">V/I Nightclub</div>
        <div className="font-display text-lg">🎉 AfroRush Quilox</div>
        <div className="mt-2 text-[10px] text-white/70">Street Cred: <span className="font-bold text-rush-gold">{Math.round(profile.vitals?.street_cred ?? 10)}/100</span></div>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      {!inside ? (
        <div className="rounded-2xl bg-white/80 p-4 text-center backdrop-blur">
          <div className="mb-2 text-4xl">🚪</div>
          <div className="text-sm font-bold text-rush-navy">Cover Fee: ₦{COVER_FEE.toLocaleString()}</div>
          <p className="mt-1 text-[10px] text-rush-navy/60">Pay make you enter. Inside, you fit buy drinks to boost your street_cred.</p>
          <button onClick={payCover} disabled={busy !== null} className="mt-3 w-full rounded-2xl bg-rush-purple px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50">
            {busy === "cover" ? "Paying…" : "Pay & Enter"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Drinks Menu</div>
          {drinks.map((drink) => (
            <div key={drink.id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{drink.emoji}</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-rush-navy">{drink.name}</div>
                <div className="text-[10px] text-rush-navy/50">+{drink.cred} street_cred</div>
                <div className="font-bold text-rush-gold">₦{drink.price.toLocaleString()}</div>
              </div>
              <button
                onClick={() => buyDrink(drink)}
                disabled={busy !== null || profile.cash < drink.price}
                className="rounded-lg bg-rush-purple px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white active:scale-95 disabled:opacity-50"
              >
                {busy === drink.id ? "Popping…" : "Pop"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Loan App — Micro-loan debt trap ----------

function LoanApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loanAmount, setLoanAmount] = useState("");

  const takeLoan = async () => {
    const amt = parseInt(loanAmount);
    if (!amt || amt <= 0) { setError("Enter amount (₦1 - ₦50,000)"); return; }
    setBusy("take"); setError(null); setMessage(null);
    try {
      const { takeMicroLoan } = await import("@/lib/firestore");
      await takeMicroLoan(profile, amt);
      await refreshProfile();
      setMessage(`✓ You don borrow ₦${amt.toLocaleString()}. Interest na 5% per hour. Pay quick before e grow!`);
      toast.success(`💸 Borrowed ₦${amt.toLocaleString()}. Pay quick!`);
      setLoanAmount("");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  const repay = async (amount: number) => {
    setBusy("repay"); setError(null); setMessage(null);
    try {
      const { repayMicroLoan } = await import("@/lib/firestore");
      await repayMicroLoan(profile, amount);
      await refreshProfile();
      setMessage(`✓ You don repay ₦${amount.toLocaleString()}.`);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  const loan = profile.activeLoan;

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Micro-Loan</h2>
      </div>

      {/* Loan status card */}
      <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 via-red-800 to-red-950 p-4 text-white shadow-xl">
        <div className="text-[10px] uppercase tracking-widest text-white/50">Lapo Micro-Finance</div>
        {loan ? (
          <>
            <div className="mt-1 font-display text-2xl">Owed: ₦{loan.totalOwed.toLocaleString()}</div>
            <div className="mt-1 text-[10px] text-white/70">Principal: ₦{loan.principal.toLocaleString()} · Interest: 5%/hr</div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => repay(Math.min(loan.totalOwed, profile.cash))}
                disabled={busy !== null || profile.cash <= 0}
                className="flex-1 rounded-xl bg-rush-green px-3 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
              >
                {busy === "repay" ? "Paying…" : `Repay ₦${Math.min(loan.totalOwed, profile.cash).toLocaleString()}`}
              </button>
              <button
                onClick={() => repay(loan.totalOwed)}
                disabled={busy !== null || profile.cash < loan.totalOwed}
                className="flex-1 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
              >
                Repay All
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-1 font-display text-lg text-white/90">No active loan ✓</div>
            <p className="mt-1 text-[10px] text-white/60">Borrow quick Naira when things tight. But interest na 5% per hour — pay quick!</p>
          </>
        )}
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      {/* Take new loan — only if no active loan */}
      {!loan && (
        <div className="rush-glass rounded-3xl p-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Take Loan</div>
          <div className="mb-2 flex gap-1.5">
            {[1000, 5000, 10000, 25000].map((a) => (
              <button key={a} onClick={() => setLoanAmount(String(a))} className="flex-1 rounded-lg bg-rush-cream/60 py-1.5 text-[10px] font-bold text-rush-navy active:scale-95">
                ₦{a >= 1000 ? `${a / 1000}k` : a}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="Amount (₦)"
            className="mb-2 w-full rounded-xl border border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy"
          />
          <button onClick={takeLoan} disabled={busy !== null} className="w-full rounded-xl bg-rush-orange px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50">
            {busy === "take" ? "Processing…" : "Borrow Now"}
          </button>
          <p className="mt-2 text-[9px] text-rush-navy/40">⚠️ Interest compounds at 5% per hour. Cash go auto-deduct as you earn. Borrow wisely!</p>
        </div>
      )}
    </div>
  );
}

// ---------- Street App — Pickpocket + Report other online players ----------

function StreetApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [players, setPlayers] = useState<Array<{ uid: string; username: string; crewTag: string | null; lastSeen: number; }>>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToOnlinePlayers((online) => {
      // Exclude self
      setPlayers(online.filter((p) => p.uid !== profile.uid));
    });
    return () => unsub();
  }, [profile.uid]);

  const isJailed = profile.jailedUntil && profile.jailedUntil > Date.now();

  const doPickpocket = async (targetUid: string, targetName: string) => {
    if (busy) return;
    setBusy(`pick-${targetUid}`);
    setError(null); setMessage(null);
    try {
      const { pickpocket } = await import("@/lib/firestore");
      const result = await pickpocket(profile, targetUid);
      setMessage(result.message);
      // If we got jailed, refresh profile
      if (!result.success) {
        await refreshProfile();
      }
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  const doReport = async (targetUid: string, targetName: string) => {
    if (busy) return;
    setBusy(`report-${targetUid}`);
    setError(null); setMessage(null);
    try {
      const { reportToPolice } = await import("@/lib/firestore");
      const result = await reportToPolice(profile, targetUid);
      setMessage(result.message);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Street</h2>
      </div>

      {isJailed && (
        <div className="mb-3 rounded-2xl bg-red-50 p-3 text-center">
          <div className="text-2xl">🚔</div>
          <div className="text-xs font-bold text-red-600">You dey inside cell!</div>
          <div className="text-[10px] text-red-600/80">{profile.jailedReason}</div>
          <div className="mt-1 text-[9px] text-red-600/60">Release in: {Math.ceil((profile.jailedUntil! - Date.now()) / 60000)} min</div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/70 p-2 text-center">
          <div className="text-[8px] uppercase tracking-wider text-rush-navy/50">Street Cred</div>
          <div className="text-sm font-bold text-rush-purple">💯 {Math.round(profile.vitals?.street_cred ?? 10)}</div>
        </div>
        <div className="rounded-xl bg-white/70 p-2 text-center">
          <div className="text-[8px] uppercase tracking-wider text-rush-navy/50">Cash</div>
          <div className="text-sm font-bold text-rush-gold">₦{profile.cash.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-white/70 p-2 text-center">
          <div className="text-[8px] uppercase tracking-wider text-rush-navy/50">Status</div>
          <div className="text-sm font-bold text-rush-navy">{isJailed ? "Jailed" : "Free"}</div>
        </div>
      </div>

      {message && <div className="mb-3 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Online Players ({players.length})</div>
      {players.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-4 text-center text-xs text-rush-navy/50">
          No other players online right now. Share your handle to bring friends!
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.uid} className="flex items-center gap-2 rounded-2xl bg-white/80 p-2.5 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rush-cream text-sm font-bold text-rush-navy">
                {p.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold text-rush-navy">@{p.username}</div>
                {p.crewTag && <div className="text-[9px] text-rush-navy/50">[{p.crewTag}]</div>}
              </div>
              <button
                onClick={() => doPickpocket(p.uid, p.username)}
                disabled={busy !== null || isJailed === true}
                className="rounded-lg bg-rush-orange px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white active:scale-95 disabled:opacity-50"
              >
                {busy === `pick-${p.uid}` ? "…" : "🤏 Rob"}
              </button>
              <button
                onClick={() => doReport(p.uid, p.username)}
                disabled={busy !== null}
                className="rounded-lg bg-rush-navy px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white active:scale-95 disabled:opacity-50"
              >
                {busy === `report-${p.uid}` ? "…" : "🚔 Report"}
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-[9px] text-rush-navy/40">
        Pickpocket success based on your street_cred vs target. Fail = 5 min jail. Report = jail target 10 min.
      </p>
    </div>
  );
}
