import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import InstallTabs from "@/components/InstallTabs";
import { APP_VERSION_LABEL } from "@/lib/appInfo";
import styles from "./install.module.css";

const SITE_URL = "https://vandanaapp.vercel.app";

export const metadata: Metadata = {
  title: "Install Vandana — Add to Home Screen",
  description:
    "Install Vandana as a PWA on iPhone, Android, or desktop. No App Store needed — open in browser, tap Add to Home Screen, and worship offline.",
  alternates: { canonical: `${SITE_URL}/install` },
  openGraph: {
    title: "Install Vandana — Add to Home Screen",
    description:
      "Step-by-step install guide for iOS Safari, Android Chrome, and desktop browsers. Free, offline-first Hindi worship lyrics app.",
    url: `${SITE_URL}/install`,
    images: [{ url: `${SITE_URL}/icons/og-image.png`, width: 1200, height: 630 }],
  },
};

const installSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I install Vandana on iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open vandanaapp.vercel.app in Safari. Tap the Share button, then tap Add to Home Screen, then tap Add. Vandana will appear on your home screen like a native app.",
      },
    },
    {
      "@type": "Question",
      name: "How do I install Vandana on Android?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open vandanaapp.vercel.app in Chrome. Tap the menu (three dots), then tap Add to Home screen, then tap Add. Vandana installs like a native app with no App Store required.",
      },
    },
    {
      "@type": "Question",
      name: "How do I install Vandana on desktop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open vandanaapp.vercel.app in Chrome or Edge. Click the install icon in the address bar and click Install. Vandana will open as a standalone desktop app.",
      },
    },
    {
      "@type": "Question",
      name: "Does Vandana work offline after installing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. After the first load, Vandana works without an internet connection. It caches songs locally so you can use it in church halls or basements with no signal.",
      },
    },
  ],
};

const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);

export default function InstallPage() {
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(installSchema) }}
    />
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden />

      {/* Topbar */}
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          Vandana
        </Link>
        <LandingNav />
      </header>

      {/* Hero */}
      <section className={styles.hero} id="main-content">
        <div className={styles.heroGlow} aria-hidden />
        <Image
          className={styles.appIcon}
          src="/icons/icon-512.png"
          alt="Vandana app icon"
          width={100}
          height={100}
          priority
        />
        <h1 className={styles.heroH1}>
          Add Vandana to
          <br />
          your <em>home screen</em>.
        </h1>
        <p className={styles.heroIntro}>
          Vandana is a Progressive Web App: no App Store, no Play Store, no
          download. It installs straight from the browser and lives next to your
          other apps. Once installed, it works offline.
        </p>
      </section>

      {/* Tabs + Steps (client component) */}
      <InstallTabs />

      {/* Open CTA */}
      <section className={styles.openCta}>
        <Link className={styles.ctaBtn} href="/app">
          Open Vandana now
          <ArrowRight />
        </Link>
        <p className={styles.ctaNote}>
          The browser will offer to install it when you&rsquo;re ready · {APP_VERSION_LABEL}
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2026 Vandana ·
        <Link className={styles.footerLink} href="/">
          Home
        </Link>{" "}
        ·
        <a
          className={styles.footerLink}
          href="https://github.com/TheAlgo7/vandana-worship-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        ·
        <Link className={styles.footerLink} href="/app">
          Open app
        </Link>
      </footer>
    </div>
    </>
  );
}
