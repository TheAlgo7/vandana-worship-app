import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://vandanaapp.vercel.app";

export const metadata: Metadata = {
  title: "About",
  description:
    "Vandana is a free Hindi and Hinglish Christian worship lyrics app for Indian churches, built by Gaurav Kumar with the blessing of Isus Christos Ministries (ICM).",
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: "About Vandana — Hindi & Hinglish Worship Lyrics App",
    description:
      "Vandana is a free Hindi and Hinglish Christian worship lyrics app for Indian churches, built by Gaurav Kumar with the blessing of Isus Christos Ministries (ICM).",
    url: `${BASE_URL}/about`,
    type: "website",
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/#webapplication`,
      name: "Vandana",
      alternateName: "Vandana Worship App",
      url: BASE_URL,
      applicationCategory: "MusicApplication",
      operatingSystem: "Any",
      description:
        "A free Progressive Web App providing Hindi and Hinglish Christian worship song lyrics for Indian churches and worship teams.",
      inLanguage: ["hi", "en-IN"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      author: {
        "@type": "Person",
        name: "Gaurav Kumar",
        url: "https://thealgothrim.com",
      },
      publisher: { "@id": `${BASE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Isus Christos Ministries",
      alternateName: ["ICM", "Isus Christos Ministries (ICM)"],
      url: BASE_URL,
      description:
        "An Indian Christian ministry whose worship songs are featured in the Vandana app, led by Ps. Arul Thomas and Dr. Mahima John Arul.",
      foundingLocation: { "@type": "Country", name: "India" },
      member: [
        { "@type": "Person", name: "Ps. Arul Thomas" },
        { "@type": "Person", name: "Dr. Mahima John Arul" },
      ],
    },
    {
      "@type": "Person",
      name: "Gaurav Kumar",
      url: "https://thealgothrim.com",
      description: "Developer and creator of the Vandana worship lyrics app.",
      sameAs: ["https://thealgothrim.com"],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <div
        style={{
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          minHeight: "100vh",
          paddingBottom: 48,
        }}
      >
        {/* Header */}
        <header
          className="page-sticky-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            background: "var(--bg-base)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            About Vandana
          </h1>
        </header>

        <div className="page-desktop-grid">
          <main id="main-content" style={{ padding: "32px 20px", maxWidth: "40rem" }}>

            {/* Hero */}
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Vandana
              </h2>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  marginBottom: 16,
                }}
              >
                वंदना — to worship, to praise
              </p>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 12 }}>
                Vandana is a free, modern worship lyrics app built for the Indian church. Every song
                is available in both <strong style={{ color: "var(--text-primary)" }}>Hinglish</strong>{" "}
                (Roman transliteration) and{" "}
                <strong style={{ color: "var(--text-primary)" }}>Hindi</strong> (Devanagari script),
                so every member of a congregation — regardless of literacy in either script — can
                follow along and worship together.
              </p>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)" }}>
                The app includes a full-screen{" "}
                <strong style={{ color: "var(--text-primary)" }}>Presentation Mode</strong> designed
                for worship leaders to display lyrics on screens during services, a{" "}
                <strong style={{ color: "var(--text-primary)" }}>Setlist Builder</strong> for planning
                worship sets, and a fuzzy search across song titles, lyrics, artists, and ministries.
              </p>
            </section>

            {/* Song Library */}
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                The Song Library
              </h2>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 12 }}>
                The library contains <strong style={{ color: "var(--text-primary)" }}>80+ Hindi and
                Hinglish worship songs</strong> from Indian Christian ministries, including original
                compositions and Hindi translations of internationally known worship songs. Songs span
                themes of praise, intercession, declaration, and devotion.
              </p>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)" }}>
                Featured ministries and artists include:
              </p>
              <ul
                style={{
                  marginTop: 10,
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                <li><strong style={{ color: "var(--text-primary)" }}>Isus Christos Ministries (ICM)</strong> — Ps. Arul Thomas &amp; Dr. Mahima John Arul</li>
                <li><strong style={{ color: "var(--text-primary)" }}>Ankit Sajwan Ministries</strong> — FOLJ Church</li>
                <li><strong style={{ color: "var(--text-primary)" }}>Bridge Music</strong></li>
                <li><strong style={{ color: "var(--text-primary)" }}>Nations of Worship</strong></li>
                <li>Various Indian Christian worship artists</li>
              </ul>
            </section>

            {/* ICM */}
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Isus Christos Ministries (ICM)
              </h2>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 12 }}>
                Vandana was built with the blessing of{" "}
                <strong style={{ color: "var(--text-primary)" }}>Isus Christos Ministries (ICM)</strong>,
                an Indian Christian ministry led by{" "}
                <strong style={{ color: "var(--text-primary)" }}>Ps. Arul Thomas</strong> and{" "}
                <strong style={{ color: "var(--text-primary)" }}>Dr. Mahima John Arul</strong>.
                ICM's original worship compositions form a significant part of the Vandana library,
                and the app was created as a personal offering to their congregation and the wider
                Indian worship community.
              </p>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)" }}>
                "Isus Christos" (ईसुस क्रिस्तोस) is the transliteration of "Jesus Christ" used in
                Indian Christian traditions — a name declared over every song in this library.
              </p>
            </section>

            {/* Creator */}
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Creator
              </h2>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 12 }}>
                Vandana was designed and developed by{" "}
                <a
                  href="https://thealgothrim.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}
                >
                  Gaurav Kumar — The Algothrim
                </a>
                , a developer and church member. The app is a non-commercial, personal gift to the
                Indian worship community — free to use, with no ads, no subscriptions, and no data
                collection.
              </p>
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--text-secondary)" }}>
                All song lyrics are the property of their respective artists and ministries, reproduced
                here for congregational and personal worship use.
              </p>
            </section>

            {/* Technical */}
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Built With
              </h2>
              <ul
                style={{
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                <li>Next.js 16 · React 19 · TypeScript</li>
                <li>Tailwind CSS 4 · Sacred Noir design system</li>
                <li>Supabase (song database)</li>
                <li>Deployed on Vercel</li>
                <li>Progressive Web App (PWA) — installable on iOS and Android</li>
              </ul>
            </section>

            {/* Back link */}
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              ← Back to song library
            </Link>

          </main>
        </div>
      </div>
    </>
  );
}
