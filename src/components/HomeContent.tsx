"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search as MagnifyingGlass, SearchX } from "lucide-react";
import type { SongLibrarySource, SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import DailyVerse from "@/components/DailyVerse";
import AppTitle from "@/components/AppTitle";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useSetlist } from "@/contexts/SetlistContext";
import { useSetlistEnabled } from "@/lib/setlistPreference";
import Link from "next/link";

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinWithin(a: string, b: string, maxDistance: number): boolean {
  if (Math.abs(a.length - b.length) > maxDistance) return false;
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    let rowMin = previous[0];

    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + cost,
      );
      diagonal = above;
      rowMin = Math.min(rowMin, previous[j]);
    }

    if (rowMin > maxDistance) return false;
  }

  return previous[b.length] <= maxDistance;
}

type SearchIndexEntry = {
  song: SongMeta;
  title: string;
  artist: string;
  church: string;
  churchKey: string;
  tags: string;
  metadata: string;
  metadataWords: string[];
  lyrics: string;
};

function fuzzyIncludesPrepared(
  normalizedHaystack: string,
  words: string[],
  normalizedQuery: string,
  queryWords: string[],
): boolean {
  if (!normalizedQuery) return true;
  if (normalizedHaystack.includes(normalizedQuery)) return true;

  if (queryWords.length === 0) return true;

  return queryWords.every((queryWord) => {
    if (queryWord.length < 4) {
      return words.some((word) => word.startsWith(queryWord));
    }
    const distance = queryWord.length > 7 ? 2 : 1;
    return words.some((word) => levenshteinWithin(word, queryWord, distance));
  });
}

function normalizeChurchKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatChurchLabel(value: string): string {
  const normalized = normalizeChurchKey(value);
  if (normalized === "yeshua ministries") return "Yeshua Ministries";
  if (normalized === "icm") return "ICM";

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type SearchMatchKind = "title" | "related";

function createSearchIndexEntry(song: SongMeta): SearchIndexEntry {
  const title = normalizeSearch(song.title);
  const artist = normalizeSearch(song.artist);
  const church = normalizeSearch(song.church ?? "");
  const tags = normalizeSearch(song.tags.join(" "));
  const metadata = [artist, church, tags].filter(Boolean).join(" ");

  return {
    song,
    title,
    artist,
    church,
    churchKey: normalizeChurchKey(song.church ?? ""),
    tags,
    metadata,
    metadataWords: metadata.split(" ").filter(Boolean),
    lyrics: normalizeSearch(song.lyrics_search),
  };
}

function getSearchMatch(
  entry: SearchIndexEntry,
  normalizedQuery: string,
  queryWords: string[],
): SearchMatchKind | null {
  if (!normalizedQuery) return "title";

  if (
    entry.title === normalizedQuery ||
    entry.title.startsWith(normalizedQuery) ||
    entry.title.includes(normalizedQuery)
  ) {
    return "title";
  }

  if (
    fuzzyIncludesPrepared(entry.metadata, entry.metadataWords, normalizedQuery, queryWords) ||
    (normalizedQuery.length >= 3 && entry.lyrics.includes(normalizedQuery))
  ) {
    return "related";
  }

  return null;
}

function getTitleSearchScore(entry: SearchIndexEntry, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;

  if (entry.title === normalizedQuery) return 0;
  if (entry.title.startsWith(normalizedQuery)) return 1;
  if (entry.title.includes(normalizedQuery)) return 2;
  return 3;
}

const SONG_BATCH_SIZE = 80;
const SEARCH_BATCH_SIZE = 36;

export default function HomeContent({
  songs,
  librarySource = "supabase",
}: {
  songs: SongMeta[];
  librarySource?: SongLibrarySource;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeChurchKey, setActiveChurchKey] = useState<string | null>(null);
  const [visibleState, setVisibleState] = useState({ key: "", count: SONG_BATCH_SIZE });
  const searchRef = useRef<HTMLInputElement>(null);
  const { isFavourite, toggleFavourite } = useFavourites();
  const { isInSetlist, toggleSetlist } = useSetlist();
  const [setlistEnabled] = useSetlistEnabled();

  /* Debounce query for expensive fuzzy search */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 120);
    return () => clearTimeout(id);
  }, [query]);

  /* Pull-to-Refresh */
  const pullStartRef = useRef<number | null>(null);
  const pullStartXRef = useRef<number | null>(null);
  const pullLockedOutRef = useRef(false);
  const [pullProgress, setPullProgress] = useState(0);

  /* Recently Viewed */
  const [recentIds, setRecentIds] = useState<string[]>([]);

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
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem("vandana-recently-viewed");
        if (stored) setRecentIds(JSON.parse(stored));
      } catch { /* ignore */ }
    });
  }, []);

  const recentSongs = recentIds
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is SongMeta => !!s);
  const clearRecentSongs = () => {
    setRecentIds([]);
    localStorage.removeItem("vandana-recently-viewed");
  };

  const churches = useMemo(() => {
    const byKey = new Map<string, string>();

    for (const song of songs) {
      if (!song.church) continue;
      const key = normalizeChurchKey(song.church);
      if (!key || byKey.has(key)) continue;
      byKey.set(key, formatChurchLabel(song.church));
    }

    return Array.from(byKey.entries()).map(([key, label]) => ({ key, label }));
  }, [songs]);

  const searchIndex = useMemo(() => songs.map(createSearchIndexEntry), [songs]);
  const normalizedQuery = useMemo(() => normalizeSearch(debouncedQuery), [debouncedQuery]);
  const queryWords = useMemo(
    () => normalizedQuery.split(" ").filter(Boolean),
    [normalizedQuery],
  );

  const searchGroups = useMemo(() => {
    const scopedEntries = activeChurchKey
      ? searchIndex.filter((entry) => entry.churchKey === activeChurchKey)
      : searchIndex;

    if (!normalizedQuery) {
      return {
        best: scopedEntries.map((entry) => entry.song),
        related: [] as SongMeta[],
      };
    }

    const best: SearchIndexEntry[] = [];
    const related: SongMeta[] = [];

    for (const entry of scopedEntries) {
      const matchKind = getSearchMatch(entry, normalizedQuery, queryWords);
      if (matchKind === "title") best.push(entry);
      else if (matchKind === "related") related.push(entry.song);
    }

    best.sort((a, b) => {
      const scoreDiff = getTitleSearchScore(a, normalizedQuery) - getTitleSearchScore(b, normalizedQuery);
      if (scoreDiff !== 0) return scoreDiff;
      return a.song.title.localeCompare(b.song.title);
    });

    return { best: best.map((entry) => entry.song), related };
  }, [searchIndex, normalizedQuery, queryWords, activeChurchKey]);

  const hasSearch = !!normalizedQuery;
  const hasActiveFilters = hasSearch || !!activeChurchKey;
  const filtered = useMemo(
    () => hasSearch ? [...searchGroups.best, ...searchGroups.related] : searchGroups.best,
    [hasSearch, searchGroups],
  );
  const visibleKey = `${normalizedQuery}|${activeChurchKey ?? ""}`;
  const visibleCount = visibleState.key === visibleKey
    ? visibleState.count
    : hasSearch
    ? SEARCH_BATCH_SIZE
    : SONG_BATCH_SIZE;
  const visibleSongs = hasActiveFilters ? filtered.slice(0, visibleCount) : filtered.slice(0, visibleCount);
  const canShowMore = !hasActiveFilters && visibleSongs.length < filtered.length;
  const visibleBestSongs = hasSearch ? searchGroups.best.slice(0, visibleCount) : [];
  const relatedBudget = Math.max(0, visibleCount - visibleBestSongs.length);
  const visibleRelatedSongs = hasSearch ? searchGroups.related.slice(0, relatedBudget) : [];
  const visibleSearchCount = visibleBestSongs.length + visibleRelatedSongs.length;
  const totalSearchCount = searchGroups.best.length + searchGroups.related.length;
  const canShowMoreSearch = hasSearch && visibleSearchCount < totalSearchCount;
  const searchHasGroups = !!normalizedQuery && (searchGroups.best.length > 0 || searchGroups.related.length > 0);

  return (
    <>
      {/* Pull-to-Refresh indicator */}
      {pullProgress > 0 && (
        <div role="status" aria-label="Refreshing" style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", paddingTop: 12 + pullProgress * 28, zIndex: 50, pointerEvents: "none" }}>
          <div aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", transform: `rotate(${pullProgress * 360}deg)`, opacity: Math.min(pullProgress, 1) }} />
        </div>
      )}

      {librarySource !== "supabase" && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(var(--nav-clearance) + 10px)",
            transform: "translateX(-50%)",
            zIndex: 70,
            padding: "9px 12px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border)",
            background: "var(--bg-overlay)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-sm)",
            backdropFilter: "blur(14px)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {librarySource === "cache" ? "Using cached library" : "Using offline library"}
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
          <div className="home-main">
            {/* Daily Verse - inline on mobile (desktop right panel handles it) */}
            <div className="mobile-only">
              <DailyVerse />
            </div>

            {/* Search Bar */}
            <div className="home-search-wrap" style={{ maxWidth: "40rem", margin: "6px auto 0", padding: "0 20px", position: "relative" }}>
              <label htmlFor="search-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                Search songs, artists, and lyrics
              </label>
              <input
                ref={searchRef}
                id="search-input"
                type="search"
                suppressHydrationWarning
                placeholder="Search songs, lyrics..."
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
              <span className="home-search-icon" style={{ position: "absolute", left: 34, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <MagnifyingGlass size={20} strokeWidth={2} />
              </span>
            </div>

            {/* Church Filter */}
            <div role="group" aria-label="Filter by church" className="home-filter-row horizontal-fade-scroll" style={{ display: "flex", gap: 8, margin: "16px auto 0", padding: "0 20px", maxWidth: "40rem", overflowX: "auto", scrollbarWidth: "none" }}>
              <button
                onClick={() => setActiveChurchKey(null)}
                aria-pressed={!activeChurchKey}
                style={{ flexShrink: 0, minHeight: 44, padding: "0 16px", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-pill)", border: "1px solid", borderColor: !activeChurchKey ? "var(--accent)" : "var(--border)", cursor: "pointer", transition: "all var(--transition-fast)", background: !activeChurchKey ? "var(--accent)" : "transparent", color: !activeChurchKey ? "var(--bg-base)" : "var(--text-secondary)" }}
              >
                All
              </button>
              {churches.map((ch) => {
                const active = activeChurchKey === ch.key;
                return (
                  <button
                    key={ch.key}
                    onClick={() => setActiveChurchKey(active ? null : ch.key)}
                    aria-pressed={active}
                    style={{ flexShrink: 0, minHeight: 44, padding: "0 16px", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-pill)", border: "1px solid", borderColor: active ? "var(--accent)" : "var(--border)", cursor: "pointer", transition: "all var(--transition-fast)", background: active ? "var(--accent)" : "transparent", color: active ? "var(--bg-base)" : "var(--text-secondary)" }}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>

            {/* Song List */}
            <main id="main-content" className="home-song-list" style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)" }}>
              {filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", textAlign: "center" }}>
                  <SearchX size={48} strokeWidth={1.2} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                  <p style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "var(--text-xl)", fontWeight: 600, lineHeight: 1.3, margin: 0 }}>
                    {query
                      ? "No matching songs"
                      : activeChurchKey
                      ? "No songs in this filter"
                      : "No songs yet."}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.55, maxWidth: 280, margin: 0 }}>
                    {query
                      ? `Try a shorter lyric phrase, artist name, or clear filters for "${query}". Fuzzy search catches close spellings too.`
                      : activeChurchKey
                      ? "No songs are available for this ministry filter yet."
                      : "The bundled library did not return songs."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setQuery(""); setActiveChurchKey(null); }}
                      style={{ padding: "6px 16px", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-pill)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {searchHasGroups ? (
                    <>
                      {searchGroups.best.length > 0 && (
                        <section className="home-search-section" aria-label="Best song matches">
                          <div className="home-search-section-header">
                            <p className="home-search-section-label">Songs</p>
                            <span>{searchGroups.best.length}</span>
                          </div>
                          {visibleBestSongs.map((song) => (
                            <SongCard
                              key={song.id}
                              song={song}
                              isFavourite={isFavourite(song.id)}
                              onLongPress={() => toggleFavourite(song.id)}
                              onFavouriteToggle={() => toggleFavourite(song.id)}
                              isInSetlist={setlistEnabled && isInSetlist(song.id)}
                              onSetlistToggle={setlistEnabled ? () => toggleSetlist(song.id) : undefined}
                            />
                          ))}
                        </section>
                      )}
                      {visibleRelatedSongs.length > 0 && (
                        <section className="home-search-section" aria-label="Related search matches">
                          <div className="home-search-section-header">
                            <p className="home-search-section-label">More Results</p>
                            <span>{searchGroups.related.length}</span>
                          </div>
                          {visibleRelatedSongs.map((song) => (
                            <SongCard
                              key={song.id}
                              song={song}
                              isFavourite={isFavourite(song.id)}
                              onLongPress={() => toggleFavourite(song.id)}
                              onFavouriteToggle={() => toggleFavourite(song.id)}
                              isInSetlist={setlistEnabled && isInSetlist(song.id)}
                              onSetlistToggle={setlistEnabled ? () => toggleSetlist(song.id) : undefined}
                            />
                          ))}
                        </section>
                      )}
                    </>
                  ) : (
                    visibleSongs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        isFavourite={isFavourite(song.id)}
                        onLongPress={() => toggleFavourite(song.id)}
                        onFavouriteToggle={() => toggleFavourite(song.id)}
                        isInSetlist={setlistEnabled && isInSetlist(song.id)}
                        onSetlistToggle={setlistEnabled ? () => toggleSetlist(song.id) : undefined}
                      />
                    ))
                  )}
                  {canShowMoreSearch && (
                    <button
                      type="button"
                      onClick={() => setVisibleState({ key: visibleKey, count: visibleCount + SEARCH_BATCH_SIZE })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        minHeight: 44,
                        marginTop: 14,
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                        fontSize: "var(--text-sm)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Show more results
                    </button>
                  )}
                  {canShowMore && (
                    <button
                      type="button"
                      onClick={() => setVisibleState({ key: visibleKey, count: visibleCount + SONG_BATCH_SIZE })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        minHeight: 44,
                        marginTop: 14,
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                        fontSize: "var(--text-sm)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Show more songs
                    </button>
                  )}
                </>
              )}
            </main>
          </div>

          {/* RIGHT PANEL - desktop only (CSS hides on mobile) */}
          <aside className="home-side" aria-label="Library info panel">
            {/* Daily Verse */}
            <div className="home-side-card">
              <DailyVerse />
            </div>

            {/* Recently Viewed - vertical list */}
            {recentSongs.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                    Recently Viewed
                  </p>
                  <button
                    type="button"
                    onClick={clearRecentSongs}
                    style={{ border: "none", background: "transparent", color: "var(--accent)", fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer", minHeight: 44, padding: "0 4px" }}
                  >
                    Clear
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {recentSongs.slice(0, 6).map((s) => (
                    <Link
                      key={s.id}
                      href={`/song/${s.id}`}
                      style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "0 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", textDecoration: "none", transition: "border-color var(--transition-fast)" }}
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
            <div style={{ padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Library
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1, margin: 0 }}>
                {songs.length} <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 400, color: "var(--text-muted)" }}>songs</span>
              </p>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}
