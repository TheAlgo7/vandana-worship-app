"use client";

import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";

export default function HomeContent({ songs }: { songs: SongMeta[] }) {
  const [query, setQuery] = useState("");
  const [activeChurch, setActiveChurch] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /* derive unique churches */
  const churches = Array.from(new Set(songs.map((s) => s.church).filter(Boolean)));

  /* filter songs */
  const filtered = songs.filter((s) => {
    const matchesChurch = !activeChurch || s.church === activeChurch;
    if (!matchesChurch) return false;
    if (!query.trim()) return true;
    const normalize = (value: string) => value.toLocaleLowerCase().normalize("NFKC");
    const q = normalize(query.trim());
    const searchable = `${s.title} ${s.artist} ${s.church}`;
    return normalize(searchable).includes(q);
  });

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.28, ease: "easeOut" as const },
    },
  };

  return (
    <>
      {/* ── Search Bar ── */}
      <div
        style={{
          maxWidth: "40rem",
          margin: "0 auto var(--space-md)",
          position: "relative",
        }}
      >
        <input
          ref={searchRef}
          id="search-input"
          type="search"
          placeholder="Search songs, artists…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem 0.75rem 2.75rem",
            fontSize: "var(--font-size-base)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-full)",
            outline: "none",
            transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-primary-soft)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {/* Search icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* ── Church Pills ── */}
      {churches.length > 0 && (
        <div
          style={{
            maxWidth: "40rem",
            margin: "0 auto var(--space-lg)",
            display: "flex",
            gap: "var(--space-sm)",
            overflowX: "auto",
            paddingBottom: "var(--space-xs)",
            scrollbarWidth: "none",
          }}
        >
          {/* "All" pill */}
          <button
            onClick={() => setActiveChurch(null)}
            style={{
              flexShrink: 0,
              padding: "0.375rem 1rem",
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              background: !activeChurch ? "var(--color-primary)" : "var(--color-surface)",
              color: !activeChurch ? "var(--color-text-inverse)" : "var(--color-text-muted)",
            }}
          >
            All
          </button>
          {churches.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChurch(activeChurch === ch ? null : ch)}
              style={{
                flexShrink: 0,
                padding: "0.375rem 1rem",
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                background: activeChurch === ch ? "var(--color-primary)" : "var(--color-surface)",
                color: activeChurch === ch ? "var(--color-text-inverse)" : "var(--color-text-muted)",
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {/* ── Song Grid ── */}
      <motion.main
        variants={listVariants}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          display: "grid",
          gap: "var(--space-md)",
          paddingBottom: "5rem", /* space for bottom nav */
        }}
      >
        {filtered.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-muted)",
              padding: "var(--space-xl) 0",
            }}
          >
            {query || activeChurch ? "No songs match your search." : "No songs yet."}
          </p>
        ) : (
          filtered.map((song) => (
            <motion.div
              key={song.id}
              variants={itemVariants}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            >
              <SongCard song={song} />
            </motion.div>
          ))
        )}
      </motion.main>
    </>
  );
}
