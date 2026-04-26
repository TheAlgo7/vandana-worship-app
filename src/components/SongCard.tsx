"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, ChevronRight } from "lucide-react";
import type { SongMeta } from "@/lib/getSongs";

const LONG_PRESS_MS = 500;

export default function SongCard({
  song,
  isFavourite,
  onLongPress,
}: {
  song: SongMeta;
  isFavourite?: boolean;
  onLongPress?: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);
  const [badge, setBadge] = useState<"added" | "removed" | null>(null);

  const startPress = useCallback(() => {
    if (!onLongPress) return;
    didLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      onLongPress();
      setBadge(isFavourite ? "removed" : "added");
      setTimeout(() => setBadge(null), 1400);
    }, LONG_PRESS_MS);
  }, [onLongPress, isFavourite]);

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (didLongPressRef.current) {
        e.preventDefault();
        didLongPressRef.current = false;
      }
    },
    [],
  );

  return (
    <Link
      href={`/song/${song.id}`}
      className="song-card"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 76,
        padding: "16px 0",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
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
            <Heart
              size={10}
              fill="var(--accent)"
              color="var(--accent)"
              strokeWidth={0}
              style={{ opacity: 0.5, flexShrink: 0 }}
            />
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
            }}
          >
            {song.church}
          </span>
        )}
        <ChevronRight size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      </div>

      {/* Long-press badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            right: 28,
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--accent)",
            color: "var(--bg-base)",
            padding: "4px 12px",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "0.02em",
            animation: "fadeUp 180ms ease both",
            pointerEvents: "none",
            zIndex: 10,
            whiteSpace: "nowrap",
          }}
        >
          {badge === "added" ? "♡ Saved" : "♡ Removed"}
        </div>
      )}
    </Link>
  );
}
