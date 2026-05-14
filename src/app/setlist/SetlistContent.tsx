"use client";

import Link from "next/link";
import { ListMusic, Play, Trash2 } from "lucide-react";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useSetlist } from "@/contexts/SetlistContext";

export default function SetlistContent({ songs }: { songs: SongMeta[] }) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const { setlist, isInSetlist, toggleSetlist, clearSetlist } = useSetlist();

  const setlistSongs = setlist
    .map((id) => songs.find((song) => song.id === id))
    .filter((song): song is SongMeta => !!song);
  const firstSong = setlistSongs[0];

  return (
    <>
      <header
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
          Setlist
        </h1>
        {setlistSongs.length > 0 && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
            {setlistSongs.length} {setlistSongs.length === 1 ? "song" : "songs"}
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
            Build tonight&apos;s flow
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55, maxWidth: 300 }}>
            Add songs from the library, then present them in order during worship.
          </p>
          <Link
            href="/"
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
            Browse songs
          </Link>
        </div>
      ) : (
        <main className="page-list-main" style={{ padding: "20px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)", maxWidth: "40rem", margin: "0 auto" }}>
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
                Present setlist
              </Link>
            )}
            <button
              type="button"
              onClick={clearSetlist}
              aria-label="Clear setlist"
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

          {setlistSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isFavourite={isFavourite(song.id)}
              onFavouriteToggle={() => toggleFavourite(song.id)}
              isInSetlist={isInSetlist(song.id)}
              onSetlistToggle={() => toggleSetlist(song.id)}
            />
          ))}
        </main>
      )}
    </>
  );
}
