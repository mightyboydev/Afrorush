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
    "AfroRush is a free-to-play browser game blending a Lagos-life-style social simulator with multiplayer okada racing. Roll the birth dice (Nepo or Lapo), hustle jobs, eat at the Buka, hit Quilox nightclub, take micro-loans, pickpocket players, and race friends in real-time. Lagos · Kaduna · Abuja · Kano · Accra · Nairobi.",
  keywords: [
    "AfroRush",
    "African game",
    "Nigeria game",
    "Lagos game",
    "Kaduna game",
    "okada racing",
    "browser game",
    "multiplayer racing",
    "life simulator",
    "Lagos Life",
    "free to play",
    "React Three Fiber",
    "Next.js",
    "Firebase",
  ],
  authors: [{ name: "AfroRush" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/afrorush-logo.jpg",
    apple: "/afrorush-logo.jpg",
  },
  openGraph: {
    title: "AfroRush — African Street Life Simulator & Multiplayer Racing",
    description:
      "Free-to-play browser game. Roll the Nepo/Lapo birth dice, hustle jobs, eat at the Buka, race friends in real-time multiplayer rooms. Lagos · Kaduna · Abuja. Built with Next.js + Firebase.",
    type: "website",
    siteName: "AfroRush",
    url: "https://afrorush.vercel.app",
    images: [
      {
        url: "/afrorush-logo.jpg",
        width: 512,
        height: 512,
        alt: "AfroRush — African Street Racing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroRush — African Street Racing",
    description:
      "Free-to-play browser game. Hustle, race, build a crew, become a Street Legend. Lagos · Kaduna · Abuja.",
    images: ["/afrorush-logo.jpg"],
  },
  alternates: {
    canonical: "https://afrorush.vercel.app",
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

// JSON-LD structured data — helps Google + AI crawlers understand the site.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "AfroRush",
  description:
    "A free-to-play browser game blending a Lagos-life-style social simulator with multiplayer okada racing. Roll the birth dice, hustle jobs, eat at the Buka, take micro-loans, and race friends in real-time.",
  applicationCategory: "Game",
  gamePlatform: "Web Browser",
  operatingSystem: "Any (web-based)",
  genre: ["Life Simulator", "Racing", "Multiplayer"],
  url: "https://afrorush.vercel.app",
  image: "https://afrorush.vercel.app/afrorush-logo.jpg",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "Free to play in browser — no download required.",
  },
  publisher: {
    "@type": "Organization",
    name: "AfroRush",
    url: "https://afrorush.vercel.app",
  },
  inLanguage: "en",
  keywords: "AfroRush, African game, okada, Lagos, Kaduna, multiplayer racing, life simulator",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data for crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${bungee.variable} ${jakarta.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <CookieConsent />

        {/* noscript fallback — shown when JavaScript is disabled OR when an
            AI crawler fetches the HTML without executing JS. Describes the
            game in plain HTML so the site is never "just a loading screen". */}
        <noscript>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "linear-gradient(180deg, #b3e5fc 0%, #fff8e7 60%, #fff8e7 100%)",
              color: "#14213d",
              padding: "20px",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              overflow: "auto",
              zIndex: 9999,
            }}
          >
            <div style={{ maxWidth: 480, margin: "0 auto" }}>
              <img
                src="/afrorush-logo.jpg"
                alt="AfroRush"
                width={96}
                height={96}
                style={{
                  borderRadius: 16,
                  border: "4px solid white",
                  boxShadow: "0 8px 24px rgba(20,33,61,0.15)",
                  margin: "0 auto 16px",
                }}
              />
              <h1
                style={{
                  fontSize: 40,
                  margin: "0 0 8px",
                  letterSpacing: 1,
                  fontWeight: 800,
                }}
              >
                Afro<span style={{ color: "#1fb86f" }}>Rush</span>
              </h1>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#1fb86f",
                  margin: "0 0 16px",
                }}
              >
                African Street Racing
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#14213d99" }}>
                A free-to-play browser game that blends a Lagos-life-style
                social simulator with multiplayer okada racing. Roll the
                birth-class dice, hustle jobs, eat at the Buka, take
                micro-loans, pickpocket other players, and race friends in
                real-time multiplayer rooms.
              </p>
              <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 8 }}>
                Key features
              </h2>
              <ul
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  textAlign: "left",
                  paddingLeft: 20,
                  color: "#14213dcc",
                }}
              >
                <li>🎲 Birth class roll — 30% Nepo Baby (5M cash), 70% Lapo Baby (0 cash)</li>
                <li>💼 8 jobs: Suya Seller, Okada Rider, Agbero, Tech Hustler (₦300–₦5,000)</li>
                <li>💸 Micro-loans at 5% interest per hour (compounds)</li>
                <li>📅 Saturday bills: ₦3,000 rent + electricity auto-deducted</li>
                <li>🍲 Buka (Food Court): 6 dishes from Gala to Pounded Yam</li>
                <li>🎉 Quilox Nightlife — buy drinks for street_cred boost</li>
                <li>🚌 Transport with agbero extortion encounters</li>
                <li>🚶 P2P Street — pickpocket + report other online players</li>
                <li>🏦 Real peer-to-peer cash transfer (with DM notification)</li>
                <li>💬 Real direct messages between players (Firestore)</li>
                <li>🏁 Serverless multiplayer racing (room codes + canvas sync)</li>
                <li>🏆 Share score to WhatsApp / X (viral handle-share loop)</li>
                <li>🏙️ Multiple cities: Lagos, Kaduna, Abuja, Kano, Accra, Nairobi</li>
              </ul>
              <p
                style={{
                  marginTop: 24,
                  fontSize: 12,
                  color: "#14213d99",
                }}
              >
                This page requires JavaScript to play. Please enable JavaScript
                in your browser, or read the{" "}
                <a
                  href="/about"
                  style={{
                    color: "#1fb86f",
                    fontWeight: 700,
                    textDecoration: "underline",
                  }}
                >
                  full About page
                </a>{" "}
                for a static description of the game.
              </p>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#14213d66",
                }}
              >
                Built with Next.js · React Three Fiber · Firebase
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}
