"use client";

import { useEffect } from "react";

interface UpdateEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  type: string;
  song_count: number;
  song_names: string[];
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const mon = d.toLocaleString("en-US", { month: "short" });
  return `${day} ${mon}`;
}

export default function UpdatesContent({
  updates,
}: {
  updates: UpdateEntry[];
}) {
  /* Mark all as read on mount */
  useEffect(() => {
    localStorage.setItem(
      "vandana-updates-last-read",
      new Date().toISOString()
    );
  }, []);

  return (
    <main style={{ padding: "0 20px", paddingTop: 24, paddingBottom: 120 }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: 0,
          marginBottom: 20,
        }}
      >
        Updates
      </h1>

      {/* Cards */}
      {updates.map((u) => (
        <div
          key={u.id}
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            padding: 16,
            marginBottom: 12,
          }}
        >
          {/* Top row: title + date */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {u.title}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {formatDate(u.date)}
            </span>
          </div>

          {/* Body */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
              marginTop: 8,
            }}
          >
            {u.body}
          </p>

          {/* Songs-added pill */}
          {u.type === "songs_added" && u.song_count > 0 && (
            <span
              style={{
                display: "inline-block",
                background: "var(--accent-dim)",
                color: "var(--accent)",
                fontSize: 12,
                borderRadius: "var(--radius-pill)",
                padding: "2px 10px",
                marginTop: 8,
                fontWeight: 500,
              }}
            >
              🎵 {u.song_count} songs
            </span>
          )}

          {/* Song names list */}
          {u.song_names.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {u.song_names.map((name) => (
                <div
                  key={name}
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  › {name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
