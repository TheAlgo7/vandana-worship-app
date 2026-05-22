"use client";

import { useFavourites } from "@/contexts/FavouritesContext";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import Link from "next/link";
import { HeartOff, Search } from "lucide-react";
import DailyVerse from "@/components/DailyVerse";

export default function FavouritesContent({ songs }: { songs: SongMeta[] }) {
  const { favourites, toggleFavourite, isFavourite } = useFavourites();

  const favSongs = favourites
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean) as SongMeta[];

  return (
    <>
      {/* Sticky page header */}
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
            Tap the heart beside any song to keep it ready for worship.
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
            <Search size={16} aria-hidden="true" />
            Browse songs
          </Link>
        </div>
      ) : (
        <div className="page-desktop-grid">
          <main id="main-content" className="page-list-main" style={{ padding: "0 20px", paddingTop: 20, paddingBottom: "calc(var(--nav-clearance) + 16px)" }}>
            {favSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isFavourite={isFavourite(song.id)}
                onFavouriteToggle={() => toggleFavourite(song.id)}
              />
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

