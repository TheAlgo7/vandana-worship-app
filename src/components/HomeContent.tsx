"use client";

import { useState, useRef, useEffect } from "react";
import { Search as MagnifyingGlass, SearchX } from "lucide-react";
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

  /* Pull-to-refresh (mobile touch only) */
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
      {/* Pull-to-Refresh indicator */}
      {pullProgress > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", paddingTop: 12 + pullProgress * 28, zIndex: 50, pointerEvents: "none" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", transform: `rotate(${pullProgress * 360}deg)`, opacity: Math.min(pullProgress, 1) }} />
        </div>
      )}

      {/* Mobile-only app title (desktop sidebar shows the wordmark) */}
      <div className="mobile-only">
        <header style={{ display: "flex", flexDirection: "column", minHeight: 56, padding: "14px 20px 0", maxWidth: "40rem", margin: "0 auto" }}>
          <AppTitle />
        </header>
      </div>

      {/* Layout: single-col on mobile, two-col grid on desktop */}
      <div className="home-grid-outer">
        <div className="home-grid">

          {/* MAIN COLUMN */}
          <div>
            {/* Daily Verse — inline on mobile (desktop right panel handles it) */}
            <div className="mobile-only">
              <DailyVerse />
            </div>

            {/* Search Bar */}
            <div style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px", position: "relative" }}>
              <label htmlFor="search-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                Search songs and artists
              </label>
              <input
                ref={searchRef}
                id="search-input"
                type="search"
                suppressHydrationWarning
                placeholder="Search songs, artists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "52px",
                  paddingTop: 0,
                  paddingRight: "16px",
                  paddingBottom: 0,
                  paddingLeft: "48px",
                  fontSize: "var(--text-sm)",
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-pill)",
                  outlineStyle: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
                  transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <span style={{ position: "absolute", left: 34, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <MagnifyingGlass size={20} strokeWidth={2} />
              </span>
            </div>

            {/* Recently Viewed — horizontal chips (mobile only) */}
            {recentSongs.length > 0 && (
              <div className="mobile-only" style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px" }}>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" }}>
                  Recently Viewed
                </p>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
                  {recentSongs.map((s) => (
                    <Link
                      key={s.id}
                      href={`/song/${s.id}`}
                      style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "0 14px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", textDecoration: "none", maxWidth: 160, flexShrink: 0 }}
                    >
                      <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                        {s.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Church Filter */}
            <div style={{ display: "flex", gap: 8, margin: "16px auto 0", padding: "0 20px", maxWidth: "40rem", overflowX: "auto", scrollbarWidth: "none" }}>
              <button
                onClick={() => setActiveChurch(null)}
                aria-pressed={!activeChurch}
                style={{ flexShrink: 0, minHeight: 44, padding: "0 16px", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-pill)", border: "1px solid", borderColor: !activeChurch ? "var(--accent)" : "var(--border)", cursor: "pointer", transition: "all var(--transition-fast)", background: !activeChurch ? "var(--accent)" : "transparent", color: !activeChurch ? "var(--bg-base)" : "var(--text-secondary)" }}
              >
                All
              </button>
              {churches.map((ch) => {
                const active = activeChurch === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setActiveChurch(active ? null : ch)}
                    aria-pressed={active}
                    style={{ flexShrink: 0, minHeight: 44, padding: "0 16px", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-pill)", border: "1px solid", borderColor: active ? "var(--accent)" : "var(--border)", cursor: "pointer", transition: "all var(--transition-fast)", background: active ? "var(--accent)" : "transparent", color: active ? "var(--bg-base)" : "var(--text-secondary)" }}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>

            {/* Song List */}
            <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)" }}>
              {filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", textAlign: "center" }}>
                  <SearchX size={48} strokeWidth={1.2} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                    {query
                      ? `No songs found for "${query}"`
                      : activeChurch
                      ? `No songs from ${activeChurch} yet.`
                      : "No songs yet."}
                  </p>
                  {(query || activeChurch) && (
                    <button
                      onClick={() => { setQuery(""); setActiveChurch(null); }}
                      style={{ padding: "6px 16px", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-pill)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                filtered.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    isFavourite={isFavourite(song.id)}
                    onLongPress={() => toggleFavourite(song.id)}
                  />
                ))
              )}
            </main>
          </div>

          {/* RIGHT PANEL — desktop only (CSS hides on mobile) */}
          <aside className="home-side" aria-label="Library info panel">
            {/* Daily Verse */}
            <div className="home-side-card">
              <DailyVerse />
            </div>

            {/* Recently Viewed — vertical list */}
            {recentSongs.length > 0 && (
              <div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Recently Viewed
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {recentSongs.slice(0, 6).map((s) => (
                    <Link
                      key={s.id}
                      href={`/song/${s.id}`}
                      style={{ display: "flex", alignItems: "center", minHeight: 40, padding: "0 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", textDecoration: "none", transition: "border-color var(--transition-fast)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                    >
                      <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                        {s.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Library count */}
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>
              {songs.length} songs in the library
            </p>
          </aside>

        </div>
      </div>
    </>
  );
}
