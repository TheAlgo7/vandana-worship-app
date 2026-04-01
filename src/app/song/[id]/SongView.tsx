"use client";

import { useState } from "react";
import Link from "next/link";
import type { Song, Language } from "@/lib/getSongs";
import LanguageToggle from "@/components/LanguageToggle";
import FontSizeControl from "@/components/FontSizeControl";

export default function SongView({ song }: { song: Song }) {
  const [lang, setLang] = useState<Language>(song.language_default);
  const sections = song.lyrics[lang] ?? song.lyrics[song.language_default];

  return (
    <div
      className="fade-in"
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "var(--space-lg) var(--space-md)",
      }}
    >
      {/* Back link */}
      <Link
        href="/"
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: "var(--space-md)",
        }}
      >
        ← Back
      </Link>

      {/* Header */}
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "var(--space-xs)",
          }}
        >
          {song.title}
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-muted)",
          }}
        >
          {song.artist}
          {song.church ? ` · ${song.church}` : ""}
        </p>
      </header>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-md)",
          marginBottom: "var(--space-lg)",
          flexWrap: "wrap",
        }}
      >
        <LanguageToggle
          available={song.languages_available}
          current={lang}
          onChange={setLang}
        />
        <FontSizeControl />
        <Link
          href={`/present/${song.id}`}
          style={{
            marginLeft: "auto",
            padding: "var(--space-xs) var(--space-md)",
            borderRadius: "var(--radius-full)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Present
        </Link>
      </div>

      {/* Lyrics */}
      <div className="lyrics-text">
        {Object.entries(sections).map(([key, text]) => (
          <section key={key} style={{ marginBottom: "var(--space-lg)" }}>
            <span className="section-label">{formatLabel(key)}</span>
            <p style={{ whiteSpace: "pre-line" }}>{text}</p>
          </section>
        ))}
      </div>

      {/* Links */}
      {song.links && (
        <div
          style={{
            marginTop: "var(--space-xl)",
            display: "flex",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
          }}
        >
          {song.links.youtube && (
            <a
              href={song.links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              YouTube
            </a>
          )}
          {song.links.spotify && (
            <a
              href={song.links.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border)",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              Spotify
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([0-9]+)/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}
