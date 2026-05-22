import type { Metadata } from "next";
import Link from "next/link";
import LandingTagline from "@/components/LandingTagline";
import styles from "./page.module.css";

const SITE_URL = "https://vandanaapp.vercel.app";
const DESC =
  "A reverent, dark-first worship lyrics app for Hindi-speaking Christians. 80+ songs in Hinglish and Devanagari. Free, offline-first, no tracking. By ICM New Delhi.";

export const metadata: Metadata = {
  title: "Vandana — Worship in your language",
  description: DESC,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Vandana — Hindi & Hinglish Worship Lyrics",
    description: DESC,
    url: SITE_URL,
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

const PhoneIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const StarSVG = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={className}
    aria-hidden
  >
    <path
      d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"
      stroke="var(--accent)"
      strokeWidth="1"
      fill="none"
    />
  </svg>
);

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden />

      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <a className={styles.brand} href="/">
          Vandana<span className={styles.brandDev}>वंदना</span>
        </a>
        <nav className={styles.topbarNav}>
          <a
            className={styles.navMinor}
            href="https://github.com/TheAlgo7/vandana-worship-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a className={styles.navMinor} href="#about">
            About
          </a>
          <Link className={styles.navCta} href="/app">
            Open app
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />

        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          <span>
            <b>v2.5.0 Public Beta</b> · 80+ songs · Hindi · Hinglish · offline
          </span>
        </div>

        <h1 className={styles.wordmark}>
          Vandana<span className={styles.wordmarkDev}>वंदना</span>
        </h1>

        <div className={styles.taglineWrap}>
          <LandingTagline />
        </div>

        <p className={styles.subline}>
          A reverent, dark-first lyrics app for Hindi-speaking worshippers.
          Every song in both Devanagari and Hinglish. Built for dim rooms, late
          prayers, and Sunday mornings without WiFi.
        </p>

        <div className={styles.ctas}>
          <Link className={styles.btnPrimary} href="/app">
            Open the app
            <ArrowRight />
          </Link>
          <Link className={styles.btnGhost} href="/install">
            <PhoneIcon />
            Install on phone
          </Link>
        </div>

        <div className={styles.platformHint}>
          <StarSVG size={11} />
          <Link href="/install" className={styles.platformHintLink}>
            Add to Home Screen — iOS, Android, Desktop
          </Link>
        </div>
      </section>

      {/* ── Bilingual ── */}
      <section className={styles.section} id="about">
        <p className={styles.sectionLabel}>Two scripts. One worship.</p>
        <h2 className={styles.sectionH2}>
          However you read,
          <br />
          worship sounds the same.
        </h2>
        <p className={styles.lede}>
          Hinglish for the generation that grew up on Roman script. Devanagari
          for those who learned to read in Hindi. Both are first-class. Both are
          authored together. One tap to switch.
        </p>

        <div className={styles.bilingual}>
          <div className={`${styles.bilingualCol} ${styles.bilingualLatin}`}>
            <div className={styles.bilingualTag}>Hinglish</div>
            <div className={styles.bilingualLine}>
              &ldquo;Yeshu mahima
              <br />
              Teri mahima&rdquo;
            </div>
          </div>
          <div className={styles.bilingualDivider} aria-hidden />
          <div className={`${styles.bilingualCol} ${styles.bilingualHindi}`}>
            <div className={styles.bilingualTag}>हिंदी</div>
            <div className={styles.bilingualLine}>
              &ldquo;येशु महिमा
              <br />
              तेरी महिमा&rdquo;
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <p className={styles.sectionLabel}>Built for actual worship</p>
        <h2 className={styles.sectionH2}>
          Not a generic app
          <br />
          with a worship skin.
        </h2>

        <div className={styles.pillars}>
          <div className={styles.pillar}>
            <div className={styles.pillarGlyph}>Aa</div>
            <h3 className={styles.pillarH3}>Readable</h3>
            <p className={styles.pillarP}>
              Lora, Plus Jakarta Sans, Noto Sans Devanagari at sizes a worship
              leader can read on a phone in low light. Three discrete font
              sizes, persisted.
            </p>
          </div>
          <div className={styles.pillar}>
            <div className={styles.pillarGlyph}>☰</div>
            <h3 className={styles.pillarH3}>Setlist</h3>
            <p className={styles.pillarP}>
              Build tonight&rsquo;s flow. Add songs from the library in order,
              then hit <em>Present setlist</em> when the band starts. Skip ahead
              with one tap.
            </p>
          </div>
          <div className={styles.pillar}>
            <div className={styles.pillarGlyph}>▸</div>
            <h3 className={styles.pillarH3}>Present mode</h3>
            <p className={styles.pillarP}>
              Full-screen, block-by-block lyrics for projection. Switch
              languages live, scroll on auto. Worship leaders project from
              phones — we built for that.
            </p>
          </div>
          <div className={styles.pillar}>
            <div className={styles.pillarGlyph}>∅</div>
            <h3 className={styles.pillarH3}>Offline-first</h3>
            <p className={styles.pillarP}>
              Every song page pre-rendered. Works in basement rooms and church
              halls with no signal. No ads, no popups, no tracking. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* ── Churches ── */}
      <section
        className={styles.section}
        style={{ textAlign: "center", paddingTop: 40 }}
      >
        <p className={styles.sectionLabel}>A growing library</p>
        <h2
          className={styles.sectionH2}
          style={{ fontSize: "clamp(28px, 3.6vw, 42px)" }}
        >
          Songs from churches
          <br />
          across India.
        </h2>
        <div className={styles.churches}>
          {[
            "ICM",
            "FOLJ Church",
            "Nations of Worship",
            "Bridge Music",
            "Yeshua Band",
            "Sheldon Bangera",
            "Anil Kant",
            "Filadelfia Music",
            "Ankit Sajwan Ministries",
          ].map((name) => (
            <span key={name} className={styles.church}>
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.final}>
        <div className={styles.finalGlow} aria-hidden />
        <StarSVG size={22} className={styles.starFlourish} />
        <h2 className={styles.finalH2}>
          Come <em>worship</em>.
        </h2>
        <p className={styles.finalP}>
          Open Vandana in any browser — it&rsquo;ll save itself to your phone
          or desktop. Then it works wherever you do.
        </p>
        <div className={styles.ctas}>
          <Link className={styles.btnPrimary} href="/app">
            Open the app
            <ArrowRight />
          </Link>
          <a
            className={styles.btnGhost}
            href="https://github.com/TheAlgo7/vandana-worship-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerLeft}>
          <StarSVG size={12} />
          Vandana · वंदना — to worship, to praise
        </span>
        <div>
          Made with{" "}
          <span style={{ color: "var(--accent)" }}>♥</span> by{" "}
          <a
            className={styles.footerLink}
            href="https://thealgothrim.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gaurav · The Algothrim
          </a>
          <a
            className={styles.footerLink}
            href="https://github.com/TheAlgo7/vandana-worship-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
