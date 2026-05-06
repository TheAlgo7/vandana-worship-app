"use client";

import { useState, useRef, useEffect } from "react";
import { Search as MagnifyingGlass, ChevronRight, SearchX } from "lucide-react";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import DailyVerse from "@/components/DailyVerse";
import AppTitle from "@/components/AppTitle";
import { useFavourites } from "@/contexts/FavouritesContext";
import Link from "next/link";

export default function HomeContent({ songs }: { songs: SongMeta[] }) {
  const [query, setQuery] = useState("");
  const [activeChurch, setActiveChurch] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [defaultLang, setDefaultLang] = useState("hinglish");
  const { isFavourite, toggleFavourite } = useFavourites();

  /* Pull-to-Refresh */
  const pullStartRef = useRef<number | null>(null);
  const pullStartXRef = useRef<number | null>(null);
  const pullLockedOutRef = useRef(false);
  const [pullProgress, setPullProgress] = useState(0);

  /* Recently Viewed */
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("vandana-default-lang");
    if (stored === "hindi" || stored === "hinglish") setDefaultLang(stored);
  }, []);

  /* Pull-to-refresh (mobile touch) */
  useEffect(() => {
    let currentPull = 0;
    const THRESHOLD = 70;
    const prev = document.body.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = "contain";

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) {
        pullStartRef.current = e.touches[0].clientY;
        pullStartXRef.current = e.touches[0].clientX;
        pullLockedOutRef.current = false;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (pullStartRef.current === null) return;
      if (pullLockedOutRef.current) return;
      const dy = e.touches[0].clientY - pullStartRef.current;
      const dx = Math.abs(e.touches[0].clientX - (pullStartXRef.current ?? 0));
      // If the gesture is more horizontal than vertical, lock out pull-to-refresh
      // for this touch sequence so horizontal scrolling (e.g. recently viewed) never fires a reload
      if (dx > 8 && dx > Math.abs(dy)) {
        pullLockedOutRef.current = true;
        currentPull = 0;
        setPullProgress(0);
        return;
      }
      if (dy > 0) { currentPull = dy; setPullProgress(Math.min(dy / THRESHOLD, 1.5)); }
      else { currentPull = 0; setPullProgress(0); }
    };
    const onTouchEnd = () => {
      if (!pullLockedOutRef.current && currentPull >= THRESHOLD) window.location.reload();
      pullStartRef.current = null;
      pullStartXRef.current = null;
      pullLockedOutRef.current = false;
      currentPull = 0;
      setPullProgress(0);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.body.style.overscrollBehaviorY = prev;
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  /* Recently viewed songs */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vandana-recently-viewed");
      if (stored) setRecentIds(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const recentSongs = recentIds
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is SongMeta => !!s);

  const churches = Array.from(
    new Set(songs.map((s) => s.church).filter(Boolean))
  );

  const filtered = songs.filter((s) => {
    const matchesQuery =
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist?.toLowerCase().includes(query.toLowerCase());
    const matchesChurch = !activeChurch || s.church === activeChurch;
    return matchesQuery && matchesChurch;
  });

  return (
    <>
      {/* ── Pull-to-Refresh indicator ── */}
      {pullProgress > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            paddingTop: 12 + pullProgress * 28,
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              transform: `rotate(${pullProgress * 360}deg)`,
              opacity: Math.min(pullProgress, 1),
            }}
          />
        </div>
      )}

      {/* ── Top Bar ── */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 56,
          padding: "14px 20px 0",
          maxWidth: "40rem",
          margin: "0 auto",
        }}
      >
        <AppTitle />
      </header>

      {/* ── Daily Verse ── */}
      <DailyVerse />

      {/* ── Search Bar ── */}
      <div
        style={{
          maxWidth: "40rem",
          margin: "16px auto 0",
          padding: "0 20px",
          position: "relative",
        }}
      >
        <input
          ref={searchRef}
          id="search-input"
          type="search"
          placeholder="Search songs, artists…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            height: 52,
            padding: "0 16px 0 48px",
            fontSize: "var(--text-sm)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-pill)",
            outline: "none",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
            transition:
              "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px var(--accent-dim)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 34,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <MagnifyingGlass size={20} strokeWidth={2} />
        </span>
      </div>

      {/* ── Recently Viewed ── */}
      {recentSongs.length > 0 && (
        <div
          style={{
            maxWidth: "40rem",
            margin: "16px auto 0",
            padding: "0 20px",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 8px 0",
            }}
          >
            Recently Viewed
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              scrollbarWidth: "none",
              paddingBottom: 2,
            }}
          >
            {recentSongs.map((s) => (
              <Link
                key={s.id}
                href={`/song/${s.id}`}
                style={{
                  padding: "8px 14px",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  maxWidth: 160,
                }}
              >
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  {s.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Church Filter ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          margin: "16px auto 0",
          padding: "0 20px",
          maxWidth: "40rem",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <button
          onClick={() => setActiveChurch(null)}
          style={{
            flexShrink: 0,
            padding: "6px 16px",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            borderRadius: "var(--radius-pill)",
            border: "1px solid",
            borderColor: !activeChurch ? "var(--accent)" : "var(--border)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            background: !activeChurch ? "var(--accent)" : "transparent",
            color: !activeChurch
              ? "var(--bg-base)"
              : "var(--text-secondary)",
          }}
        >
          All
        </button>
        {churches.map((ch) => {
          const active = activeChurch === ch;
          return (
            <button
              key={ch}
              onClick={() => setActiveChurch(active ? null : ch)}
              style={{
                flexShrink: 0,
                padding: "6px 16px",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                borderRadius: "var(--radius-pill)",
                border: "1px solid",
                borderColor: active ? "var(--accent)" : "var(--border)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--bg-base)" : "var(--text-secondary)",
              }}
            >
              {ch}
            </button>
          );
        })}
      </div>

      {/* ── Song List ── */}
      <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 20px" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <SearchX
              size={48}
              strokeWidth={1.2}
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--text-sm)",
                lineHeight: 1.5,
              }}
            >
              {query
                ? `No songs found for \u201c${query}\u201d`
                : activeChurch
                ? `No songs from ${activeChurch} yet.`
                : "No songs yet."}
            </p>
            {(query || activeChurch) && (
              <button
                onClick={() => {
                  setQuery("");
                  setActiveChurch(null);
                }}
                style={{
                  padding: "6px 16px",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) :
          filtered.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isFavourite={isFavourite(song.id)}
              onLongPress={() => toggleFavourite(song.id)}
            />
          ))
        }
      </main>
    </>
  );
}

