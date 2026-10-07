"use client";

// src/components/ui/kit.tsx — AfroRush shared UI kit.
// Lagos Life-inspired primitives built on the new design tokens.
// All buttons have .btn-press fast transitions + 44px min tap targets.

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Panel (glassmorphism card) ---------------- */
export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "dark";
  pill?: boolean;
}
export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ variant = "glass", pill, className, ...props }, ref) => {
    const variantClass =
      variant === "solid" ? "rush-card"
      : variant === "dark" ? "rush-glass-dark"
      : "panel rush-glass";
    return (
      <div
        ref={ref}
        className={cn(variantClass, pill && "rounded-full", !pill && "rounded-2xl", className)}
        {...props}
      />
    );
  }
);
Panel.displayName = "Panel";

/* ---------------- PrimaryButton (green CTA with glow) ---------------- */
export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  full?: boolean;
}
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ size = "md", full, className, children, ...props }, ref) => {
    const sizeClass =
      size === "sm" ? "h-10 px-4 text-xs"
      : size === "lg" ? "h-14 px-6 text-base"
      : "h-12 px-5 text-sm";
    return (
      <button
        ref={ref}
        className={cn(
          "rush-btn-primary btn-press inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-wider",
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

/* ---------------- SecondaryButton (white with subtle ring) ---------------- */
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
          "rush-btn-secondary btn-press inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-wider",
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

/* ---------------- Pill (status chip — online count, money, time) ---------------- */
export interface PillProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "leaf" | "amber" | "rose" | "lagoon";
}
export const Pill = forwardRef<HTMLDivElement, PillProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const variantClass =
      variant === "leaf" ? "text-rush-leaf-deep"
      : variant === "amber" ? "text-rush-amber-deep"
      : variant === "rose" ? "text-rush-rose"
      : variant === "lagoon" ? "text-rush-lagoon"
      : "text-rush-ink";
    return (
      <div
        ref={ref}
        className={cn(
          "rush-glass-pill inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tabular-nums",
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
          "btn-press inline-flex select-none items-center justify-center rounded-full bg-white/80 text-rush-ink backdrop-blur-md hover:bg-rush-mist active:scale-95",
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
  fallback?: string; // first letter(s) to show
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
            background: bgColor
              ? bgColor
              : "linear-gradient(135deg, #eaf2ff, #d7e5fb)",
            boxShadow: online ? "rgb(34, 197, 94) 0px 0px 0px 3px inset" : undefined,
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
        className={cn("rush-skeleton", variantClass, className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

/* ---------------- Divider (vertical or horizontal line) ---------------- */
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

/* ---------------- SectionLabel (uppercase micro caption) ---------------- */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[10px] font-bold uppercase tracking-widest text-rush-ink-soft", className)}>
      {children}
    </div>
  );
}

/* ---------------- EmptyState (icon + heading + subtext + optional CTA) ---------------- */
export function EmptyState({
  icon,
  heading,
  subtext,
  children,
}: {
  icon: string;
  heading: string;
  subtext?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rush-card rush-bounce-in flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-2 text-5xl">{icon}</div>
      <div className="font-display text-lg text-rush-ink">{heading}</div>
      {subtext && <p className="mt-1 max-w-[280px] text-xs text-rush-ink-soft">{subtext}</p>}
      {children && <div className="mt-4 w-full">{children}</div>}
    </div>
  );
}
