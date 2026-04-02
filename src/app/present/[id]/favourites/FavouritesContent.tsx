"use client";

import { useFavourites } from "@/contexts/FavouritesContext";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";

export default function FavouritesContent({ songs }: { songs: SongMeta[] }) {
  const { favourites } = useFavourites();

  /* keep the order the user added them (favourites array order) */
  const favSongs = favourites
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean) as SongMeta[];

  if (favSongs.length === 0) {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Large heart icon */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--accent)", opacity: 0.4 }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            color: "var(--text-primary)",
            marginTop: 16,
            fontWeight: 600,
          }}
        >
          No favourites yet
        </p>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Tap the ♡ on any song to save it here
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 20px", paddingTop: 24, paddingBottom: 120 }}>
      {/* Section label */}
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--accent)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        Favourites
      </p>

      {/* Song list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {favSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  );
}
