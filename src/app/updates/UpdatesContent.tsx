"use client";

import { useEffect } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Info,
  Music2,
  Sparkles,
  Wrench,
} from "lucide-react";

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
  tone: string;
};

const UPDATE_THEMES: Record<string, UpdateTheme> = {
  songs_added: { label: "Songs", icon: Music2, tone: "#7FC7A6" },
  songs_updated: { label: "Lyrics", icon: CheckCircle2, tone: "#8FB7FF" },
  feature: { label: "Feature", icon: Sparkles, tone: "#C4AA7E" },
  improvement: { label: "Polish", icon: Wrench, tone: "#BFA7FF" },
  fix: { label: "Fix", icon: CheckCircle2, tone: "#F3B36A" },
  metadata: { label: "Credits", icon: Info, tone: "#8ED8E8" },
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
  return UPDATE_THEMES[type] ?? { label: "Update", icon: Bell, tone: "var(--accent)" };
}

export default function UpdatesContent({ updates }: { updates: UpdateEntry[] }) {
  useEffect(() => {
    localStorage.setItem("vandana-updates-last-read", new Date().toISOString());
  }, []);

  const latest = updates[0];
  const totalSongs = updates.reduce((sum, update) => sum + Math.max(update.song_count, 0), 0);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "color-mix(in srgb, var(--bg-base) 92%, transparent)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          className="page-header-content"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "14px 20px",
          }}
        >
          <div>
            <p
              style={{
                color: "var(--accent)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              What&apos;s new
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl)",
                fontWeight: 600,
                letterSpacing: 0,
                margin: 0,
              }}
            >
              Updates
            </h1>
          </div>
          {latest && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--text-secondary)",
                fontSize: "var(--text-xs)",
                whiteSpace: "nowrap",
              }}
            >
              <CalendarDays size={14} aria-hidden="true" />
              {formatDate(latest.date)}
            </span>
          )}
        </div>
      </header>

      <main
        style={{
          padding: "18px 20px",
          paddingBottom: "calc(var(--nav-clearance) + 18px)",
          maxWidth: "40rem",
          margin: "0 auto",
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
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <SummaryTile label="Library updates" value={updates.length.toString()} />
              <SummaryTile label="Songs added" value={totalSongs.toString()} />
            </section>

            <section style={{ display: "grid", gap: 12 }}>
              {updates.map((update, index) => {
                const theme = getTheme(update.type);
                const Icon = theme.icon;
                const showMonth =
                  index === 0 || formatMonth(update.date) !== formatMonth(updates[index - 1].date);

                return (
                  <div key={update.id}>
                    {showMonth && (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          margin: index === 0 ? "0 0 8px" : "14px 0 8px",
                        }}
                      >
                        {formatMonth(update.date)}
                      </p>
                    )}
                    <article
                      style={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "34px 1fr",
                        gap: 12,
                        padding: 14,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 34,
                          height: 34,
                          borderRadius: "var(--radius-pill)",
                          background: `color-mix(in srgb, ${theme.tone} 16%, transparent)`,
                          color: theme.tone,
                        }}
                      >
                        <Icon size={17} strokeWidth={1.8} />
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
                                  color: theme.tone,
                                  fontSize: "var(--text-xs)",
                                  fontWeight: 700,
                                  lineHeight: 1,
                                }}
                              >
                                {theme.label}
                              </span>
                              {update.song_count > 0 && (
                                <span
                                  style={{
                                    color: "var(--accent)",
                                    background: "var(--accent-dim)",
                                    border: "1px solid color-mix(in srgb, var(--accent) 26%, transparent)",
                                    borderRadius: "var(--radius-pill)",
                                    padding: "2px 8px",
                                    fontSize: "var(--text-xs)",
                                    fontWeight: 700,
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
                                marginTop: 5,
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
                            {update.song_names.map((name) => (
                              <span
                                key={name}
                                style={{
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
                                }}
                              >
                                {name}
                              </span>
                            ))}
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
    </>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
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
