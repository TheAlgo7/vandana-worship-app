import type { Metadata } from "next";
import Link from "next/link";
import InstallTabs from "@/components/InstallTabs";
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
  },
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

const ChevronLeftIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function InstallPage() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden />

      {/* Topbar */}
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          Vandana<span className={styles.brandDev}>वंदना</span>
        </Link>
        <nav className={styles.topbarNav}>
          <Link className={styles.backLink} href="/">
            <ChevronLeftIcon />
            Back
          </Link>
          <Link className={styles.navCta} href="/app">
            Open app
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.appIcon}
          src="/icons/icon-192.png"
          alt="Vandana app icon"
        />
        <h1 className={styles.heroH1}>
          Add Vandana to
          <br />
          your <em>home screen</em>.
        </h1>
        <p className={styles.heroIntro}>
          Vandana is a Progressive Web App — no App Store, no Play Store, no
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
          The browser will offer to install it when you&rsquo;re ready · v2.5.0 Public Beta
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
  );
}
