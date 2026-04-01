import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
} from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "600", "700"],
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
});

export const viewport: Viewport = {
  themeColor: "#9A6F20",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Vandana – Worship Lyrics",
    template: "%s | Vandana",
  },
  description:
    "Browse worship song lyrics in Hindi and Hinglish. Present lyrics full-screen during church worship.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vandana",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${devanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
