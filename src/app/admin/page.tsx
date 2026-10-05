"use client";

// src/app/admin/page.tsx — Overview dashboard (client-side, no env vars).

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchOverviewStats } from "@/lib/admin-client";

interface OverviewData {
  totalUsers: number;
  activeToday: number;
  onlineNow: number;
  totalCashInCirculation: number;
  totalGoldInCirculation: number;
  topRiders: Array<{ uid: string; username: string; rep: number; cash: number }>;
  recentLogs: Array<Record<string, unknown> & { id: string }>;
}

export default function AdminOverview() {
  const { state } = useAuth();
  const user = state.user;
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const stats = await fetchOverviewStats();
        if (!cancelled) setData(stats as OverviewData);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

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
