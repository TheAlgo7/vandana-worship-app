import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MINISTRIES, MINISTRY_BY_SLUG } from "@/lib/ministries";
import { getSongsByMinistry } from "@/lib/getSongs";

export const revalidate = 3600;

const BASE_URL = "https://vandanaapp.vercel.app";

export function generateStaticParams() {
  return MINISTRIES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ministry = MINISTRY_BY_SLUG.get(slug);
  if (!ministry) return {};

  return {
    title: ministry.name,
    description: ministry.description,
    alternates: { canonical: `${BASE_URL}/ministry/${slug}` },
    openGraph: {
      title: `${ministry.name} — Hindi & Hinglish Worship Lyrics`,
      description: ministry.description,
      url: `${BASE_URL}/ministry/${slug}`,
      type: "website",
    },
  };
}

export default async function MinistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ministry = MINISTRY_BY_SLUG.get(slug);
  if (!ministry) notFound();

  const songs = await getSongsByMinistry(ministry.filterBy, ministry.filterValue);

  const ministrySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${ministry.name} Worship Songs`,
        description: ministry.description,
        url: `${BASE_URL}/ministry/${slug}`,
        numberOfItems: songs.length,
        itemListElement: songs.map((song, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BASE_URL}/song/${song.id}`,
          name: song.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: ministry.name,
            item: `${BASE_URL}/ministry/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ministrySchema) }}
      />
      <div style={{ background: "var(--bg-base)", color: "var(--text-primary)", minHeight: "100vh", paddingBottom: 48 }}>
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
            padding: "12px 20px",
            background: "var(--bg-base)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Link
            href="/app"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} />
            Home
          </Link>
          <h1
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--text-primary)",
            }}
          >
            {ministry.name}
          </h1>
        </header>

        <div className="page-desktop-grid">
          <main id="main-content" style={{ padding: "28px 20px" }}>
            {/* Hero */}
            <section style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                {ministry.name}
              </h2>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  maxWidth: "38rem",
                }}
              >
                {ministry.description}
              </p>
              <p
                style={{
                  marginTop: 12,
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </p>
            </section>

            {/* Song list */}
            {songs.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {songs.map((song) => (
                  <li
                    key={song.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <Link
                      href={`/song/${song.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 0",
                        textDecoration: "none",
                        color: "inherit",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-base)",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {song.title}
                        </p>
                        <p
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {song.languages_available
                            .map((l) => (l === "hindi" ? "Hindi" : "Hinglish"))
                            .join(" · ")}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        aria-hidden="true"
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                No songs found for this ministry yet.
              </p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
