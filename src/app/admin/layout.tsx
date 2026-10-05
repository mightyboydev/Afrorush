"use client";

// src/app/admin/layout.tsx — Admin auth gate + shell with 8 sections.
// Uses client-side Firestore (no env vars). Owner UID hard-coded.

import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { doc, onSnapshot, collection, getDocs, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  fetchOverviewStats,
  fetchAllUsers,
  adjustCash,
  adjustGold,
  adjustRep,
  warnUser,
  muteUser,
  banUser,
  unbanUser,
  clearWarnings,
} from "@/lib/admin-client";
import { formatNaira, levelFromRep, levelTitle } from "@/lib/storage";

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
  const { user, profile, loading } = state;
  const [role, setRole] = useState<Role>("loading");

  useEffect(() => {
    // Hard-coded owner UID — always has access
    if (user && user.uid === "1rf7yswl35QuUyfdQehMs1qdlIy2") {
      setRole("owner");
      return;
    }
    if (!user) { setRole("none"); return; }
    // Check profile.role === "admin"
    if (profile && profile.role === "admin") {
      setRole("admin");
      return;
    }
    // Fallback: check admins collection
    if (user) {
      const db = getFirebaseDb();
      const unsub = onSnapshot(
        doc(db, "admins", user.uid),
        (snap) => {
          if (snap.exists()) {
            const r = snap.data()?.role as string;
            if (r === "owner" || r === "admin" || r === "moderator") setRole(r as Role);
            else setRole("none");
          } else setRole("none");
        },
        () => setRole("none")
      );
      return () => unsub();
    }
    setRole("none");
  }, [user, profile]);

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

// ---------- Admin Shell ----------

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
          ← Game
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
        {nav === "crews" && <AdminCrews />}
        {nav === "economy" && <Placeholder name="Economy & Catalog" desc="Edit prices, add items, promo codes." />}
        {nav === "events" && <Placeholder name="Events & Announcements" desc="Create world events, push announcements." />}
        {nav === "reports" && <Placeholder name="Reports & Moderation" desc="Reported players and messages queue." />}
        {nav === "logs" && <Placeholder name="Audit Logs" desc="Every admin action is logged here." />}
        {nav === "settings" && <Placeholder name="Settings" desc="Maintenance mode, toggles, admin list." />}
      </div>
    </div>
  );
}

// ---------- Overview ----------

interface OverviewData {
  totalUsers: number;
  activeToday: number;
  onlineNow: number;
  totalCashInCirculation: number;
  totalGoldInCirculation: number;
  topRiders: Array<{ uid: string; username: string; rep: number; cash: number }>;
  recentLogs: Array<Record<string, unknown> & { id: string }>;
}

function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stats = await fetchOverviewStats();
        if (!cancelled) { setData(stats as OverviewData); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError((e as Error).message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="text-center text-sm text-rush-navy/50">Loading overview…</div>;
  if (error) return <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>;
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
          {data.topRiders.length === 0 ? (
            <div className="text-xs text-rush-navy/50">No riders yet</div>
          ) : (
            data.topRiders.map((r, i) => (
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
            ))
          )}
        </div>
      </div>

      {/* Recent signups */}
      <RecentSignups />
    </div>
  );
}

// Recent signups table
function RecentSignups() {
  const [users, setUsers] = useState<Array<{ uid: string; username: string; email: string | null; createdAt: number; role: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchAllUsers();
        if (cancelled) return;
        // Sort by createdAt desc, take 5
        const recent = (all as Array<Record<string, unknown>>)
          .map((u) => ({
            uid: u.uid as string,
            username: String(u.username ?? "Unknown"),
            email: (u.email as string) ?? null,
            createdAt: (u.createdAt as number) ?? 0,
            role: String(u.role ?? "player"),
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5);
        if (!cancelled) { setUsers(recent); setLoading(false); }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rush-card p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-rush-navy/50">Recent Signups</div>
      {loading ? (
        <div className="text-xs text-rush-navy/50">Loading…</div>
      ) : users.length === 0 ? (
        <div className="text-xs text-rush-navy/50">No signups yet</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.uid} className="flex items-center justify-between rounded-lg bg-rush-cream/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rush-green text-[10px] font-bold text-white">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-rush-navy">{u.username}</div>
                  <div className="text-[10px] text-rush-navy/50">{u.email ?? "No email"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-rush-navy/40">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : "—"}
                </div>
                {u.role === "admin" && (
                  <span className="rounded bg-rush-gold/20 px-1 text-[9px] font-bold uppercase text-rush-gold">ADMIN</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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

// ---------- Users ----------

interface AdminUser {
  uid: string;
  username: string;
  email: string | null;
  cash: number;
  gold: number;
  rep: number;
  warnings: number;
  banned: boolean;
  banReason: string | null;
  mutedUntil: number | null;
  lastSeen: number;
  crewName: string | null;
}

function AdminUsers() {
  const { state } = useAuth();
  const user = state.user;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    if (!user) return;
    try {
      const result = await fetchAllUsers(search);
      setUsers(result as AdminUser[]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [search, user]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-rush-navy">Users</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, email, or UID…"
        className="w-full rounded-2xl border-2 border-rush-cream bg-white px-4 py-3 text-sm text-rush-navy placeholder:text-rush-navy/40 focus:border-rush-green focus:outline-none"
      />
      {loading ? (
        <div className="text-center text-sm text-rush-navy/50">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="text-center text-sm text-rush-navy/50">No users found</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <button key={u.uid} onClick={() => setSelected(u)} className="rush-card w-full p-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rush-cream text-sm font-bold text-rush-navy">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-rush-navy">{u.username}</div>
                    <div className="text-[10px] text-rush-navy/50">{u.email ?? "No email"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {u.banned && <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-600">BANNED</span>}
                  {u.warnings > 0 && <span className="rounded bg-rush-gold/20 px-1.5 py-0.5 font-bold text-rush-gold">{u.warnings}⚠</span>}
                  <span className="text-rush-gold">{formatNaira(u.cash)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <UserDetailModal user={selected} actorUid={user?.uid ?? ""} onClose={() => setSelected(null)} onUpdated={fetchUsers} />
      )}
    </div>
  );
}

function UserDetailModal({ user, actorUid, onClose, onUpdated }: {
  user: AdminUser;
  actorUid: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState<string | null>(null);

  const call = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await fn(); onUpdated(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const lvl = levelFromRep(user.rep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rush-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-display text-lg text-rush-navy">{user.username}</div>
            <div className="text-[10px] uppercase tracking-wider text-rush-navy/50">
              {levelTitle(lvl)} · Lvl {lvl} · {user.warnings} warnings
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-cream">✕</button>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-rush-cream/50 p-2 text-center">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Cash</div>
            <div className="text-xs font-bold text-rush-gold">{formatNaira(user.cash)}</div>
          </div>
          <div className="rounded-xl bg-rush-cream/50 p-2 text-center">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Gold</div>
            <div className="text-xs font-bold text-rush-gold">{user.gold}</div>
          </div>
          <div className="rounded-xl bg-rush-cream/50 p-2 text-center">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Rep</div>
            <div className="text-xs font-bold text-rush-jade">{user.rep}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-rush-cream/30 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Balance Actions</div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-2 w-full rounded-lg border border-rush-cream px-3 py-2 text-sm" />
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" className="mb-2 w-full rounded-lg border border-rush-cream px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy} onClick={() => call(() => adjustCash(actorUid, "admin", user.uid, parseInt(amount), reason || "No reason"))} className="rounded-lg bg-rush-green px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ Cash</button>
              <button disabled={busy} onClick={() => call(() => adjustCash(actorUid, "admin", user.uid, -parseInt(amount), reason || "No reason"))} className="rounded-lg bg-rush-orange px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">− Cash</button>
              <button disabled={busy} onClick={() => call(() => adjustGold(actorUid, "admin", user.uid, parseInt(amount), reason || "No reason"))} className="rounded-lg bg-rush-gold px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ Gold</button>
              <button disabled={busy} onClick={() => call(() => adjustRep(actorUid, "admin", user.uid, parseInt(amount), reason || "No reason"))} className="rounded-lg bg-rush-jade px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ Rep</button>
            </div>
          </div>
          <div className="rounded-xl bg-rush-cream/30 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Moderation</div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy} onClick={() => call(() => warnUser(actorUid, "admin", user.uid, reason || "No reason"))} className="rounded-lg bg-rush-gold px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">⚠ Warn</button>
              <button disabled={busy} onClick={() => call(() => muteUser(actorUid, "admin", user.uid, Date.now() + 24 * 3600 * 1000, reason || "Muted 24h"))} className="rounded-lg bg-rush-purple px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">🔇 Mute 24h</button>
              <button disabled={busy} onClick={() => call(() => banUser(actorUid, "admin", user.uid, reason || "Banned", null))} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">🚫 Ban</button>
              <button disabled={busy} onClick={() => call(() => unbanUser(actorUid, "admin", user.uid))} className="rounded-lg bg-rush-green px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">✓ Unban</button>
              <button disabled={busy} onClick={() => call(() => clearWarnings(actorUid, "admin", user.uid))} className="rounded-lg bg-rush-navy px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">Clear Warnings</button>
            </div>
          </div>

          {/* Role management */}
          <div className="rounded-xl bg-rush-cream/30 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Role</div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy} onClick={() => call(async () => {
                const db = getFirebaseDb();
                await updateDoc(doc(db, "users", user.uid), { role: "admin" });
              })} className="rounded-lg bg-rush-purple px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">
                👑 Make Admin
              </button>
              <button disabled={busy} onClick={() => call(async () => {
                const db = getFirebaseDb();
                await updateDoc(doc(db, "users", user.uid), { role: "player" });
              })} className="rounded-lg bg-rush-navy px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">
                Demote to Player
              </button>
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- Crews (full management UI) ----------

interface AdminCrew {
  id: string;
  name: string;
  tag: string;
  color: string;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  totalRep: number;
  createdAt: number;
}

function AdminCrews() {
  const [crews, setCrews] = useState<AdminCrew[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminCrew | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCrews = async () => {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collection(db, "crews"));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as AdminCrew[];
      list.sort((a, b) => (b.totalRep ?? 0) - (a.totalRep ?? 0));
      setCrews(list);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCrews(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-rush-navy">Crews</h1>
      <div className="flex items-center gap-2 text-xs text-rush-navy/60">
        <span className="rounded-full bg-rush-cream px-3 py-1 font-bold">{crews.length} crews</span>
        <button onClick={fetchCrews} className="rounded-full bg-white px-3 py-1 font-bold">↻ Refresh</button>
      </div>
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div className="text-center text-sm text-rush-navy/50">Loading crews…</div>
      ) : crews.length === 0 ? (
        <div className="text-center text-sm text-rush-navy/50">No crews yet</div>
      ) : (
        <div className="space-y-2">
          {crews.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className="rush-card w-full p-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full" style={{ background: c.color }} />
                  <div>
                    <div className="text-sm font-bold text-rush-navy">{c.name}</div>
                    <div className="text-[10px] text-rush-navy/50">[{c.tag}] · {c.memberCount} members · Owner: {c.ownerName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-rush-jade">{(c.totalRep ?? 0).toLocaleString()}</div>
                  <div className="text-[9px] uppercase tracking-wider text-rush-navy/40">rep</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <CrewDetailModal crew={selected} onClose={() => setSelected(null)} onUpdated={fetchCrews} />
      )}
    </div>
  );
}

function CrewDetailModal({ crew, onClose, onUpdated }: {
  crew: AdminCrew;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(crew.name);
  const [tag, setTag] = useState(crew.tag);
  const [color, setColor] = useState(crew.color);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDisband, setConfirmDisband] = useState(false);

  const save = async () => {
    setBusy(true); setError(null);
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "crews", crew.id), {
        name: name.trim() || crew.name,
        tag: tag.toUpperCase().slice(0, 3) || crew.tag,
        color,
      });
      onUpdated();
      onClose();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const addRep = async (amount: number) => {
    setBusy(true); setError(null);
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "crews", crew.id), { totalRep: increment(amount) });
      onUpdated();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const disband = async () => {
    setBusy(true); setError(null);
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "crews", crew.id));
      onUpdated();
      onClose();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rush-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full" style={{ background: color }} />
            <div className="font-display text-lg text-rush-navy">{crew.name}</div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-rush-cream">✕</button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-rush-cream/50 p-2 text-center">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Members</div>
            <div className="font-bold text-rush-navy">{crew.memberCount}</div>
          </div>
          <div className="rounded-xl bg-rush-cream/50 p-2 text-center">
            <div className="text-[9px] uppercase tracking-wider text-rush-navy/50">Total Rep</div>
            <div className="font-bold text-rush-jade">{(crew.totalRep ?? 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-rush-cream/30 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Edit Details</div>
            <label className="mb-1 block text-[10px] text-rush-navy/50">Crew Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mb-2 w-full rounded-lg border border-rush-cream px-3 py-2 text-sm" />
            <label className="mb-1 block text-[10px] text-rush-navy/50">Tag (3 chars)</label>
            <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} maxLength={3} className="mb-2 w-full rounded-lg border border-rush-cream px-3 py-2 text-sm uppercase" />
            <label className="mb-1 block text-[10px] text-rush-navy/50">Color</label>
            <div className="flex gap-2">
              {["#d2601a", "#1f9d55", "#f2c531", "#16a3b1", "#7c3aed", "#e94f37", "#ec4899", "#0ea5e9"].map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-rush-navy scale-110" : "border-white"}`}
                  style={{ background: c }} />
              ))}
            </div>
            <button disabled={busy} onClick={save} className="mt-3 w-full rounded-lg bg-rush-green px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>

          <div className="rounded-xl bg-rush-cream/30 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Rep</div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy} onClick={() => addRep(100)} className="rounded-lg bg-rush-jade px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ 100 Rep</button>
              <button disabled={busy} onClick={() => addRep(-100)} className="rounded-lg bg-rush-orange px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">− 100 Rep</button>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-600">Danger Zone</div>
            {!confirmDisband ? (
              <button onClick={() => setConfirmDisband(true)} className="w-full rounded-lg bg-red-500 px-3 py-2 text-xs font-bold uppercase text-white">
                🗑️ Disband Crew
              </button>
            ) : (
              <div>
                <p className="mb-2 text-xs text-red-600">Are you sure? This permanently deletes the crew.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDisband(false)} className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold uppercase text-rush-navy">Cancel</button>
                  <button disabled={busy} onClick={disband} className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">
                    {busy ? "Disbanding…" : "Confirm Disband"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- Placeholder ----------

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

// Placeholder section helpers end
