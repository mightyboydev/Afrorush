"use client";

// src/components/PhoneScreen.tsx — Smartphone interface with app grid.
// Apps: Jobs, Messages, Bank, Crew, Leaderboard, Settings, Camera, Ride, Health, etc.

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { formatNaira, type PlayerProfile } from "@/lib/storage";
import { updateProfile } from "@/lib/firestore";

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
      {/* Phone status bar */}
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-rush-navy px-4 py-2 text-white">
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
          {/* Wallet card — cleaner premium look */}
          <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-rush-navy via-rush-purple to-rush-navy p-4 text-white shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">AfroRush Wallet</span>
              <span className="rounded-full bg-rush-green/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rush-green">Active</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/50">Cash Balance</div>
                <div className="font-display text-3xl">{formatNaira(profile.cash)}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-white/50">Gold</div>
                <div className="font-display text-xl text-rush-gold">🪙 {profile.gold}</div>
              </div>
            </div>
            {/* Mini stat bar */}
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-2">
              <div className="flex-1 text-center">
                <div className="text-[8px] uppercase tracking-wider text-white/40">Rep</div>
                <div className="text-xs font-bold text-rush-jade">{profile.rep.toLocaleString()}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[8px] uppercase tracking-wider text-white/40">Runs</div>
                <div className="text-xs font-bold text-white">{profile.totalRuns}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[8px] uppercase tracking-wider text-white/40">Crew</div>
                <div className="text-xs font-bold text-white">{profile.crewTag ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* App grid — cleaner with labels */}
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rush-navy/50">Apps</div>
          <div className="grid grid-cols-4 gap-3">
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => !app.locked && setOpenApp(app.id)}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                <div className="relative">
                  <div
                    className="rush-squircle flex h-14 w-14 items-center justify-center text-2xl"
                    style={{ "--icon-from": app.from, "--icon-to": app.to } as React.CSSProperties}
                  >
                    {app.locked ? "🔒" : app.icon}
                  </div>
                  {app.badge && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rush-orange px-1 text-[10px] font-bold text-white">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-rush-navy">{app.label}</span>
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

// ---------- Bank App — Send Money ----------

function BankApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const { refreshProfile } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMoney = async () => {
    setError(null); setMessage(null);
    const amt = parseInt(amount);
    if (!recipient.trim() || !amt || amt <= 0) { setError("Enter a name and amount"); return; }
    if (amt > profile.cash) { setError("Not enough cash"); return; }
    setBusy(true);
    try {
      // Deduct from sender
      await updateProfile(profile.uid, { cash: profile.cash - amt });
      await refreshProfile();
      setMessage(`Sent ₦${amt.toLocaleString()} to ${recipient.trim()}!`);
      setRecipient(""); setAmount("");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

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

      {/* Send money */}
      <div className="rush-glass rounded-3xl p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Send Money</div>
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient name" className="mb-2 w-full rounded-xl border border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy" />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₦)" className="mb-2 w-full rounded-xl border border-rush-cream bg-white px-3 py-2.5 text-sm text-rush-navy" />
        <button onClick={sendMoney} disabled={busy} className="w-full rounded-xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50">
          {busy ? "Sending…" : "Send Money"}
        </button>
        {message && <div className="mt-2 rounded-xl bg-rush-green/10 px-3 py-2 text-xs text-rush-green">{message}</div>}
        {error && <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
      </div>

      {/* Quick actions */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/80 p-3 text-center">
          <div className="text-lg">📥</div>
          <div className="text-[9px] font-bold uppercase text-rush-navy/60">Request</div>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 text-center">
          <div className="text-lg">📊</div>
          <div className="text-[9px] font-bold uppercase text-rush-navy/60">History</div>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 text-center">
          <div className="text-lg">💵</div>
          <div className="text-[9px] font-bold uppercase text-rush-navy/60">Top Up</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Messages App — Texting ----------

interface ChatMsg { from: string; text: string; time: string; }

function MessagesApp({ profile, onClose, app }: { profile: PlayerProfile; onClose: () => void; app: App }) {
  const [view, setView] = useState<"list" | "chat">("list");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");

  // Mock contacts
  const contacts = [
    { name: "Crew Chat", emoji: "👥", last: "Yo, who's racing tonight?", time: "2m", unread: 3 },
    { name: "Baba Tunde", emoji: "🧑", last: "Suya spot is open!", time: "5m", unread: 1 },
    { name: "Kelechi", emoji: "🧑", last: "Challenge accepted! 🏁", time: "1h", unread: 0 },
    { name: "Mama Chichi", emoji: "👩", last: "New Ankara just arrived", time: "3h", unread: 0 },
    { name: "Street Radio", emoji: "📻", last: "Now playing: Afrobeats mix", time: "1d", unread: 0 },
  ];

  const openChat = (name: string) => {
    setSelectedChat(name);
    setView("chat");
    setMessages([
      { from: name, text: contacts.find(c => c.name === name)?.last ?? "Hello!", time: "now" },
    ]);
  };

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "me", text: input.trim(), time: "now" }]);
    setInput("");
    // Auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { from: selectedChat ?? "Unknown", text: "Got it! 👍", time: "now" }]);
    }, 1500);
  };

  if (view === "chat" && selectedChat) {
    return (
      <div className="rush-bounce-in">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => setView("list")} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl bg-rush-jade/20">{contacts.find(c => c.name === selectedChat)?.emoji ?? "💬"}</div>
          <h2 className="font-display text-lg text-rush-navy">{selectedChat}</h2>
        </div>

        {/* Chat messages */}
        <div className="min-h-[300px] space-y-2 rounded-3xl bg-white/60 p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.from === "me" ? "bg-rush-green text-white" : "bg-white text-rush-navy"}`}>
                {msg.text}
                <div className={`mt-0.5 text-[8px] ${msg.from === "me" ? "text-white/60" : "text-rush-navy/40"}`}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-rush-cream bg-white px-4 py-2.5 text-sm text-rush-navy"
          />
          <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-rush-green text-white active:scale-95">
            ➤
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rush-bounce-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rush-navy backdrop-blur">←</button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${app.from}, ${app.to})` }}>{app.icon}</div>
        <h2 className="font-display text-xl text-rush-navy">Messages</h2>
      </div>

      {/* Chat list */}
      <div className="space-y-2">
        {contacts.map((c) => (
          <button key={c.name} onClick={() => openChat(c.name)} className="flex w-full items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur active:scale-95">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rush-cream text-xl">{c.emoji}</div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-rush-navy">{c.name}</span>
                <span className="text-[10px] text-rush-navy/40">{c.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-rush-navy/60">{c.last}</span>
                {c.unread > 0 && <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rush-green px-1 text-[10px] font-bold text-white">{c.unread}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
