"use client";

// src/components/BottomNav.tsx — 4-tab bottom navigation (Home, Map, Phone, Buy).
// Premium frosted-glass dock with active indicator.

export type Tab = "home" | "map" | "phone" | "buy";

export interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  onlineCount?: number;
  unreadNotifications?: number;
}

const TABS: { id: Tab; label: string; icon: string; activeColor: string }[] = [
  { id: "home", label: "Home", icon: "🏠", activeColor: "#1fb86f" },
  { id: "map", label: "Map", icon: "🗺️", activeColor: "#ff6a1a" },
  { id: "phone", label: "Phone", icon: "📱", activeColor: "#7c3aed" },
  { id: "buy", label: "Buy", icon: "🛍️", activeColor: "#c026d3" },
];

export default function BottomNav({ active, onChange, unreadNotifications = 0 }: BottomNavProps) {
  return (
    <nav className="rush-dock fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-1 flex-col items-center gap-0.5 pb-1.5 pt-1 transition-all"
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator bar */}
            <div
              className="absolute -top-0.5 h-1 rounded-full transition-all duration-200"
              style={{
                width: isActive ? 28 : 0,
                background: tab.activeColor,
                opacity: isActive ? 1 : 0,
              }}
            />
            {/* Icon */}
            <div
              className="flex h-9 w-9 items-center justify-center text-xl transition-all duration-200"
              style={{
                transform: isActive ? "translateY(-2px) scale(1.1)" : "scale(1)",
                filter: isActive ? "drop-shadow(0 2px 6px rgba(31, 184, 111, 0.4))" : "none",
              }}
            >
              {tab.icon}
            </div>
            {/* Label */}
            <span
              className="text-[9px] font-bold uppercase tracking-wider transition-colors"
              style={{ color: isActive ? tab.activeColor : "#14213d66" }}
            >
              {tab.label}
            </span>
            {/* Notification badge */}
            {tab.id === "phone" && unreadNotifications > 0 && (
              <span className="absolute right-[18%] top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rush-orange px-1 text-[8px] font-bold text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
