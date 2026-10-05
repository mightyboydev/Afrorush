"use client";

// src/app/admin/users/page.tsx — user management with all admin actions.

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { formatNaira, levelFromRep, levelTitle } from "@/lib/storage";

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

export default function AdminUsers() {
  const { state } = useAuth();
  const user = state.user;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json() as { users: AdminUser[] };
      setUsers(data.users);
    }
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
        <UserDetailModal user={selected} onClose={() => setSelected(null)} onUpdated={fetchUsers} />
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose, onUpdated }: {
  user: AdminUser;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { state } = useAuth();
  const user2 = state.user;
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState<string | null>(null);

  const call = async (path: string, body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const t = await user2?.getIdToken();
      const res = await fetch(`/api/admin/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json() as { error: string };
        setError(data.error);
      } else {
        onUpdated();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
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
              <button disabled={busy} onClick={() => call("cash", { targetUid: user.uid, amount: parseInt(amount), reason })} className="rounded-lg bg-rush-green px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ Cash</button>
              <button disabled={busy} onClick={() => call("cash", { targetUid: user.uid, amount: -parseInt(amount), reason })} className="rounded-lg bg-rush-orange px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">− Cash</button>
              <button disabled={busy} onClick={() => call("gold", { targetUid: user.uid, amount: parseInt(amount), reason })} className="rounded-lg bg-rush-gold px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ Gold</button>
              <button disabled={busy} onClick={() => call("rep", { targetUid: user.uid, amount: parseInt(amount), reason })} className="rounded-lg bg-rush-jade px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">+ Rep</button>
            </div>
          </div>

          <div className="rounded-xl bg-rush-cream/30 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rush-navy/60">Moderation</div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy} onClick={() => call("warn", { targetUid: user.uid, reason: reason || "No reason" })} className="rounded-lg bg-rush-gold px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">⚠ Warn</button>
              <button disabled={busy} onClick={() => call("mute", { targetUid: user.uid, until: Date.now() + 24 * 3600 * 1000, reason: reason || "Muted 24h" })} className="rounded-lg bg-rush-purple px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">🔇 Mute 24h</button>
              <button disabled={busy} onClick={() => call("ban", { targetUid: user.uid, reason: reason || "Banned", expires: null })} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">🚫 Ban</button>
              <button disabled={busy} onClick={() => call("unban", { targetUid: user.uid })} className="rounded-lg bg-rush-green px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">✓ Unban</button>
              <button disabled={busy} onClick={() => call("clear-warnings", { targetUid: user.uid })} className="rounded-lg bg-rush-navy px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-50">Clear Warnings</button>
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
