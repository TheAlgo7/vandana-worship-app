"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Info,
  Music2,
  Sparkles,
  Wrench,
} from "lucide-react";
import DailyVerse from "@/components/DailyVerse";

interface UpdateEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  type: string;
  song_count: number;
  song_names: string[];
}

type UpdateTheme = {
  label: string;
  icon: typeof Music2;
};

const UPDATE_THEMES: Record<string, UpdateTheme> = {
  songs_added: { label: "Songs", icon: Music2 },
  songs_updated: { label: "Lyrics", icon: CheckCircle2 },
  feature: { label: "Feature", icon: Sparkles },
  improvement: { label: "Polish", icon: Wrench },
  fix: { label: "Fix", icon: CheckCircle2 },
  metadata: { label: "Credits", icon: Info },
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleString("en-US", { day: "2-digit", month: "short" });
}

function formatMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function getTheme(type: string): UpdateTheme {
  return UPDATE_THEMES[type] ?? { label: "Update", icon: Bell };
}

function normalizeSongName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default function UpdatesContent({
  updates,
  librarySongCount,
  songLinks,
}: {
  updates: UpdateEntry[];
  librarySongCount: number;
  songLinks: Record<string, string>;
}) {
  useEffect(() => {
    localStorage.setItem("vandana-updates-last-read", new Date().toISOString());
  }, []);

  const latestUpdate = updates[0]?.date ? formatDate(updates[0].date) : "None";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        paddingBottom: "calc(var(--nav-clearance) + 16px)",
      }}
    >
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
          Updates
        </h1>
      </header>

      <div className="page-desktop-grid">
      <main
        id="main-content"
        className="updates-main"
        style={{
          padding: "24px 20px",
        }}
      >
        {updates.length === 0 ? (
          <div
            style={{
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              textAlign: "center",
              padding: "0 24px",
            }}
          >
            <Bell size={40} strokeWidth={1.4} style={{ color: "var(--accent)", opacity: 0.45 }} />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl)",
                color: "var(--text-primary)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              No updates yet
            </p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-muted)",
                lineHeight: 1.55,
                maxWidth: 300,
                margin: 0,
              }}
            >
              New songs and library changes will appear here after they are published.
            </p>
          </div>
        ) : (
          <>
            <p className="section-label updates-summary-mobile">Library Notes</p>
            <section
              className="updates-summary-mobile"
              aria-label="Updates summary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 28,
                padding: "14px 16px",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
            >
              <SummaryStat label="Total songs" value={librarySongCount.toString()} />
              <SummaryStat label="Latest update" value={latestUpdate} />
            </section>

            <p className="section-label">Recent Changes</p>
            <section
              style={{
                overflow: "hidden",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
            >
              {updates.map((update, index) => {
                const theme = getTheme(update.type);
                const Icon = theme.icon;
                const showMonth =
                  index === 0 || formatMonth(update.date) !== formatMonth(updates[index - 1].date);
                const isLast = index === updates.length - 1;

                return (
                  <div key={update.id} style={{ padding: showMonth ? "14px 16px 0" : "0 16px" }}>
                    {showMonth && (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          margin: 0,
                        }}
                      >
                        {formatMonth(update.date)}
                      </p>
                    )}
                    <article
                      style={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "30px 1fr",
                        gap: 13,
                        padding: showMonth ? "12px 0 16px" : "16px 0",
                        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 30,
                          height: 30,
                          borderRadius: "var(--radius-pill)",
                          background: "var(--accent-dim)",
                          border: "1px solid color-mix(in srgb, var(--accent) 18%, transparent)",
                          color: "var(--accent)",
                        }}
                      >
                        <Icon size={15} strokeWidth={1.75} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span
                                style={{
                                  color: "var(--accent)",
                                  fontSize: "var(--text-xs)",
                                  fontWeight: 700,
                                  lineHeight: 1,
                                  letterSpacing: "0.05em",
                                  textTransform: "uppercase",
                                }}
                              >
                                {theme.label}
                              </span>
                              {update.song_count > 0 && (
                                <span
                                  style={{
                                    color: "var(--text-secondary)",
                                    background: "transparent",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-pill)",
                                    padding: "2px 7px",
                                    fontSize: "var(--text-xs)",
                                    fontWeight: 600,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {update.song_count} songs
                                </span>
                              )}
                            </div>
                            <h2
                              style={{
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-body)",
                                fontSize: "var(--text-base)",
                                fontWeight: 700,
                                lineHeight: 1.35,
                                letterSpacing: 0,
                                marginTop: 6,
                              }}
                            >
                              {update.title}
                            </h2>
                          </div>
                          <time
                            dateTime={update.date}
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "var(--text-xs)",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              paddingTop: 2,
                            }}
                          >
                            {formatDate(update.date)}
                          </time>
                        </div>

                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "var(--text-sm)",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {update.body}
                        </p>

                        {update.song_names.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              marginTop: 12,
                            }}
                          >
                            {update.song_names.map((name) => {
                              const songId = songLinks[normalizeSongName(name)];
                              const chipStyle = {
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "var(--text-secondary)",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-pill)",
                                padding: "4px 9px",
                                fontSize: "var(--text-xs)",
                                lineHeight: 1.35,
                                whiteSpace: "nowrap",
                                textDecoration: "none",
                              } as const;

                              return songId ? (
                                <Link
                                  key={name}
                                  href={`/song/${songId}`}
                                  aria-label={`Open ${name}`}
                                  style={{
                                    ...chipStyle,
                                    transition:
                                      "border-color 160ms ease, color 160ms ease, background 160ms ease",
                                  }}
                                >
                                  {name}
                                </Link>
                              ) : (
                                <span key={name} style={chipStyle}>
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>

      <aside className="page-aside-col" aria-label="Daily verse">
        <div className="page-aside-card">
          <DailyVerse />
        </div>
        <div
          className="page-aside-card"
          style={{ padding: "18px 20px" }}
        >
          <p className="section-label" style={{ marginBottom: 14 }}>Library</p>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                Total Songs
              </p>
              <p style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, lineHeight: 1, margin: 0 }}>
                {librarySongCount}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                Latest Update
              </p>
              <p style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, lineHeight: 1, margin: 0 }}>
                {latestUpdate}
              </p>
            </div>
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 0,
      }}
    >
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          fontWeight: 600,
          lineHeight: 1,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
