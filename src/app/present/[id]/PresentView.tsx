"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Song, Language } from "@/lib/getSongs";

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

  const sections = song.lyrics[lang] ?? song.lyrics[song.language_default];
  const entries = Object.entries(sections);

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
        background: "#000",
        color: "#fff",
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
          padding: "var(--space-sm) var(--space-md)",
          paddingTop: "calc(var(--space-sm) + env(safe-area-inset-top, 0px))",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
          opacity: controlOpacity,
          pointerEvents: controlPointer,
          transition: "opacity 0.3s ease",
          zIndex: 10,
        }}
      >
        <Link
          href={`/song/${song.id}`}
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "var(--font-size-sm)",
            padding: "var(--space-xs) var(--space-sm)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ✕ Exit
        </Link>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            opacity: 0.6,
          }}
        >
          {song.title}
        </span>
      </div>

      {/* ── Lyrics (continuous scroll) ── */}
      <div
        style={{
          padding: "5rem var(--space-lg) 8rem",
          maxWidth: "48rem",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {entries.map(([key, text]) => (
          <section
            key={key}
            style={{ marginBottom: "var(--space-xl)" }}
          >
            <span
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "var(--space-sm)",
              }}
            >
              {formatLabel(key)}
            </span>
            <p
              style={{
                whiteSpace: "pre-line",
                fontSize: `${FONT_SIZES[fontIdx]}rem`,
                lineHeight: 1.7,
                transition: "font-size 0.2s ease",
              }}
            >
              {text}
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
          gap: "var(--space-md)",
          padding: "var(--space-sm) var(--space-md)",
          paddingBottom: "calc(var(--space-sm) + env(safe-area-inset-bottom, 0px))",
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          opacity: controlOpacity,
          pointerEvents: controlPointer,
          transition: "opacity 0.3s ease",
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
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "var(--radius-full)",
            color: "#fff",
            width: "2.5rem",
            height: "2.5rem",
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
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "var(--radius-full)",
              color: "#fff",
              padding: "var(--space-xs) var(--space-md)",
              height: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
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
            background: autoScroll ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "var(--radius-full)",
            color: "#fff",
            width: "2.5rem",
            height: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {/* scroll/play icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {autoScroll ? (
              <>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </>
            ) : (
              <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([0-9]+)/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}
