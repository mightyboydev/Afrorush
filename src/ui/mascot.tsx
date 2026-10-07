"use client";

// src/ui/mascot.tsx — Original AfroRush mascot: a Kaduna okada rider.
// Hand-drawn SVG with Hausa cap (fulani style), helmet visor, leather jacket,
// riding an okada with a kente-pattern fuel tank. Layered for parallax.
// No 3D, no external assets — pure SVG so it never crashes.

import type { CSSProperties } from "react";

interface MascotProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * The full AfroRush mascot — rider on okada.
 * Sticker-style with thick outlines and Hausa color palette.
 */
export function OkadaMascot({ size = 200, className, style }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      className={className}
      style={style}
      aria-label="AfroRush okada rider mascot"
    >
      {/* Drop shadow ellipse (sun-baked ground shadow) */}
      <ellipse cx="120" cy="218" rx="80" ry="8" fill="rgba(122, 60, 20, 0.25)" />

      {/* OKADA BIKE */}
      {/* Rear wheel */}
      <circle cx="65" cy="195" r="26" fill="#2b1810" />
      <circle cx="65" cy="195" r="14" fill="#6b4f3f" />
      <circle cx="65" cy="195" r="5" fill="#d4a017" />
      {/* Front wheel */}
      <circle cx="180" cy="195" r="26" fill="#2b1810" />
      <circle cx="180" cy="195" r="14" fill="#6b4f3f" />
      <circle cx="180" cy="195" r="5" fill="#d4a017" />

      {/* Bike frame (terracotta) */}
      <path
        d="M65 195 L100 130 L160 130 L180 195"
        stroke="#9c5a26"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Fuel tank (kente-pattern: terracotta + gold + indigo) */}
      <path d="M100 130 Q120 110 160 130 L160 150 Q120 165 100 150 Z" fill="#c87f3f" stroke="#2b1810" strokeWidth="2" />
      <rect x="110" y="120" width="8" height="22" fill="#d4a017" />
      <rect x="125" y="118" width="6" height="26" fill="#1e3a8a" />
      <rect x="135" y="118" width="8" height="26" fill="#0d7c4a" />

      {/* Seat */}
      <path d="M95 130 L100 120 L150 120 L155 130 Z" fill="#2b1810" />
      {/* Handlebars */}
      <path d="M160 130 L175 105 M165 130 L185 110" stroke="#2b1810" strokeWidth="3" strokeLinecap="round" />
      {/* Headlight */}
      <circle cx="180" cy="115" r="6" fill="#f5d77a" stroke="#9c7510" strokeWidth="1.5" />

      {/* RIDER (sitting on seat, leaning forward) */}
      {/* Legs */}
      <path d="M105 130 L100 175 L92 175" stroke="#6b4f3f" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M140 130 L155 175 L163 175" stroke="#6b4f3f" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* Shoes */}
      <ellipse cx="88" cy="178" rx="10" ry="5" fill="#2b1810" />
      <ellipse cx="167" cy="178" rx="10" ry="5" fill="#2b1810" />

      {/* Torso (indigo jacket — Hausa textile) */}
      <path d="M110 130 Q100 105 110 85 L150 85 Q160 105 150 130 Z" fill="#1e3a8a" stroke="#2b1810" strokeWidth="2" />
      {/* Jacket pattern — Hausa geometric stripes */}
      <rect x="115" y="95" width="3" height="30" fill="#d4a017" />
      <rect x="125" y="92" width="3" height="33" fill="#0d7c4a" />
      <rect x="135" y="92" width="3" height="33" fill="#d4a017" />
      <rect x="145" y="95" width="3" height="30" fill="#0d7c4a" />

      {/* Arms (reaching forward to handlebars) */}
      <path d="M115 95 L155 110" stroke="#1e3a8a" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M145 95 L170 115" stroke="#1e3a8a" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Hands */}
      <circle cx="155" cy="112" r="5" fill="#8d5524" />
      <circle cx="172" cy="117" r="5" fill="#8d5524" />

      {/* Neck */}
      <rect x="125" y="78" width="10" height="12" fill="#8d5524" />

      {/* HEAD — skin tone #8d5524 (deep brown) */}
      <circle cx="130" cy="68" r="18" fill="#8d5524" stroke="#2b1810" strokeWidth="2" />

      {/* HAUSA CAP (red fulani-style) — the brand signature */}
      <path d="M112 60 Q130 38 148 60 L148 65 L112 65 Z" fill="#c8463d" stroke="#2b1810" strokeWidth="2" />
      {/* Cap band (white) */}
      <rect x="112" y="60" width="36" height="6" fill="#fffcf2" stroke="#2b1810" strokeWidth="1" />
      {/* Cap top button */}
      <circle cx="130" cy="42" r="3" fill="#d4a017" />

      {/* Sunglasses (gold-rimmed) */}
      <rect x="118" y="63" width="9" height="6" rx="1" fill="#2b1810" stroke="#d4a017" strokeWidth="1" />
      <rect x="133" y="63" width="9" height="6" rx="1" fill="#2b1810" stroke="#d4a017" strokeWidth="1" />
      <path d="M127 66h3" stroke="#d4a017" strokeWidth="1" />

      {/* Smile */}
      <path d="M124 76 Q130 80 136 76" stroke="#2b1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The harmattan hero scene — layered SVG with parallax depth.
 * Layers (back to front):
 *   1. Sky gradient (harmattan haze)
 *   2. Sun glow
 *   3. Drifting dust particles
 *   4. Distant skyline (silhouettes of Kaduna buildings: mosque dome + minaret)
 *   5. Midground: neem trees
 *   6. Foreground: okada mascot + ground
 */
export function HarmattanHero({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <svg
        viewBox="0 0 412 320"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* === Layer 1: Sky gradient (harmattan haze) === */}
        <defs>
          <linearGradient id="ar-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#faf3e0" />
            <stop offset="55%" stopColor="#f5ead0" />
            <stop offset="100%" stopColor="#ebd9b0" />
          </linearGradient>
          <radialGradient id="ar-sun" cx="0.75" cy="0.25" r="0.3">
            <stop offset="0%" stopColor="#fffbe8" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f5d77a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ar-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c87f3f" />
            <stop offset="100%" stopColor="#9c5a26" />
          </linearGradient>
        </defs>

        <rect width="412" height="320" fill="url(#ar-sky)" />

        {/* === Layer 2: Sun glow === */}
        <rect width="412" height="320" fill="url(#ar-sun)" />
        <circle cx="309" cy="80" r="34" fill="#fffbe8" opacity="0.95" />
        <circle cx="309" cy="80" r="28" fill="#f5d77a" opacity="0.6" />

        {/* === Layer 3: Drifting harmattan dust === */}
        <g className="ar-dust-drift" style={{ transformOrigin: "60px 60px" }}>
          {[...Array(8)].map((_, i) => (
            <circle
              key={i}
              cx={40 + i * 50}
              cy={50 + (i % 3) * 30}
              r={1 + (i % 3)}
              fill="#d4a017"
              opacity={0.3 + (i % 3) * 0.2}
            />
          ))}
        </g>
        <g className="ar-dust-drift" style={{ transformOrigin: "200px 120px", animationDelay: "2s" }}>
          {[...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={150 + i * 40}
              cy={110 + (i % 2) * 20}
              r={0.8 + (i % 2)}
              fill="#c87f3f"
              opacity={0.4}
            />
          ))}
        </g>

        {/* === Layer 4: Distant Kaduna skyline === */}
        <g opacity="0.55">
          {/* Mosque dome + minaret (left) */}
          <rect x="20" y="180" width="6" height="50" fill="#9c5a26" />
          <circle cx="23" cy="180" r="5" fill="#0d7c4a" />
          <path d="M40 230 L40 195 Q55 175 70 195 L70 230 Z" fill="#9c5a26" />
          <ellipse cx="55" cy="195" rx="15" ry="10" fill="#c87f3f" />
          <path d="M55 185 L55 175" stroke="#2b1810" strokeWidth="1.5" />
          <circle cx="55" cy="172" r="2.5" fill="#d4a017" />

          {/* Mid-rise buildings */}
          <rect x="90" y="200" width="40" height="30" fill="#9c5a26" opacity="0.8" />
          <rect x="100" y="208" width="6" height="6" fill="#d4a017" opacity="0.6" />
          <rect x="115" y="208" width="6" height="6" fill="#d4a017" opacity="0.6" />
          <rect x="100" y="220" width="6" height="6" fill="#d4a017" opacity="0.6" />
          <rect x="115" y="220" width="6" height="6" fill="#d4a017" opacity="0.6" />

          <rect x="140" y="190" width="35" height="40" fill="#6b4f3f" opacity="0.85" />
          {[...Array(4)].map((_, i) => (
            <rect key={i} x={145 + (i % 2) * 12} y={198 + Math.floor(i / 2) * 12} width="6" height="6" fill="#d4a017" opacity="0.6" />
          ))}

          {/* Communication mast (right) */}
          <rect x="200" y="160" width="3" height="70" fill="#2b1810" opacity="0.7" />
          <path d="M195 175 L208 175 M193 185 L210 185 M191 195 L212 195" stroke="#2b1810" strokeWidth="1" opacity="0.7" />

          {/* More buildings */}
          <rect x="220" y="200" width="50" height="30" fill="#9c5a26" opacity="0.8" />
          {[...Array(6)].map((_, i) => (
            <rect key={i} x={225 + (i % 3) * 14} y={206 + Math.floor(i / 3) * 12} width="8" height="6" fill="#d4a017" opacity="0.6" />
          ))}

          {/* Stadium silhouette (right) */}
          <ellipse cx="340" cy="220" rx="40" ry="14" fill="#6b4f3f" opacity="0.7" />
          <path d="M300 215 Q340 200 380 215" stroke="#9c5a26" strokeWidth="2" fill="none" opacity="0.7" />
        </g>

        {/* === Layer 5: Midground neem trees (with sway animation) === */}
        <g className="ar-sway" style={{ transformOrigin: "55px 240px" }}>
          {/* Neem tree 1 */}
          <rect x="53" y="240" width="4" height="40" fill="#6b4f3f" />
          <circle cx="55" cy="230" r="20" fill="#0d7c4a" />
          <circle cx="45" cy="225" r="14" fill="#07543a" />
          <circle cx="65" cy="225" r="14" fill="#0d7c4a" />
          <circle cx="55" cy="218" r="10" fill="#0d7c4a" />
        </g>
        <g className="ar-sway" style={{ transformOrigin: "365px 250px", animationDelay: "1.5s" }}>
          {/* Neem tree 2 */}
          <rect x="363" y="250" width="4" height="35" fill="#6b4f3f" />
          <circle cx="365" cy="240" r="18" fill="#0d7c4a" />
          <circle cx="357" cy="236" r="12" fill="#07543a" />
          <circle cx="373" cy="236" r="12" fill="#0d7c4a" />
        </g>

        {/* === Layer 6: Ground === */}
        <rect x="0" y="265" width="412" height="55" fill="url(#ar-ground)" />
        {/* Ground texture — sand specks */}
        {[...Array(40)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 412}
            cy={270 + (i * 13) % 45}
            r={(i % 3) * 0.5 + 0.5}
            fill="#2b1810"
            opacity={0.2 + (i % 3) * 0.1}
          />
        ))}

        {/* === Layer 7: Foreground mascot (okada rider) — anchored bottom-right === */}
        <g transform="translate(180, 70) scale(0.55)">
          <OkadaMascot size={240} />
        </g>

        {/* === Layer 8: Foreground decorative elements === */}
        {/* Suya grill smoke (left foreground) */}
        <g className="ar-steam" style={{ transformOrigin: "30px 270px" }}>
          <circle cx="30" cy="270" r="3" fill="#fffcf2" opacity="0.6" />
        </g>
        <g className="ar-steam" style={{ transformOrigin: "30px 270px", animationDelay: "0.7s" }}>
          <circle cx="35" cy="265" r="2.5" fill="#fffcf2" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Compact mascot head only — for use in headers, footers, loading states.
 */
export function MascotHead({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-label="AfroRush mascot"
    >
      {/* Head */}
      <circle cx="50" cy="55" r="28" fill="#8d5524" stroke="#2b1810" strokeWidth="2.5" />
      {/* Hausa cap (red fulani-style) */}
      <path d="M22 45 Q50 8 78 45 L78 53 L22 53 Z" fill="#c8463d" stroke="#2b1810" strokeWidth="2" />
      <rect x="22" y="45" width="56" height="9" fill="#fffcf2" stroke="#2b1810" strokeWidth="1" />
      <circle cx="50" cy="20" r="4" fill="#d4a017" />
      {/* Sunglasses */}
      <rect x="34" y="52" width="14" height="9" rx="1" fill="#2b1810" stroke="#d4a017" strokeWidth="1.5" />
      <rect x="52" y="52" width="14" height="9" rx="1" fill="#2b1810" stroke="#d4a017" strokeWidth="1.5" />
      <path d="M48 56h4" stroke="#d4a017" strokeWidth="1.5" />
      {/* Smile */}
      <path d="M40 70 Q50 76 60 70" stroke="#2b1810" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Loading mascot — bobbing head for the loading screen.
 */
export function LoadingMascot({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <div className="ar-bob" style={{ width: "100%", height: "100%" }}>
        <MascotHead size={size} />
      </div>
    </div>
  );
}
