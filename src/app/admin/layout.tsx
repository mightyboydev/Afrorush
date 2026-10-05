"use client";

// src/app/admin/layout.tsx — admin auth gate. Non-admins see 404.
// Uses the admins collection (checked client-side) + hard-coded owner UID.
// No env vars needed.

import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

type Role = "owner" | "admin" | "moderator" | "loading" | "none";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const { user, loading } = state;
  const [role, setRole] = useState<Role>("loading");

  useEffect(() => {
    // Hard-coded owner UID — always has access
    if (user && user.uid === "1rf7yswl35QuUyfdQehMs1qdlIy2") {
      setRole("owner");
      return;
    }
    if (!user) {
      setRole("none");
      return;
    }
    const db = getFirebaseDb();
    const unsub = onSnapshot(
      doc(db, "admins", user.uid),
      (snap) => {
        if (snap.exists()) {
          const r = snap.data()?.role as string;
          if (r === "owner" || r === "admin" || r === "moderator") setRole(r as Role);
          else setRole("none");
        } else {
          setRole("none");
        }
      },
      () => setRole("none")
    );
    return () => unsub();
  }, [user]);

  if (loading || role === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rush-navy text-white">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-rush-gold border-t-transparent" />
          <div className="text-sm uppercase tracking-widest">Checking admin access…</div>
        </div>
      </div>
    );
  }

  if (!user || role === "none") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rush-navy text-white">
        <div className="text-center">
          <div className="mb-3 text-5xl">🚫</div>
          <h1 className="font-display text-2xl">404 — Page Not Found</h1>
          <p className="mt-2 text-sm text-white/50">You don&apos;t have access to this page.</p>
          <a href="/" className="mt-4 inline-block rounded-xl bg-rush-green px-6 py-2 text-sm font-bold uppercase tracking-wider text-white">
            Back to Game
          </a>
        </div>
      </div>
    );
  }

  return <AdminShell role={role}>{children}</AdminShell>;
}

function AdminShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const [nav, setNav] = useState("overview");
  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "crews", label: "Crews", icon: "🛡️" },
    { id: "economy", label: "Economy", icon: "💰" },
    { id: "events", label: "Events", icon: "🎉" },
    { id: "reports", label: "Reports", icon: "🚨" },
    { id: "logs", label: "Logs", icon: "📜" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-rush-cream">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-rush-navy px-4 py-3 text-white safe-pt">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <span className="font-display text-lg">AfroRush Admin</span>
          <span className="ml-2 rounded-full bg-rush-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {role}
          </span>
        </div>
        <a href="/" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
          ← Back to Game
        </a>
      </header>

      <nav className="no-scrollbar fixed bottom-0 left-0 right-0 z-30 flex gap-1 overflow-x-auto bg-white px-2 py-2 rush-soft-shadow safe-pb">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setNav(item.id)}
            className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              nav === item.id ? "bg-rush-green text-white" : "text-rush-navy/60"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-24 pt-4">
        {nav === "overview" && <AdminOverview />}
        {nav === "users" && <AdminUsers />}
        {nav === "crews" && <Placeholder name="Crews" desc="Rename, change color, disband, transfer ownership." />}
        {nav === "economy" && <Placeholder name="Economy & Catalog" desc="Edit prices, add items, promo codes." />}
        {nav === "events" && <Placeholder name="Events & Announcements" desc="Create world events, push announcements." />}
        {nav === "reports" && <Placeholder name="Reports & Moderation" desc="Reported players and messages queue." />}
        {nav === "logs" && <Placeholder name="Audit Logs" desc="Every admin action is logged here." />}
        {nav === "settings" && <Placeholder name="Settings" desc="Maintenance mode, toggles, admin list." />}
      </div>
    </div>
  );
}

function AdminOverview() {
  return <AdminOverviewContent />;
}

function AdminOverviewContent() {
  const [data, setData] = useState<ReturnType<typeof fetchOverviewStats> extends Promise<infer T> ? T | null : null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stats = await fetchOverviewStats();
        if (!cancelled) { setData(stats); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError((e as Error).message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="text-center text-sm text-rush-navy/50">Loading overview…</div>;
  if (error) return <div className="text-center text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-rush-navy">Overview</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Total Users" value={data.totalUsers} icon="👥" />
        <StatCard label="Active Today" value={data.activeToday} icon="🔥" />
        <StatCard label="Online Now" value={data.onlineNow} icon="🟢" />
        <StatCard label="Total Cash" value={`₦${data.totalCashInCirculation.toLocaleString()}`} icon="💵" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <StatCard label="Total Gold" value={data.totalGoldInCirculation.toLocaleString()} icon="🪙" />
        <StatCard label="Top Rider Rep" value={data.topRiders[0]?.rep.toLocaleString() ?? 0} icon="🏆" />
      </div>
      <div className="rush-card p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-rush-navy/50">Top 5 Riders</div>
        <div className="space-y-2">
          {data.topRiders.map((r, i) => (
            <div key={r.uid} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rush-cream text-xs font-bold">{i + 1}</span>
                <span className="text-sm font-bold text-rush-navy">{r.username}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-rush-jade">{r.rep.toLocaleString()} rep</span>
                <span className="text-rush-gold">₦{r.cash.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rush-card p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-rush-navy/50">Recent Admin Actions</div>
        {data.recentLogs.length === 0 ? (
          <div className="text-xs text-rush-navy/50">No actions yet</div>
        ) : (
          <div className="space-y-2">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg bg-rush-cream/50 px-3 py-2">
                <span className="text-xs font-bold text-rush-navy">{String(log.action ?? "—")}</span>
                <span className="text-[10px] text-rush-navy/40">
                  {new Date(log.timestamp as number).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rush-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-rush-navy/50">{label}</div>
          <div className="font-display text-base text-rush-navy">{value}</div>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  return <AdminUsersContent />;
}

function AdminUsersContent() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-rush-navy">Users</h1>
      <p className="text-sm text-rush-navy/60">
        Full user management lives at <code className="rounded bg-rush-cream px-1">/admin/users</code>.
      </p>
      <a href="/admin/users" className="inline-block rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
        Open User Management →
      </a>
    </div>
  );
}

function Placeholder({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-rush-navy">{name}</h1>
      <div className="rush-card p-6 text-center text-sm text-rush-navy/50">
        {desc}
        <br />Full UI coming in the next build.
      </div>
    </div>
  );
}
