"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Pause, X } from "lucide-react";
import type { Song, Language } from "@/lib/getSongs";
import { formatSectionLabel, getOrderedSectionEntries } from "@/lib/lyricsSections";
import {
  getOrderedLanguages,
  getStoredDefaultLanguage,
  pickPreferredLanguage,
} from "@/lib/languagePreference";
import LyricsBlock from "@/components/LyricsBlock";
import { useSetlist } from "@/contexts/SetlistContext";

const FONT_SIZES = [1.25, 1.75, 2.5] as const; // small, medium, large (rem)
const FONT_LABELS = ["A", "A", "A"] as const;
const SCROLL_SPEEDS = [18, 30, 48] as const; // px per second: slow, medium, fast
const SCROLL_SPEED_LABELS = ["1×", "2×", "3×"] as const;

export default function PresentView({ song }: { song: Song }) {
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
  const [showControls, setShowControls] = useState(true);
  const [fontIdx, setFontIdx] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // default to medium
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

  /* keyboard: Escape exits, Space toggles controls, arrows walk the setlist
     (worship leaders often present from a laptop hooked to a projector) */
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") window.history.back();
      if (e.key === " ") {
        e.preventDefault();
        setShowControls((p) => !p);
      }
      if (e.key === "ArrowRight" && nextSetlistId) {
        router.push(`/present/${nextSetlistId}`);
      }
      if (e.key === "ArrowLeft" && prevSetlistId) {
        router.push(`/present/${prevSetlistId}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, nextSetlistId, prevSetlistId]);

  /* cycle language */
  const cycleLang = useCallback(() => {
    const langs = getOrderedLanguages(song.languages_available);
    if (langs.length < 2) return;
    const i = langs.indexOf(lang);
    setLang(langs[(i + 1) % langs.length]);
  }, [lang, setLang, song.languages_available]);

  /* auto-scroll — frame-rate independent (px/second, accumulates sub-pixels) */
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    const el = scrollRef.current;
    const pxPerSec = SCROLL_SPEEDS[speedIdx];
    let last = performance.now();
    let remainder = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      remainder += (pxPerSec * dt) / 1000;
      const whole = Math.floor(remainder);
      if (whole > 0) {
        el.scrollTop += whole;
        remainder -= whole;
      }
      autoScrollRef.current = requestAnimationFrame(tick);
    };
    autoScrollRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [autoScroll, lang, speedIdx]);

  /* keep the screen awake while projecting (re-acquire when tab refocuses) */
  useEffect(() => {
    type WakeLockSentinelLike = { release: () => Promise<void> };
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock) return;

    const acquire = async () => {
      try {
        sentinel = await nav.wakeLock!.request("screen");
      } catch {
        /* denied (e.g. low battery) — silently continue */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, []);

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
      {/* Screen-reader announcement for auto-scroll state */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        {autoScroll ? "Auto-scroll on" : ""}
      </div>

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
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            color: "var(--present-text)",
            textDecoration: "none",
            fontSize: "var(--text-sm)",
            padding: "0 12px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <X size={16} aria-hidden="true" /> Exit
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
            <LyricsBlock
              text={text}
              className="present-lyrics-block"
              style={{
                wordBreak: "keep-all",
                overflowWrap: "break-word",
                paddingLeft: 20,
                paddingRight: 20,
                fontSize: `${FONT_SIZES[fontIdx]}rem`,
                lineHeight: 1.7,
              }}
            />
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
            background: autoScroll ? "var(--accent-dim)" : "var(--present-control-bg)",
            border: autoScroll ? "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" : "1px solid var(--present-control-border)",
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

        {/* Auto-scroll speed (only while scrolling) */}
        {autoScroll && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSpeedIdx((i) => (i + 1) % SCROLL_SPEEDS.length);
            }}
            aria-label={`Scroll speed ${SCROLL_SPEED_LABELS[speedIdx]}`}
            style={{
              background: "var(--present-control-bg)",
              border: "1px solid var(--present-control-border)",
              borderRadius: "var(--radius-pill)",
              color: "var(--present-text)",
              minWidth: 44,
              height: 44,
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
            }}
          >
            {SCROLL_SPEED_LABELS[speedIdx]}
          </button>
        )}

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
