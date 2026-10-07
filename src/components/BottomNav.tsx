"use client";

// src/components/BottomNav.tsx — 4-tab bottom navigation (Home, Map, Phone, Buy).
// Lagos Life-inspired: glassmorphism dock (rounded-[26px]) with Lucide SVG
// icons (instead of emoji), active state = solid dark bg + thicker icon stroke.

import { House, Map, Smartphone, ShoppingBag, type LucideIcon } from "lucide-react";

export type Tab = "home" | "map" | "phone" | "buy";

export interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  onlineCount?: number;
  unreadNotifications?: number;
}

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "map", label: "Map", icon: Map },
  { id: "phone", label: "Phone", icon: Smartphone },
  { id: "buy", label: "Buy", icon: ShoppingBag },
];

export default function BottomNav({ active, onChange, unreadNotifications = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5">
      <div className="rush-dock grid w-full max-w-md grid-cols-4 gap-1 p-1.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="btn-press relative flex h-13 flex-col items-center justify-center gap-0.5 rounded-[20px] transition-colors"
              style={{
                background: isActive ? "var(--color-rush-ink)" : "transparent",
                color: isActive ? "#ffffff" : "var(--color-rush-ink-soft)",
              }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Notification badge */}
              {tab.id === "phone" && unreadNotifications > 0 && (
                <span className="absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rush-rose px-1 text-[9px] font-bold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
              {/* Lucide icon — thicker stroke when active (2.4 vs 2) */}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.4 : 2}
                className="shrink-0"
              />
              {/* Label */}
              <span className="text-[11px] font-semibold tabular-nums">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
