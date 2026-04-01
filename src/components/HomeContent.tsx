"use client";

import { useState, useRef, useEffect } from "react";
import type { SongMeta } from "@/lib/getSongs";
import SongCard from "@/components/SongCard";
import Link from "next/link";

export default function HomeContent({ songs }: { songs: SongMeta[] }) {
  const [query, setQuery] = useState("");
  const [activeChurch, setActiveChurch] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [defaultLang, setDefaultLang] = useState("hinglish");

  useEffect(() => {
    const stored = localStorage.getItem("vandana-default-lang");
    if (stored === "hindi" || stored === "hinglish") setDefaultLang(stored);
  }, []);

  const churches = Array.from(
    new Set(songs.map((s) => s.church).filter(Boolean))
  );

  const filtered = songs.filter((s) => {
    const matchesChurch = !activeChurch || s.church === activeChurch;
    if (!matchesChurch) return false;
    if (!query.trim()) return true;
    const normalize = (v: string) => v.toLocaleLowerCase().normalize("NFKC");
    const q = normalize(query.trim());
    return normalize(`${s.title} ${s.artist} ${s.church}`).includes(q);
  });

  return (
    <>
      {/* ── Top Bar ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          padding: "0 20px",
          maxWidth: "40rem",
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "-0.02em",
          }}
        >
          Vandana
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          style={{ color: "var(--text-secondary)", padding: 6 }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      {/* ── Greeting ── */}
      <section
        style={{
          padding: "8px 20px 0",
          maxWidth: "40rem",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            marginBottom: 4,
          }}
        >
          {new Date().getHours() < 12
            ? "Good morning"
            : new Date().getHours() < 17
              ? "Good afternoon"
              : "Good evening"}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "26px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          What would you like
          <br />
          to worship?
        </h1>

        {/* Radial accent glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            opacity: 0.08,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      </section>

      {/* ── Search Bar ── */}
      <div
        style={{
          maxWidth: "40rem",
          margin: "20px auto 16px",
          padding: "0 20px",
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
            height: 52,
            padding: "0 16px 0 48px",
            fontSize: "var(--text-sm)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-pill)",
            outline: "none",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
            transition:
              "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px var(--accent-dim)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <svg
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
            left: 36,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* ── Church Chips ── */}
      {churches.length > 0 && (
        <div
          style={{
            maxWidth: "40rem",
            margin: "0 auto 20px",
            padding: "0 20px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <button
            onClick={() => setActiveChurch(null)}
            style={{
              flexShrink: 0,
              padding: "6px 16px",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              borderRadius: "var(--radius-pill)",
              border: "1px solid",
              borderColor: !activeChurch ? "var(--accent)" : "var(--border)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              background: !activeChurch ? "var(--accent)" : "transparent",
              color: !activeChurch
                ? "var(--bg-base)"
                : "var(--text-secondary)",
            }}
          >
            All
          </button>
          {churches.map((ch) => {
            const active = activeChurch === ch;
            return (
              <button
                key={ch}
                onClick={() => setActiveChurch(active ? null : ch)}
                style={{
                  flexShrink: 0,
                  padding: "6px 16px",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--bg-base)" : "var(--text-secondary)",
                }}
              >
                {ch}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Song List ── */}
      <main
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "0 20px",
          paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 24px)",
        }}
      >
        {filtered.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              padding: "48px 0",
              fontSize: "var(--text-sm)",
            }}
          >
            {query || activeChurch
              ? "No songs match your search."
              : "No songs yet."}
          </p>
        ) : (
          filtered.map((song) => <SongCard key={song.id} song={song} />)
        )}
      </main>
    </>
  );
}
