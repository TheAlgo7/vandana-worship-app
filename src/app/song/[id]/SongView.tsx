"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, ListPlus, ListX, Share2 } from "lucide-react";
import type { Song, Language } from "@/lib/getSongs";
import { formatSectionLabel, getOrderedSectionEntries } from "@/lib/lyricsSections";
import { getStoredDefaultLanguage, pickPreferredLanguage } from "@/lib/languagePreference";
import LanguageToggle from "@/components/LanguageToggle";
import FontSizeControl from "@/components/FontSizeControl";
import DailyVerse from "@/components/DailyVerse";
import LyricsBlock from "@/components/LyricsBlock";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useSetlist } from "@/contexts/SetlistContext";

type SongViewProps = {
  song: Song;
};

export default function SongView({ song }: SongViewProps) {
  const [languageState, setLanguageState] = useState<{ songId: string; lang: Language }>(() => ({
    songId: song.id,
    lang: pickPreferredLanguage(
      song.languages_available,
      getStoredDefaultLanguage(),
      song.language_default,
    ),
  }));
  const lang =
    languageState.songId === song.id && song.languages_available.includes(languageState.lang)
      ? languageState.lang
      : pickPreferredLanguage(
          song.languages_available,
          getStoredDefaultLanguage(),
          song.language_default,
        );
  const setLang = useCallback(
    (nextLang: Language) => setLanguageState({ songId: song.id, lang: nextLang }),
    [song.id],
  );
  const [scrolled, setScrolled] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { favourites, toggleFavourite } = useFavourites();
  const { isInSetlist, toggleSetlist } = useSetlist();
  const isFavourite = favourites.includes(song.id);
  const queued = isInSetlist(song.id);

  // Lyrics sections
  const sections = song.lyrics[lang] || {};
  const sectionEntries = getOrderedSectionEntries(sections);
  const languageLabel = lang === "hindi" ? "Hindi" : "Hinglish";

  // Track recently viewed
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vandana-recently-viewed") || "[]";
      const recent = JSON.parse(stored) as string[];
      const updated = [song.id, ...recent.filter((id) => id !== song.id)].slice(0, 10);
      localStorage.setItem("vandana-recently-viewed", JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [song.id]);

  // Scroll sentinel for sticky header
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new window.IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    const songCredit = [song.artist, song.church].filter(Boolean).join(", ");
    const shareText = [
      `${song.title} lyrics`,
      songCredit ? `By ${songCredit}` : null,
      `Language: ${languageLabel}`,
      "",
      "Open in Vandana:",
      window.location.href,
    ]
      .filter(Boolean)
      .join("\n");
    const shareData = {
      title: `${song.title} lyrics`,
      text: shareText,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch {
      // user cancelled or unsupported
    }
  }, [languageLabel, song.artist, song.church, song.title]);

  return (
    <div className="song-view-shell">
      {/* Top bar */}
      <div className="song-topbar">
        {/* Back button */}
        <Link
          href="/"
          className="song-back-link"
          style={{
            gap: 4,
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={18} />
          Back
        </Link>

        {/* Song title in top bar when scrolled */}
        <span
          className="song-topbar-title"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--text-primary)",
            opacity: scrolled ? 1 : 0,
            transition: "opacity var(--transition-base)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.title}
        </span>

        {/* Heart favourite toggle */}
        <button
          onClick={() => toggleFavourite(song.id)}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
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
            color: isFavourite ? "var(--accent)" : "var(--text-secondary)",
            transition: "transform 120ms ease",
          }}
        >
          <Heart size={20} fill={isFavourite ? "var(--accent)" : "none"} color={isFavourite ? "var(--accent)" : undefined} />
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          aria-label="Share song"
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
            color: "var(--text-secondary)",
          }}
        >
          <Share2 size={18} />
        </button>

        <button
          onClick={() => toggleSetlist(song.id)}
          aria-label={queued ? "Remove from setlist" : "Add to setlist"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            background: queued ? "var(--accent-dim)" : "none",
            border: "none",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            color: queued ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          {queued ? <ListX size={19} /> : <ListPlus size={19} />}
        </button>

        {/* Present button always visible */}
        <Link
          href={`/present/${song.id}`}
          className="song-present-link"
          style={{
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

      <div className="song-view-grid">
        <div className="song-reading-column">
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
            fontSize: "var(--text-song-title)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            letterSpacing: 0,
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
          {song.church ? `, ${song.church}` : ""}
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
          boxShadow: "var(--shadow-sm)",
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
      <div className="lyrics-text" lang={lang === "hindi" ? "hi" : "en"}>
        {sectionEntries.map(([key, text]) => (
          <section key={key} style={{ marginBottom: 28 }}>
            <span className="section-label">{formatSectionLabel(key)}</span>
            <LyricsBlock text={text} />
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

        <aside className="song-side-panel" aria-label="Song details">
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 18,
            }}
          >
            <p className="section-label" style={{ marginBottom: 14 }}>Song Details</p>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Artist
                </p>
                <p style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)", fontWeight: 600, margin: 0 }}>
                  {song.artist}
                </p>
              </div>
              {song.church && (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                    Ministry
                  </p>
                  <p style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)", fontWeight: 600, margin: 0 }}>
                    {song.church}
                  </p>
                </div>
              )}
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Languages
                </p>
                <p style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)", fontWeight: 600, margin: 0 }}>
                  {song.languages_available.map((item) => (item === "hindi" ? "Hindi" : "Hinglish")).join(", ")}
                </p>
              </div>
            </div>
            <Link
              href={`/present/${song.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                width: "100%",
                marginTop: 18,
                borderRadius: "var(--radius-pill)",
                background: "var(--accent)",
                color: "var(--bg-base)",
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Present
            </Link>
          </div>
          <div className="page-aside-card">
            <DailyVerse />
          </div>
        </aside>
      </div>

      {/* Clipboard toast */}
      {showCopied && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            padding: "10px 20px",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            border: "1px solid var(--border)",
            zIndex: 100,
            animation: "fadeUp 200ms ease",
          }}
        >
          Link copied!
        </div>
      )}
    </div>
  );
}

