import Link from "next/link";
import type { SongMeta } from "@/lib/getSongs";

export default function SongCard({ song }: { song: SongMeta }) {
  return (
    <Link
      href={`/song/${song.id}`}
      className="song-card"
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 72,
        padding: "14px 0",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Left: title + artist */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.title}
        </h2>
        <p
          style={{
            fontSize: "var(--text-xs)",
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
            }}
          >
            {song.church}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
