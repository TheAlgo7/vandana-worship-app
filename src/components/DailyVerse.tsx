"use client";

import { useState, useEffect } from "react";
import verses from "@/data/verses.json";

type Period = "morning" | "afternoon" | "evening" | "night";

function getPeriod(hour: number): Period {
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 20) return "evening";
  return "night";
}

export default function DailyVerse() {
  const [verse, setVerse] = useState<{
    text: string;
    reference: string;
    isHindi: boolean;
  } | null>(null);

  useEffect(() => {
    const lang = localStorage.getItem("vandana-default-lang") ?? "en";
    const isHindi = lang === "hi";

    const hour = new Date().getHours();
    const period = getPeriod(hour);
    const pool = verses[period];

    const dayOfYear = Math.floor(Date.now() / 86400000);
    const index = dayOfYear % pool.length;
    const chosen = pool[index];

    setVerse({
      text: isHindi ? chosen.hindi : chosen.english,
      reference: chosen.reference,
      isHindi,
    });
  }, []);

  if (!verse) return null;

  return (
    <section
      style={{
        padding: "8px 20px 0",
        maxWidth: "40rem",
        margin: "0 auto",
      }}
    >
      {/* ── Label ── */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          letterSpacing: "var(--tracking-widest)",
          color: "var(--accent)",
          opacity: 0.6,
          margin: "0 0 12px 0",
          textTransform: "uppercase",
        }}
      >
        Verse of the Day
      </p>

      {/* ── Verse block with gold left border ── */}
      <blockquote
        style={{
          borderLeft: "2px solid var(--accent)",
          borderLeftColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
          paddingLeft: 16,
          margin: 0,
        }}
      >
        {/* Verse text */}
        <p
          style={{
            fontFamily: verse.isHindi
              ? "var(--font-devanagari)"
              : "var(--font-display)",
            fontSize: "var(--text-lg)",
            fontStyle: "italic",
            color: "var(--text-primary)",
            lineHeight: "var(--leading-normal)",
            margin: 0,
          }}
        >
          &ldquo;{verse.text}&rdquo;
        </p>

        {/* Reference */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          — {verse.reference}
        </p>
      </blockquote>
    </section>
  );
}
