import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfroRush — African Street Culture + Racing",
  description:
    "AfroRush is African street culture with racing at the heart. Enter the motor park, ride your okada, build your crew and become a street legend.",
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
    title: "AfroRush — African Street Culture + Racing",
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
  themeColor: "#120716",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Rubik:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
