"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

// Lagos Life-inspired toaster: glassmorphism panel + tabular-nums + brand colors.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "!panel !rush-glass !rounded-2xl !text-rush-ink !font-semibold",
          title: "!font-bold",
          description: "!text-rush-ink-soft",
          success: "!text-rush-leaf-deep",
          error: "!text-rush-rose",
          actionButton: "!bg-rush-leaf !text-white",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(255,255,255,0.97)",
          "--normal-text": "#1d2433",
          "--normal-border": "rgba(255,255,255,0.7)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
