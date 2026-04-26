"use client";

import { useFavourites } from "@/contexts/FavouritesContext";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import { HeartOff } from "lucide-react";

export default function FavouritesContent({ songs }: { songs: SongMeta[] }) {
  const { favourites } = useFavourites();

  const favSongs = favourites
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean) as SongMeta[];

  return (
    <>
      {/* Sticky page header */}
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
        <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>
          Favourites
        </h1>
        {favSongs.length > 0 && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
            {favSongs.length} {favSongs.length === 1 ? "song" : "songs"}
          </span>
        )}
      </header>

      {favSongs.length === 0 ? (
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
          <HeartOff size={40} strokeWidth={1.5} style={{ color: "var(--accent)", opacity: 0.4 }} />
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
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Tap the &#9825; on any song to save it here
          </p>
        </div>
      ) : (
        <main style={{ padding: "0 20px", paddingTop: 20, paddingBottom: "calc(var(--nav-clearance) + 16px)", maxWidth: "40rem", margin: "0 auto" }}>
          {favSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </main>
      )}
    </>
  );
}
