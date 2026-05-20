"use client";

import { useRef, useState, useCallback, memo } from "react";
import Link from "next/link";
import { Heart, ListPlus, ListX, ChevronRight } from "lucide-react";
import type { SongMeta } from "@/lib/getSongs";

const LONG_PRESS_MS = 500;

const SongCard = memo(function SongCard({
  song,
  isFavourite,
  onLongPress,
  onFavouriteToggle,
  isInSetlist,
  onSetlistToggle,
}: {
  song: SongMeta;
  isFavourite?: boolean;
  onLongPress?: () => void;
  onFavouriteToggle?: () => void;
  isInSetlist?: boolean;
  onSetlistToggle?: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);
  const [badge, setBadge] = useState<"added" | "removed" | null>(null);

  const showBadge = useCallback((nextFavourite: boolean) => {
    setBadge(nextFavourite ? "added" : "removed");
    setTimeout(() => setBadge(null), 1400);
  }, []);

  const startPress = useCallback(() => {
    if (!onLongPress) return;
    didLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      onLongPress();
      showBadge(!isFavourite);
    }, LONG_PRESS_MS);
  }, [onLongPress, isFavourite, showBadge]);

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didLongPressRef.current) {
      e.preventDefault();
      didLongPressRef.current = false;
    }
  }, []);

  const handleFavouriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      cancelPress();
      onFavouriteToggle?.();
      showBadge(!isFavourite);
    },
    [cancelPress, isFavourite, onFavouriteToggle, showBadge],
  );

  const handleSetlistClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      cancelPress();
      onSetlistToggle?.();
    },
    [cancelPress, onSetlistToggle],
  );

  return (
    <div
      className="song-card"
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 76,
        padding: "16px 0",
        color: "inherit",
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <Link
        href={`/song/${song.id}`}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
          minHeight: 44,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {song.title}
            </span>
            {isFavourite && (
              <Heart
                size={10}
                fill="var(--accent)"
                color="var(--accent)"
                strokeWidth={0}
                aria-hidden="true"
                style={{ opacity: 0.5, flexShrink: 0, minWidth: 10 }}
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

        <div
          className="song-card-trailing"
          style={{
            alignItems: "center",
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
        </div>
        <span
          className="song-card-chevron"
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 44,
            marginLeft: 8,
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          <ChevronRight size={20} />
        </span>
      </Link>

      {onFavouriteToggle && (
        <button
          type="button"
          onClick={handleFavouriteClick}
          aria-pressed={!!isFavourite}
          aria-label={isFavourite ? `Remove ${song.title} from favourites` : `Add ${song.title} to favourites`}
          title={isFavourite ? "Remove favourite" : "Add favourite"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            marginLeft: 6,
            border: "none",
            borderRadius: "var(--radius-pill)",
            background: isFavourite ? "var(--accent-dim)" : "transparent",
            color: isFavourite ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "color var(--transition-fast), background var(--transition-fast)",
          }}
        >
          <Heart
            size={19}
            fill={isFavourite ? "var(--accent)" : "none"}
            strokeWidth={isFavourite ? 1.8 : 1.6}
            aria-hidden="true"
          />
        </button>
      )}

      {onSetlistToggle && (
        <button
          type="button"
          onClick={handleSetlistClick}
          aria-pressed={!!isInSetlist}
          aria-label={isInSetlist ? `Remove ${song.title} from setlist` : `Add ${song.title} to setlist`}
          title={isInSetlist ? "Remove from setlist" : "Add to setlist"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            marginLeft: 2,
            border: "none",
            borderRadius: "var(--radius-pill)",
            background: isInSetlist ? "var(--accent-dim)" : "transparent",
            color: isInSetlist ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "color var(--transition-fast), background var(--transition-fast)",
          }}
        >
          {isInSetlist ? (
            <ListX size={19} strokeWidth={1.7} aria-hidden="true" />
          ) : (
            <ListPlus size={19} strokeWidth={1.7} aria-hidden="true" />
          )}
        </button>
      )}

      {badge && (
        <div
          style={{
            position: "absolute",
            right: onFavouriteToggle || onSetlistToggle ? 54 : 28,
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
          {badge === "added" ? "Saved" : "Removed"}
        </div>
      )}
    </div>
  );
});

export default SongCard;
