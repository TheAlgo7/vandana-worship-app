"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Flag, Heart, Image as ImageIcon, Link2, ListPlus, ListX, Share2 } from "lucide-react";
import type { Song, Language } from "@/lib/getSongs";
import { shareCard } from "@/lib/shareCard";
import { useUIStrings } from "@/lib/uiStrings";
import { formatSectionLabel, getOrderedSectionEntries } from "@/lib/lyricsSections";
import { getStoredDefaultLanguage, pickPreferredLanguage } from "@/lib/languagePreference";
import LanguageToggle from "@/components/LanguageToggle";
import FontSizeControl from "@/components/FontSizeControl";
import DailyVerse from "@/components/DailyVerse";
import LyricsBlock from "@/components/LyricsBlock";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useSetlist } from "@/contexts/SetlistContext";
import { useSetlistEnabled } from "@/lib/setlistPreference";

type SongViewProps = {
  song: Song;
};

export default function SongView({ song }: SongViewProps) {
  const [languageState, setLanguageState] = useState<{ songId: string; lang: Language } | null>(null);
  const lang =
    languageState && languageState.songId === song.id && song.languages_available.includes(languageState.lang)
      ? languageState.lang
      : pickPreferredLanguage(song.languages_available, song.language_default);
  const setLang = useCallback(
    (nextLang: Language) => setLanguageState({ songId: song.id, lang: nextLang }),
    [song.id],
  );

  // Apply the stored language preference after hydration. Reading
  // localStorage during the first render desyncs server and client markup
  // (the server always renders the song's default language).
  useEffect(() => {
    setLanguageState((prev) => {
      if (prev && prev.songId === song.id) return prev;
      return {
        songId: song.id,
        lang: pickPreferredLanguage(
          song.languages_available,
          getStoredDefaultLanguage(),
          song.language_default,
        ),
      };
    });
  }, [song]);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { favourites, toggleFavourite } = useFavourites();
  const { isInSetlist, toggleSetlist } = useSetlist();
  const [setlistEnabled] = useSetlistEnabled();
  const { t } = useUIStrings();

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);
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

  // Share handlers
  const handleShareLink = useCallback(async () => {
    setShareMenuOpen(false);
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
        showToast(t.linkCopied);
      }
    } catch {
      // user cancelled or unsupported
    }
  }, [languageLabel, song.artist, song.church, song.title, showToast, t.linkCopied]);

  const handleShareImage = useCallback(async () => {
    setShareMenuOpen(false);
    const firstSection = sectionEntries[0];
    if (!firstSection) return;
    const lines = firstSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 8);
    const result = await shareCard({
      lines,
      title: song.title,
      subtitle: song.artist !== "Unknown Artist" ? song.artist : undefined,
      isDevanagari: lang === "hindi",
      filename: `vandana-${song.id}`,
    });
    if (result === "downloaded") showToast(t.imageShared);
  }, [sectionEntries, song.title, song.artist, song.id, lang, showToast, t.imageShared]);

  const reportMailto = `mailto:gauravtiger60@gmail.com?subject=${encodeURIComponent(
    `Lyric correction: ${song.title}`,
  )}&body=${encodeURIComponent(
    `Song: ${song.title} (${song.id})\nLanguage: ${languageLabel}\n\nWhat needs fixing:\n`,
  )}`;

  return (
    <div className="song-view-shell">
      {/* Top bar */}
      <div className="song-topbar">
        {/* Back button */}
        <Link
          href="/app"
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
          {t.back}
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

        {/* Share button + menu */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShareMenuOpen((open) => !open)}
            aria-label="Share song"
            aria-expanded={shareMenuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              background: shareMenuOpen ? "var(--accent-dim)" : "none",
              border: "none",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              padding: 0,
              color: shareMenuOpen ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <Share2 size={18} />
          </button>
          {shareMenuOpen && (
            <>
              {/* click-away layer */}
              <div
                aria-hidden="true"
                onClick={() => setShareMenuOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 90 }}
              />
              <div
                role="menu"
                className="fade-up"
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  zIndex: 95,
                  minWidth: 200,
                  padding: 6,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <button
                  role="menuitem"
                  onClick={handleShareLink}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    minHeight: 44,
                    padding: "0 12px",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Link2 size={16} aria-hidden="true" style={{ color: "var(--text-muted)" }} />
                  {t.shareLink}
                </button>
                <button
                  role="menuitem"
                  onClick={handleShareImage}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    minHeight: 44,
                    padding: "0 12px",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <ImageIcon size={16} aria-hidden="true" style={{ color: "var(--text-muted)" }} />
                  {t.shareImage}
                </button>
              </div>
            </>
          )}
        </div>

        {setlistEnabled && (
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
        )}

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
          {t.present}
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
          aria-hidden={true}
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
            fontSize: "var(--text-sm)",
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
            <h2 className="section-label" aria-label={formatSectionLabel(key)}>
              {formatSectionLabel(key)}
            </h2>
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

      {/* Lyric correction loop — the congregation knows when a line is wrong */}
      <a
        href={reportMailto}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minHeight: 44,
          marginTop: 28,
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          textDecoration: "none",
        }}
      >
        <Flag size={13} aria-hidden="true" style={{ opacity: 0.7 }} />
        <span style={{ borderBottom: "1px dotted var(--border)" }}>{t.reportMistake}</span>
      </a>

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
              {song.tags.length > 0 && (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                    Tags
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-muted)",
                          background: "var(--bg-base)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-pill)",
                          padding: "2px 8px",
                          lineHeight: 1.6,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Toast */}
      {toast && (
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
          {toast}
        </div>
      )}
    </div>
  );
}

