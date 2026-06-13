"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ListMusic, Play, Trash2 } from "lucide-react";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useSetlist } from "@/contexts/SetlistContext";
import { useUIStrings } from "@/lib/uiStrings";
import DailyVerse from "@/components/DailyVerse";

export default function SetlistContent({ songs }: { songs: SongMeta[] }) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const { setlist, isInSetlist, toggleSetlist, clearSetlist, moveInSetlist } = useSetlist();
  const { t } = useUIStrings();

  const setlistSongs = setlist
    .map((id) => songs.find((song) => song.id === id))
    .filter((song): song is SongMeta => !!song);
  const firstSong = setlistSongs[0];

  return (
    <>
      <header
        className="page-sticky-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 600, letterSpacing: 0, margin: 0 }}>
          {t.setlistTitle}
        </h1>
        {setlistSongs.length > 0 && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
            {setlistSongs.length} {setlistSongs.length === 1 ? t.songWord : t.songsWord}
          </span>
        )}
      </header>

      {setlistSongs.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <ListMusic size={42} strokeWidth={1.4} style={{ color: "var(--accent)", opacity: 0.45 }} />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              color: "var(--text-primary)",
              marginTop: 16,
              fontWeight: 600,
            }}
          >
            {t.setlistEmptyTitle}
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55, maxWidth: 300 }}>
            {t.setlistEmptyBody}
          </p>
          <Link
            href="/app"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 44,
              padding: "0 16px",
              marginTop: 20,
              borderRadius: "var(--radius-pill)",
              background: "var(--accent)",
              color: "var(--bg-base)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <ListMusic size={16} aria-hidden="true" />
            {t.browseSongs}
          </Link>
        </div>
      ) : (
        <div className="page-desktop-grid">
        <main className="page-list-main" style={{ padding: "20px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {firstSong && (
              <Link
                href={`/present/${firstSong.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 44,
                  flex: 1,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--accent)",
                  color: "var(--bg-base)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <Play size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                {t.presentSetlist}
              </Link>
            )}
            <button
              type="button"
              onClick={clearSetlist}
              aria-label={t.clearSetlist}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </div>

          {setlistSongs.map((song, index) => (
            <div key={song.id} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Reorder column — worship sets have an order */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 40 }}>
                <button
                  type="button"
                  onClick={() => moveInSetlist(song.id, -1)}
                  disabled={index === 0}
                  aria-label={`${t.moveUp}: ${song.title}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 30,
                    border: "none",
                    background: "transparent",
                    color: index === 0 ? "var(--border)" : "var(--text-secondary)",
                    cursor: index === 0 ? "default" : "pointer",
                    padding: 0,
                  }}
                >
                  <ChevronUp size={17} aria-hidden="true" />
                </button>
                <span aria-hidden="true" style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }}>
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => moveInSetlist(song.id, 1)}
                  disabled={index === setlistSongs.length - 1}
                  aria-label={`${t.moveDown}: ${song.title}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 30,
                    border: "none",
                    background: "transparent",
                    color: index === setlistSongs.length - 1 ? "var(--border)" : "var(--text-secondary)",
                    cursor: index === setlistSongs.length - 1 ? "default" : "pointer",
                    padding: 0,
                  }}
                >
                  <ChevronDown size={17} aria-hidden="true" />
                </button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SongCard
                  song={song}
                  isFavourite={isFavourite(song.id)}
                  onFavouriteToggle={() => toggleFavourite(song.id)}
                  isInSetlist={isInSetlist(song.id)}
                  onSetlistToggle={() => toggleSetlist(song.id)}
                />
              </div>
            </div>
          ))}
        </main>
        <aside className="page-aside-col" aria-label="Daily verse">
          <div className="page-aside-card">
            <DailyVerse />
          </div>
        </aside>
        </div>
      )}
    </>
  );
}

