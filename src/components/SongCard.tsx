import Link from "next/link";
import type { SongMeta } from "@/lib/getSongs";

export default function SongCard({ song }: { song: SongMeta }) {
  return (
    <Link
      href={`/song/${song.id}`}
      style={{
        display: "block",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-card)",
        transition: "box-shadow var(--transition-fast), transform var(--transition-fast)",
        textDecoration: "none",
        color: "inherit",
      }}
      className="hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
    >
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--font-size-lg)",
          fontWeight: 600,
          marginBottom: "var(--space-xs)",
        }}
      >
        {song.title}
      </h2>

      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-muted)",
        }}
      >
        {song.artist}
      </p>

      {song.tags.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-xs)", marginTop: "var(--space-sm)", flexWrap: "wrap" }}>
          {song.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                background: "var(--color-tag-bg)",
                color: "var(--color-tag-text)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
