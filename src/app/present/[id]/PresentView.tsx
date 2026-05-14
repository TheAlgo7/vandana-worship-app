"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Song, Language } from "@/lib/getSongs";
import { formatBlock } from "@/lib/formatLyrics";
import { formatSectionLabel, getOrderedSectionEntries } from "@/lib/lyricsSections";
import { useSetlist } from "@/contexts/SetlistContext";

const FONT_SIZES = [1.25, 1.75, 2.5] as const; // small, medium, large (rem)
const FONT_LABELS = ["A", "A", "A"] as const;

export default function PresentView({ song }: { song: Song }) {
  const [lang, setLang] = useState<Language>(song.language_default);
  const [showControls, setShowControls] = useState(true);
  const [fontIdx, setFontIdx] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setlist } = useSetlist();

  const sections = song.lyrics[lang] ?? song.lyrics[song.language_default];
  const entries = getOrderedSectionEntries(sections);
  const setlistIndex = setlist.indexOf(song.id);
  const prevSetlistId = setlistIndex > 0 ? setlist[setlistIndex - 1] : null;
  const nextSetlistId = setlistIndex >= 0 && setlistIndex < setlist.length - 1 ? setlist[setlistIndex + 1] : null;

  /* auto-hide controls after 3s */
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    if (showControls) scheduleHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showControls, scheduleHide]);

  /* tap to toggle controls */
  const handleTap = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  /* keyboard: Escape to exit */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") window.history.back();
      if (e.key === " ") {
        e.preventDefault();
        setShowControls((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* cycle language */
  const cycleLang = useCallback(() => {
    const langs = song.languages_available;
    if (langs.length < 2) return;
    setLang((cur) => {
      const i = langs.indexOf(cur);
      return langs[(i + 1) % langs.length];
    });
  }, [song.languages_available]);

  /* auto-scroll */
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      const el = scrollRef.current;
      const tick = () => {
        el.scrollTop += 1;
        autoScrollRef.current = requestAnimationFrame(tick);
      };
      autoScrollRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [autoScroll, lang]);

  /* stop auto-scroll on manual scroll */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastTop = el.scrollTop;
    const onScroll = () => {
      const diff = Math.abs(el.scrollTop - lastTop);
      if (diff > 3 && autoScroll) setAutoScroll(false);
      lastTop = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [autoScroll]);

  const controlOpacity = showControls ? 1 : 0;
  const controlPointer = showControls ? "auto" : "none";

  return (
    <div
      ref={scrollRef}
      onClick={handleTap}
      style={{
        background: "var(--present-bg)",
        color: "var(--present-text)",
        minHeight: "100dvh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        position: "relative",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          paddingTop: "calc(10px + env(safe-area-inset-top, 0px))",
          background: "var(--present-overlay-top)",
          opacity: controlOpacity,
          pointerEvents: controlPointer,
          transition: "opacity var(--transition-fast) ease",
          zIndex: 10,
        }}
      >
        <Link
          href={`/song/${song.id}`}
          style={{
            color: "var(--present-text)",
            textDecoration: "none",
            fontSize: "var(--text-sm)",
            padding: "6px 10px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ✕ Exit
        </Link>
        <span
          style={{
            fontSize: "var(--text-sm)",
            opacity: 0.5,
          }}
        >
          {song.title}
        </span>
        {setlistIndex >= 0 && (
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--present-control-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {setlistIndex + 1}/{setlist.length}
          </span>
        )}
      </div>

      {/* ── Lyrics (continuous scroll) ── */}
      <div
        style={{
          padding: "5rem 24px 8rem",
          maxWidth: "48rem",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {entries.map(([key, text]) => (
          <section
            key={key}
            style={{ marginBottom: 36 }}
          >
            <span
              style={{
                display: "block",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--present-label)",
                marginBottom: 10,
              }}
            >
              {formatSectionLabel(key)}
            </span>
            <p
              style={{
                whiteSpace: "pre-line",
                wordBreak: "keep-all",
                overflowWrap: "break-word",
                paddingLeft: 20,
                paddingRight: 20,
                fontSize: `${FONT_SIZES[fontIdx]}rem`,
                lineHeight: 1.7,
                transition: "font-size var(--transition-fast) ease",
              }}
            >
              {formatBlock(text)}
            </p>
          </section>
        ))}
      </div>

      {/* ── Bottom controls ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          padding: "10px 16px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          background: "var(--present-overlay-bottom)",
          opacity: controlOpacity,
          pointerEvents: controlPointer,
          transition: "opacity var(--transition-fast) ease",
          zIndex: 10,
        }}
      >
        {/* Font size toggle (3 levels) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFontIdx((i) => (i + 1) % FONT_SIZES.length);
          }}
          aria-label="Change font size"
          style={{
            background: "var(--present-control-bg)",
            border: "1px solid var(--present-control-border)",
            borderRadius: "var(--radius-pill)",
            color: "var(--present-text)",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: fontIdx === 0 ? "0.75rem" : fontIdx === 1 ? "1rem" : "1.25rem",
            fontWeight: 700,
          }}
        >
          {FONT_LABELS[fontIdx]}
        </button>

        {/* Language toggle */}
        {song.languages_available.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleLang();
            }}
            aria-label="Switch language"
            style={{
              background: "var(--present-control-bg)",
              border: "1px solid var(--present-control-border)",
              borderRadius: "var(--radius-pill)",
              color: "var(--present-text)",
              padding: "6px 16px",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {lang === "hindi" ? "हिं" : "Hi"}
          </button>
        )}

        {/* Auto-scroll toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAutoScroll((prev) => !prev);
          }}
          aria-label={autoScroll ? "Stop auto-scroll" : "Start auto-scroll"}
          style={{
            background: autoScroll ? "rgba(196,170,126,0.25)" : "var(--present-control-bg)",
            border: autoScroll ? "1px solid rgba(196,170,126,0.3)" : "1px solid var(--present-control-border)",
            borderRadius: "var(--radius-pill)",
            color: "var(--present-text)",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {/* scroll/play icon */}
          {autoScroll ? (
            <Pause size={16} strokeWidth={2} />
          ) : (
            <Play size={16} fill="currentColor" strokeWidth={0} />
          )}
        </button>

        {setlistIndex >= 0 && (
          <>
            {prevSetlistId ? (
              <Link
                href={`/present/${prevSetlistId}`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Previous song in setlist"
                style={setlistNavStyle}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </Link>
            ) : (
              <span aria-hidden="true" style={{ ...setlistNavStyle, opacity: 0.35 }}>
                <ChevronLeft size={18} />
              </span>
            )}

            {nextSetlistId ? (
              <Link
                href={`/present/${nextSetlistId}`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Next song in setlist"
                style={setlistNavStyle}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <span aria-hidden="true" style={{ ...setlistNavStyle, opacity: 0.35 }}>
                <ChevronRight size={18} />
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const setlistNavStyle: CSSProperties = {
  background: "var(--present-control-bg)",
  border: "1px solid var(--present-control-border)",
  borderRadius: "var(--radius-pill)",
  color: "var(--present-text)",
  width: 44,
  height: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
