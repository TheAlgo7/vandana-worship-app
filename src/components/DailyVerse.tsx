"use client";

import { useState, useEffect, useCallback } from "react";
import { Share2 } from "lucide-react";
import verses from "@/data/verses.json";
import { shareCard } from "@/lib/shareCard";

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
    queueMicrotask(() => {
      const lang = localStorage.getItem("vandana-default-lang") ?? "hinglish";
      const isHindi = lang === "hindi";

      const hour = new Date().getHours();
      const period = getPeriod(hour);
      const pool = verses[period];

      const dayOfYear = Math.floor(Date.now() / 86400000);
      const index = dayOfYear % pool.length;
      const chosen = pool[index];

      setVerse({
        text: isHindi ? chosen.hindi : chosen.english,
        reference: isHindi ? chosen.reference_hindi : chosen.reference,
        isHindi,
      });
    });
  }, []);

  if (!verse) return null;

  return (
    <section
      className="daily-verse"
      lang={verse.isHindi ? "hi" : "en"}
      style={{
        padding: "14px 20px 8px",
        maxWidth: "40rem",
        margin: "0 auto",
      }}
    >
      {/* ── Label + share ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, margin: "0 0 10px 0" }}>
        <p
          style={{
            fontFamily: verse.isHindi
              ? "var(--font-devanagari)"
              : "var(--font-body)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: verse.isHindi ? "0.05em" : "var(--tracking-widest)",
            color: "var(--accent)",
            opacity: 0.65,
            margin: 0,
            textTransform: verse.isHindi ? "none" : "uppercase" as React.CSSProperties["textTransform"],
          }}
        >
          {verse.isHindi ? "दिन का वचन" : "Verse of the Day"}
        </p>
        <VerseShareButton verse={verse} />
      </div>

      {/* Verse text: typography only, no nested box */}
      <blockquote style={{ margin: 0 }}>
        <p
          style={{
            fontFamily: verse.isHindi
              ? "var(--font-devanagari)"
              : "var(--font-display)",
            fontSize: "var(--text-base)",
            fontStyle: "italic",
            color: "var(--text-primary)",
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          &ldquo;{verse.text}&rdquo;
        </p>

        <p
          style={{
            fontFamily: verse.isHindi
              ? "var(--font-devanagari)"
              : "var(--font-body)",
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          {verse.reference}
        </p>
      </blockquote>
    </section>
  );
}

function VerseShareButton({
  verse,
}: {
  verse: { text: string; reference: string; isHindi: boolean };
}) {
  const handleShare = useCallback(() => {
    void shareCard({
      lines: [`“${verse.text}”`],
      title: verse.reference,
      isDevanagari: verse.isHindi,
      filename: "vandana-verse",
    });
  }, [verse]);

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share verse as image"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        marginRight: -10,
        border: "none",
        borderRadius: "var(--radius-pill)",
        background: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Share2 size={15} aria-hidden="true" />
    </button>
  );
}
