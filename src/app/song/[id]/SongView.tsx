"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, ListPlus, ListX, Share2 } from "lucide-react";
import type { Song, Language } from "@/lib/getSongs";
import { formatBlock } from "@/lib/formatLyrics";
import { formatSectionLabel, getOrderedSectionEntries } from "@/lib/lyricsSections";
import LanguageToggle from "@/components/LanguageToggle";
import FontSizeControl from "@/components/FontSizeControl";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useSetlist } from "@/contexts/SetlistContext";

type SongViewProps = {
  song: Song;
};

export default function SongView({ song }: SongViewProps) {
  const [lang, setLang] = useState<Language>(song.languages_available[0]);
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
    const shareData = {
      title: song.title,
      text: "Check out this worship song on Vandana",
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch {
      // user cancelled or unsupported
    }
  }, [song.title]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: 20, paddingBottom: "calc(var(--nav-clearance) + 20px)", maxWidth: "720px", margin: "0 auto" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {/* Back button */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
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
            fontSize: "var(--text-song-title)",
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
      <div className="lyrics-text" lang={lang === "hindi" ? "hi" : "en"}>
        {sectionEntries.map(([key, text]) => (
          <section key={key} style={{ marginBottom: 28 }}>
            <span className="section-label">{formatSectionLabel(key)}</span>
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

