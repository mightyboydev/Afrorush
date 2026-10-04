import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfroRush — African Street Racing",
  description:
    "AfroRush is a stylish, high-energy African street racing game. Ride your okada across vibrant African cities, build your crew, master the streets and become a legend.",
  keywords: [
    "AfroRush",
    "African game",
    "okada racing",
    "browser game",
    "Phaser 3",
    "Next.js",
    "street racing",
  ],
  authors: [{ name: "AfroRush" }],
  openGraph: {
    title: "AfroRush — African Street Racing",
    description:
      "Ride your okada across vibrant African cities. Build your crew, master the streets and become a legend.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroRush",
    description: "African street racing game.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#d2601a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
