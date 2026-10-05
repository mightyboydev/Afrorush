import type { Metadata, Viewport } from "next";
import { Bungee, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afrorush.vercel.app"),
  title: "AfroRush — 3D African Street World",
  description:
    "AfroRush is a loud, alive 3D open-world adventure set in a vibrant African city. Walk, ride an okada, take missions, hang out with other players, join crews and race. Become a Street Legend.",
  keywords: [
    "AfroRush",
    "3D game",
    "African game",
    "okada",
    "open world",
    "browser game",
    "react-three-fiber",
    "Next.js",
  ],
  authors: [{ name: "AfroRush" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/afrorush-logo.jpg",
    apple: "/afrorush-logo.jpg",
  },
  openGraph: {
    title: "AfroRush — 3D African Street World",
    description:
      "Ride okada, take missions, build a crew, and become a Street Legend in a vibrant 3D African city.",
    type: "website",
    images: [{ url: "/afrorush-logo.jpg", width: 512, height: 512, alt: "AfroRush" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroRush",
    description: "A loud, alive 3D open-world adventure in a vibrant African city.",
    images: ["/afrorush-logo.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1fb86f",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bungee.variable} ${jakarta.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
