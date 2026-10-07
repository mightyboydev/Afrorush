"use client";

// src/ui/kit.tsx — AfroRush shared UI kit on Kaduna "Harmattan Sun" tokens.
// Panel, Button, Pill, Avatar, Skeleton, Sheet, Toast wrapper, etc.
// All buttons have .btn-press fast transitions + 44px min tap targets.

import { forwardRef, useState, useEffect, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HausaPattern } from "./icons";

/* ---------------- Panel (glassmorphism card) ---------------- */
export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "dark";
  pill?: boolean;
  patternTop?: boolean;       // Hausa geometric pattern stripe at top
}
export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ variant = "glass", pill, patternTop, className, children, ...props }, ref) => {
    const variantClass =
      variant === "solid" ? "ar-card"
      : variant === "dark" ? "ar-panel-dark"
      : "ar-panel";
    return (
      <div
        ref={ref}
        className={cn(
          variantClass,
          pill ? "rounded-full" : "rounded-2xl",
          patternTop && "ar-pattern-top",
          className
        )}
        {...props}
      >
        {patternTop && (
          <HausaPattern width={200} height={4} className="absolute top-0 left-0 right-0 w-full rounded-t-2xl" />
        )}
        {children}
      </div>
    );
  }
);
Panel.displayName = "Panel";

/* ---------------- PrimaryButton (emerald CTA with glow) ---------------- */
export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  full?: boolean;
  variant?: "emerald" | "gold" | "terracotta";
}
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ size = "md", full, variant = "emerald", className, children, ...props }, ref) => {
    const variantClass =
      variant === "gold" ? "ar-btn-gold"
      : variant === "terracotta" ? "ar-btn-primary"  // fall back to emerald styling, override bg
      : "ar-btn-primary";
    const overrideStyle =
      variant === "terracotta"
        ? { background: "var(--ar-terracotta)", boxShadow: "inset 0 1px rgba(255,255,255,0.3), 0 6px 16px -4px rgba(200,127,63,0.55)" }
        : variant === "gold"
        ? undefined
        : undefined;
    const sizeClass =
      size === "sm" ? "h-10 px-4 text-xs"
      : size === "lg" ? "h-14 px-6 text-base"
      : "h-12 px-5 text-sm";
    return (
      <button
        ref={ref}
        style={overrideStyle}
        className={cn(
          "btn-press inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-wider",
          variantClass,
          sizeClass,
          full && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

/* ---------------- SecondaryButton (cream with subtle ring) ---------------- */
export const SecondaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ size = "md", full, className, children, ...props }, ref) => {
    const sizeClass =
      size === "sm" ? "h-10 px-4 text-xs"
      : size === "lg" ? "h-14 px-6 text-base"
      : "h-12 px-5 text-sm";
    return (
      <button
        ref={ref}
        className={cn(
          "ar-btn-secondary btn-press inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-wider",
          sizeClass,
          full && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SecondaryButton.displayName = "SecondaryButton";

/* ---------------- Pill (status chip) ---------------- */
export interface PillProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "emerald" | "gold" | "rose" | "indigo" | "terracotta";
}
export const Pill = forwardRef<HTMLDivElement, PillProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const variantClass =
      variant === "emerald" ? "text-rush-leaf-deep"
      : variant === "gold" ? "text-rush-amber-deep"
      : variant === "rose" ? "text-rush-rose"
      : variant === "indigo" ? "text-rush-lagoon"
      : variant === "terracotta" ? "text-rush-sunset"
      : "text-rush-ink";
    return (
      <div
        ref={ref}
        className={cn(
          "ar-pill inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tabular-nums",
          variantClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Pill.displayName = "Pill";

/* ---------------- IconButton (44x44 min tap target) ---------------- */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "md", className, children, ...props }, ref) => {
    const sizeClass =
      size === "sm" ? "h-9 w-9"
      : size === "lg" ? "h-12 w-12"
      : "h-11 w-11"; // 44px — minimum tap target
    return (
      <button
        ref={ref}
        className={cn(
          "btn-press inline-flex select-none items-center justify-center rounded-full bg-rush-paper/80 text-rush-ink backdrop-blur-md hover:bg-rush-mist active:scale-95",
          sizeClass,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

/* ---------------- Avatar (with online inset ring) ---------------- */
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  bgColor?: string;
}
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, fallback, size = "md", online, bgColor, className, style, ...props }, ref) => {
    const sizeClass =
      size === "sm" ? "h-7 w-7 text-[11px]"
      : size === "lg" ? "h-14 w-14 text-base"
      : "h-9 w-9 text-xs";
    return (
      <div
        ref={ref}
        className={cn("relative rounded-full bg-white p-0.5 shadow-md", className)}
        style={style}
        {...props}
      >
        <div
          className={cn("flex overflow-hidden rounded-full")}
          style={{
            width: "100%",
            height: "100%",
            background: bgColor ? bgColor : "linear-gradient(135deg, #faf3e0, #f5d77a)",
            boxShadow: online ? "rgb(13, 124, 74) 0px 0px 0px 3px inset" : undefined,
          }}
        >
          {src ? (
            <img src={src} alt={fallback ?? "avatar"} className="h-full w-full object-cover" />
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center font-bold text-white", sizeClass)}>
              {fallback?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

/* ---------------- Skeleton (shimmer placeholder) ---------------- */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
}
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "rect", width, height, className, style, ...props }, ref) => {
    const variantClass =
      variant === "text" ? "rounded-md"
      : variant === "circle" ? "rounded-full"
      : "rounded-2xl";
    return (
      <div
        ref={ref}
        className={cn("ar-skeleton", variantClass, className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

/* ---------------- Divider ---------------- */
export function Divider({ orientation = "vertical", className }: { orientation?: "vertical" | "horizontal"; className?: string }) {
  return (
    <div
      className={cn(
        "bg-rush-ink/10",
        orientation === "vertical" ? "h-5 w-px" : "h-px w-5",
        className
      )}
    />
  );
}

/* ---------------- SectionLabel ---------------- */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[10px] font-bold uppercase tracking-widest text-rush-ink-soft", className)}>
      {children}
    </div>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  icon,
  heading,
  subtext,
  children,
}: {
  icon: ReactNode;
  heading: string;
  subtext?: string;
  children?: ReactNode;
}) {
  return (
    <div className="ar-card ar-bounce-in flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-2 text-rush-terracotta" style={{ fontSize: 48 }}>{icon}</div>
      <div className="font-display text-lg text-rush-ink">{heading}</div>
      {subtext && <p className="mt-1 max-w-[280px] text-xs text-rush-ink-soft">{subtext}</p>}
      {children && <div className="mt-4 w-full">{children}</div>}
    </div>
  );
}

/* ---------------- BottomSheet (slides up from bottom) ---------------- */
export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-rush-ink/35 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="ar-panel ar-bounce-in mb-[max(env(safe-area-inset-bottom),12px)] w-full max-w-md rounded-t-3xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-rush-ink/15" />
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-rush-ink">{title}</h2>
            <button
              onClick={onClose}
              className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-rush-mist text-rush-ink active:scale-90"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------- AnimatedCounter (counts up to value) ---------------- */
export function AnimatedCounter({
  value,
  duration = 800,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}
