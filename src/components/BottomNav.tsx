"use client";

// src/components/BottomNav.tsx — 4-tab bottom navigation.
// Harmattan Sun styling: glassmorphism dock (rounded-3xl) with custom
// AfroRush SVG icons (HomeIcon, MapIcon, PhoneIcon, BagIcon).
// Active state = solid indigo bg + thicker icon stroke.

import { HomeIcon, MapIcon, PhoneIcon, BagIcon } from "@/ui/icons";

export type Tab = "home" | "map" | "phone" | "buy";

export interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  onlineCount?: number;
  unreadNotifications?: number;
}

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "map", label: "Map", Icon: MapIcon },
  { id: "phone", label: "Phone", Icon: PhoneIcon },
  { id: "buy", label: "Buy", Icon: BagIcon },
];

export default function BottomNav({ active, onChange, unreadNotifications = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5">
      <div className="rush-dock grid w-full max-w-md grid-cols-4 gap-1 p-1.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="btn-press relative flex h-13 flex-col items-center justify-center gap-0.5 rounded-[20px] transition-colors"
              style={{
                background: isActive ? "var(--ar-indigo-deep)" : "transparent",
                color: isActive ? "#ffffff" : "var(--ar-ink-soft)",
              }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.id === "phone" && unreadNotifications > 0 && (
                <span className="ar-pop absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rush-rose px-1 text-[9px] font-bold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              <span className="text-[10px] font-semibold tabular-nums">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
