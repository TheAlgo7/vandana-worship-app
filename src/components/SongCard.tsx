import Link from "next/link";
import { Heart, ChevronRight } from "lucide-react";
import type { SongMeta } from "@/lib/getSongs";

export default function SongCard({ song, isFavourite }: { song: SongMeta; isFavourite?: boolean }) {
  return (
    <Link
      href={`/song/${song.id}`}
      className="song-card"
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 76,
        padding: "16px 0",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Accent pill */}
      <div
        style={{
          width: 3,
          height: 28,
          borderRadius: 2,
          background: "var(--accent)",
          flexShrink: 0,
          marginRight: 14,
          opacity: 0.45,
        }}
      />

      {/* Left: title + artist */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {song.title}
          {isFavourite && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="var(--accent)"
              stroke="none"
              style={{ opacity: 0.5, flexShrink: 0 }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          )}
        </h2>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.artist}
        </p>
      </div>

      {/* Right: church + chevron */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        {song.church && (
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              maxWidth: 100,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
                <ChevronRight size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}
