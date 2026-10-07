"use client";

// src/ui/icons.tsx — Custom AfroRush Kaduna SVG icons.
// Original line icons on a 24px grid, 2px stroke, round caps, currentColor.
// No Lucide, no emoji — these are the brand's own glyphs.
// Inspired by northern Nigerian geometric art (Hausa textile + leather patterns).

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 24): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

/* ---------- Navigation ---------- */

export function HomeIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function MapIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3z" />
      <path d="M9 4v13" />
      <path d="M15 7v13" />
    </svg>
  );
}

export function PhoneIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function BagIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M6 7h12l1 14H5L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

/* ---------- Money / Economy ---------- */

export function WalletIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 12h3" />
      <path d="M3 9h13" />
    </svg>
  );
}

export function PlusIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function NairaIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M7 4v16M7 4l10 16M17 4v16" />
      <path d="M5 9h12M5 13h12" />
    </svg>
  );
}

export function BankIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 9l9-5 9 5" />
      <path d="M4 9v9M20 9v9M8 9v9M12 9v9M16 9v9" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function LoanIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 10h4.5a2 2 0 0 1 0 4H9" />
    </svg>
  );
}

export function JobsIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

/* ---------- Survival ---------- */

export function BukaIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 11h16l-1 8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L4 11z" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M9 4l3 3 3-3" />
    </svg>
  );
}

export function ClubIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="8" r="4" />
      <circle cx="8" cy="14" r="4" />
      <circle cx="16" cy="14" r="4" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function StaminaIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
    </svg>
  );
}

export function HungerIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 11v2a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-2" />
      <path d="M7 11V8a2 2 0 0 1 4 0v3M13 11V8a2 2 0 0 1 4 0v3" />
    </svg>
  );
}

export function CredIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3l2.5 5 5.5.8-4 4 1 5.5-5-3-5 3 1-5.5-4-4 5.5-.8L12 3z" />
    </svg>
  );
}

/* ---------- Social ---------- */

export function ChatIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-5 4V5z" />
    </svg>
  );
}

export function CrewIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M14 20c0-2 1-3 3-3s4 1 4 3" />
    </svg>
  );
}

export function StreetIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v6M9 13l3 3 3-3M9 21l3-5 3 5" />
    </svg>
  );
}

export function RankIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
    </svg>
  );
}

/* ---------- Travel ---------- */

export function RideIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 17h18M5 17l2-7h10l2 7" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  );
}

export function OkadaIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="5.5" cy="17.5" r="3" />
      <circle cx="18.5" cy="17.5" r="3" />
      <path d="M5.5 17.5l5-9h4l4 9M10.5 8.5h4M14.5 8.5l-1-3M9 12h7" />
    </svg>
  );
}

/* ---------- Civic / Crime ---------- */

export function PoliceIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function CourtIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 21h18M5 21V10l7-5 7 5v11" />
      <path d="M9 21v-6h6v6" />
      <path d="M3 10L12 5l9 5" />
    </svg>
  );
}

export function VoteIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 11l3 3 5-6" />
    </svg>
  );
}

/* ---------- Events / Calendar ---------- */

export function CalendarIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StadiumIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <path d="M3 9c0-2 2-3 3-3M21 9c0-2-2-3-3-3M3 15c0 2 2 3 3 3M21 15c0 2-2 3-3 3" />
      <path d="M9 12h6" />
    </svg>
  );
}

export function BoatIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 14l9-9 9 9" />
      <path d="M3 14l1 4h16l1-4M12 5v9" />
      <path d="M5 21h14" />
    </svg>
  );
}

/* ---------- Media / Extras ---------- */

export function CameraIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 7l2-3h4l2 3" />
    </svg>
  );
}

export function GamesIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M7 12h3M8.5 10.5v3M14 11h.01M17 13h.01" />
    </svg>
  );
}

export function MusicIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

export function NewsIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M6 8h7M6 12h7M6 16h7M16 8h2M16 12h2M16 16h2" />
    </svg>
  );
}

export function SettingsIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </svg>
  );
}

export function MoreIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CloseIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} strokeWidth={2.5}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronRightIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SearchIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function SendIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function ShareIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

export function HeartIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 21s-9-6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z" />
    </svg>
  );
}

/* ---------- Need-specific icons ---------- */

export function FoodIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 8c0-2 1-3 2-3s2 1 2 3v8M8 8v8M12 5v11" />
      <path d="M3 16h10v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z" />
      <path d="M16 8c0-2 2-4 4-4v12c-2 0-4-2-4-4" />
    </svg>
  );
}

export function EnergyIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
    </svg>
  );
}

export function FunIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 12c0-5 4-9 9-9 2 0 3 0 4 1l-2 2-1 3 3 1 2-2c1 1 1 2 1 4 0 5-4 9-9 9s-9-4-9-9z" />
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SocialIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-5 4V5z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HygieneIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3v6" />
      <path d="M8 9h8v2a4 4 0 0 1-8 0V9z" />
      <path d="M10 15v6M14 15v6" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function ToiletIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M6 3h12v4H6z" />
      <path d="M7 7v6a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V7" />
      <path d="M9 17v4M15 17v4M7 21h10" />
    </svg>
  );
}

/* ---------- Place-specific icons ---------- */

export function GraduationCapIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M6 10v5c0 1 3 3 6 3s6-2 6-3v-5" />
      <path d="M22 8v5" />
    </svg>
  );
}

export function ChurchIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 2v4M10 4h4" />
      <path d="M5 22V10l7-4 7 4v12" />
      <path d="M9 22v-6h6v6" />
      <path d="M5 14h14" />
    </svg>
  );
}

export function MosqueIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 22V12c0-4 3-8 8-8s8 4 8 8v10" />
      <path d="M4 12h16" />
      <path d="M9 22v-4a3 3 0 0 1 6 0v4" />
      <path d="M12 4v2" />
    </svg>
  );
}

export function BridgeIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M2 16h20" />
      <path d="M2 16v4M22 16v4M6 16v4M18 16v4M10 16v4M14 16v4" />
      <path d="M2 12c4-4 8-4 10-4s6 0 10 4" />
    </svg>
  );
}

export function MonumentIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 2L4 22h16L12 2z" />
      <path d="M8 14h8" />
    </svg>
  );
}

export function HospitalIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="4" y="6" width="16" height="16" rx="1" />
      <path d="M12 10v8M8 14h8" />
    </svg>
  );
}

export function BuildingIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
      <path d="M10 21v-3h4v3" />
    </svg>
  );
}

export function LockIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M12 15v2" />
    </svg>
  );
}

export function StarIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3l2.5 5 5.5.8-4 4 1 5.5-5-3-5 3 1-5.5-4-4 5.5-.8L12 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- Shop item icons ---------- */

export function BikeIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-8h4l4 8M10 9l3-3M14 9V6" />
    </svg>
  );
}

export function ShirtIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M8 3l-5 4 2 3 3-2v13h12V8l3 2 2-3-5-4-3 2-3-2-3 2z" />
    </svg>
  );
}

export function HomeIcon2({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 12l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function BedIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 7v14M3 13h18v8M21 13v-2a4 4 0 0 0-4-4h-7v6" />
      <circle cx="7" cy="11" r="2" />
    </svg>
  );
}

export function FlameIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 2c1 3-1 5-2 6-1-1-1-3-1-3s-3 2-3 7a6 6 0 0 0 12 0c0-3-2-5-3-7-1 2-2 2-2 2s0-3-1-5z" />
    </svg>
  );
}

export function WaterIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z" />
    </svg>
  );
}

export function TvIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 4l4 4 4-4" />
    </svg>
  );
}

export function PlaneIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function CarIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 17h14M3 17l2-7h14l2 7v3h-3v-2H6v2H3v-3z" />
      <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- Category → Icon mapping ---------- */

export function getCategoryIcon(category: string): typeof HomeIcon {
  switch (category) {
    case "work": return BankIcon;
    case "social": return ClubIcon;
    case "justice": return CourtIcon;
    case "recreation": return StadiumIcon;
    case "market": return BagIcon;
    case "campus": return GraduationCapIcon;
    case "religious": return ChurchIcon;
    case "transport": return RideIcon;
    case "landmark": return BridgeIcon;
    default: return MapIcon;
  }
}

/* ---------- Hausa geometric decorative pattern (for card borders) ---------- */

export function HausaPattern({ width = 200, height = 8, ...p }: IconProps & { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      {...p}
    >
      <defs>
        <pattern id="ar-hausa" x="0" y="0" width="28" height={height} patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="8" height={height} fill="var(--ar-terracotta)" />
          <rect x="8" y="0" width="6" height={height} fill="var(--ar-gold)" />
          <rect x="14" y="0" width="8" height={height} fill="var(--ar-indigo)" />
          <rect x="22" y="0" width="6" height={height} fill="var(--ar-emerald)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={width} height={height} fill="url(#ar-hausa)" />
    </svg>
  );
}

/* ---------- Export icon map for easy lookup ---------- */

export const ICONS = {
  home: HomeIcon,
  map: MapIcon,
  phone: PhoneIcon,
  bag: BagIcon,
  wallet: WalletIcon,
  plus: PlusIcon,
  naira: NairaIcon,
  bank: BankIcon,
  loan: LoanIcon,
  jobs: JobsIcon,
  buka: BukaIcon,
  club: ClubIcon,
  stamina: StaminaIcon,
  energy: EnergyIcon,
  food: FoodIcon,
  hunger: HungerIcon,
  fun: FunIcon,
  cred: CredIcon,
  social: SocialIcon,
  hygiene: HygieneIcon,
  toilet: ToiletIcon,
  chat: ChatIcon,
  crew: CrewIcon,
  street: StreetIcon,
  rank: RankIcon,
  ride: RideIcon,
  okada: OkadaIcon,
  police: PoliceIcon,
  court: CourtIcon,
  vote: VoteIcon,
  calendar: CalendarIcon,
  stadium: StadiumIcon,
  boat: BoatIcon,
  camera: CameraIcon,
  games: GamesIcon,
  music: MusicIcon,
  news: NewsIcon,
  settings: SettingsIcon,
  more: MoreIcon,
  close: CloseIcon,
  chevronRight: ChevronRightIcon,
  search: SearchIcon,
  send: SendIcon,
  share: ShareIcon,
  heart: HeartIcon,
  // Place icons
  graduation: GraduationCapIcon,
  church: ChurchIcon,
  mosque: MosqueIcon,
  bridge: BridgeIcon,
  monument: MonumentIcon,
  hospital: HospitalIcon,
  building: BuildingIcon,
  lock: LockIcon,
  star: StarIcon,
  // Shop icons
  bike: BikeIcon,
  shirt: ShirtIcon,
  home2: HomeIcon2,
  bed: BedIcon,
  flame: FlameIcon,
  water: WaterIcon,
  tv: TvIcon,
  plane: PlaneIcon,
  car: CarIcon,
} as const;

export type IconName = keyof typeof ICONS;
