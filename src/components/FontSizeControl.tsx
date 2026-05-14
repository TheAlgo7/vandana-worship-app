"use client";

import { useState, useCallback, useEffect } from "react";

const SIZES = [14, 17, 21] as const; // Small, Medium, Large (px)
const STORAGE_KEY = "vandana-font-size";

function applySize(px: number) {
  document.documentElement.style.setProperty("--lyrics-size", `${px}px`);
}

export default function FontSizeControl() {
  const [index, setIndex] = useState(() => {
    if (typeof window === "undefined") return 1;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "0" || raw === "1" || raw === "2") return Number(raw);
    return 1; // default Medium
  });

  useEffect(() => {
    applySize(SIZES[index]);
  }, [index]);

  const pick = useCallback((i: number) => {
    setIndex(i);
    applySize(SIZES[i]);
    window.localStorage.setItem(STORAGE_KEY, String(i));
  }, []);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <button
        onClick={() => pick(0)}
        aria-label="Small font size"
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-pill)",
          border: "1px solid",
          borderColor: index === 0 ? "var(--accent)" : "var(--border)",
          background: index === 0 ? "var(--accent)" : "transparent",
          color: index === 0 ? "var(--bg-base)" : "var(--text-primary)",
          fontSize: "var(--text-xs)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        A-
      </button>
      <button
        onClick={() => pick(1)}
        aria-label="Medium font size"
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-pill)",
          border: "1px solid",
          borderColor: index === 1 ? "var(--accent)" : "var(--border)",
          background: index === 1 ? "var(--accent)" : "transparent",
          color: index === 1 ? "var(--bg-base)" : "var(--text-primary)",
          fontSize: "var(--text-xs)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        Aa
      </button>
      <button
        onClick={() => pick(2)}
        aria-label="Large font size"
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-pill)",
          border: "1px solid",
          borderColor: index === 2 ? "var(--accent)" : "var(--border)",
          background: index === 2 ? "var(--accent)" : "transparent",
          color: index === 2 ? "var(--bg-base)" : "var(--text-primary)",
          fontSize: "var(--text-sm)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        A+
      </button>
    </div>
  );
}
