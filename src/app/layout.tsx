import type { Metadata, Viewport } from "next";
import {
  Lora,
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
} from "next/font/google";
import Providers from "@/components/Providers";
import DesktopNav from "@/components/DesktopNav";
import "./globals.css";

const heading = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#0A0A0E",
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = "https://vandanaapp.vercel.app";
const SITE_DESCRIPTION =
  "Free Hindi and Hinglish Christian worship lyrics app for Indian churches. 80+ songs in Devanagari and Roman transliteration with presentation mode for worship teams. Built by The Algothrim.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vandana - Worship Lyrics",
    template: "%s | Vandana",
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icons/favicon-32.png"],
  },
  openGraph: {
    title: "Vandana - Hindi & Hinglish Worship Lyrics",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Vandana",
    images: [{ url: "/icons/og-image.png", width: 1200, height: 630 }],
    type: "website",
    locale: "hi_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vandana - Hindi & Hinglish Worship Lyrics",
    description: SITE_DESCRIPTION,
    images: ["/icons/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vandana",
  },
  verification: {
    google: "1JHrQVJdLIR24UtyhUbz-NrEH6FFmGKOTGBs1ULxO6o",
    other: { "msvalidate.01": "4E30504FDDA8C50529375865890F6A2D" },
  },
};

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Vandana",
      url: SITE_URL,
      description: "Hindi and Hinglish Christian worship lyrics for the Indian church",
      inLanguage: "hi-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapplication`,
      name: "Vandana",
      url: SITE_URL,
      applicationCategory: "MusicApplication",
      operatingSystem: "Any",
      description: SITE_DESCRIPTION,
      inLanguage: ["hi", "en-IN"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Algothrim",
      url: "https://thealgothrim.com",
      description:
        "Independent developer studio building Vandana, a free Hindi and Hinglish worship lyrics app for the Indian church.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${heading.variable} ${body.variable} ${devanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="app-frame">
          <DesktopNav />
          <main className="app-main">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
