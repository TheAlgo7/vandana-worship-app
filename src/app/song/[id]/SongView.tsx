"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Song, Language } from "@/lib/getSongs";
import { formatBlock, formatLyricsAudit } from "@/lib/formatLyrics";
import LanguageToggle from "@/components/LanguageToggle";
import FontSizeControl from "@/components/FontSizeControl";
import { useFavourites } from "@/contexts/FavouritesContext";

export default function SongView({ song }: { song: Song }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return song.language_default;
    const stored = localStorage.getItem("vandana-default-lang");
    if (stored === "hindi" || stored === "hinglish") {
      if (song.lyrics[stored as Language]) return stored as Language;
    }
    return song.language_default;
  });
  const sections = song.lyrics[lang] ?? song.lyrics[song.language_default];
  const { toggleFavourite, isFavourite } = useFavourites();
  const fav = isFavourite(song.id);
  const [heartPop, setHeartPop] = useState(false);

  const handleFavToggle = useCallback(() => {
    toggleFavourite(song.id);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 120);
  }, [song.id, toggleFavourite]);

  // Dev-only audit: log problematic lines on first render
  useEffect(() => { formatLyricsAudit(song); }, [song]);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Scroll-triggered sticky top bar */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "0 16px",
        paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 24px)",
      }}
    >
      {/* Sticky top bar — appears on scroll */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: scrolled
            ? "color-mix(in srgb, var(--bg-base) 88%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px) saturate(1.3)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.3)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "background var(--transition-base), border-color var(--transition-base), backdrop-filter var(--transition-base)",
          display: "flex",
          alignItems: "center",
          height: 52,
          margin: "0 -16px",
          padding: "0 16px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        {/* Song title in top bar when scrolled */}
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--text-primary)",
            opacity: scrolled ? 1 : 0,
            transition: "opacity var(--transition-base)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            padding: "0 12px",
          }}
        >
          {song.title}
        </span>

        {/* Heart favourite toggle */}
        <button
          onClick={handleFavToggle}
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            transform: heartPop ? "scale(1.3)" : "scale(1)",
            transition: "transform 120ms ease",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={fav ? "var(--accent)" : "none"}
            stroke={fav ? "var(--accent)" : "var(--text-secondary)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Present button always visible */}
        <Link
          href={`/present/${song.id}`}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--radius-pill)",
            background: "var(--accent)",
            color: "var(--bg-base)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          Present
        </Link>
      </div>

      {/* Scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Radial accent glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          opacity: 0.07,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      {/* Header */}
      <header style={{ marginBottom: 24, marginTop: 8 }}>
        {/* Skeuomorphic 4-pointed star */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{ opacity: 0.3, marginBottom: 12 }}
        >
          <path
            d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"
            stroke="var(--accent)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "34px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            marginBottom: 4,
          }}
        >
          {song.title}
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          {song.artist}
          {song.church ? ` · ${song.church}` : ""}
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--accent-dim)",
            marginTop: 16,
            marginBottom: 0,
          }}
        />
      </header>

      {/* Controls toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "8px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      >
        <LanguageToggle
          available={song.languages_available}
          current={lang}
          onChange={setLang}
        />
        <FontSizeControl />
      </div>

      {/* Lyrics */}
      <div className="lyrics-text">
        {Object.entries(sections).map(([key, text]) => (
          <section key={key} style={{ marginBottom: 28 }}>
            <span className="section-label">{formatLabel(key)}</span>
            <p style={{ whiteSpace: "pre-line" }}>{formatBlock(text)}</p>
          </section>
        ))}
      </div>

      {/* Links */}
      {song.links && (
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {song.links.youtube && (
            <a
              href={song.links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border)",
                fontSize: "var(--text-xs)",
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
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border)",
                fontSize: "var(--text-xs)",
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
