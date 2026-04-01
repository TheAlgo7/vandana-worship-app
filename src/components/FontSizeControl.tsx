"use client";

import { useState, useCallback, useEffect } from "react";

const MIN = 0.875; // 14px
const MAX = 2.5; // 40px
const STEP = 0.125; // 2px
const STORAGE_KEY = "vandana-font-size-lyrics";

export default function FontSizeControl() {
  const [size, setSize] = useState(() => {
    if (typeof window === "undefined") return 1.25;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : 1.25;
    if (!Number.isFinite(parsed)) return 1.25;
    return Math.min(MAX, Math.max(MIN, parsed));
  });

  const update = useCallback((next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    setSize(clamped);
    document.documentElement.style.setProperty(
      "--font-size-lyrics",
      `${clamped}rem`
    );
    window.localStorage.setItem(STORAGE_KEY, String(clamped));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-size-lyrics", `${size}rem`);
  }, [size]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <button
        onClick={() => update(size - STEP)}
        disabled={size <= MIN}
        aria-label="Decrease font size"
        style={{
          width: 30,
          height: 30,
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--text-primary)",
          fontSize: "var(--text-sm)",
          cursor: size <= MIN ? "not-allowed" : "pointer",
          opacity: size <= MIN ? 0.4 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        A−
      </button>
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          minWidth: 28,
          textAlign: "center",
        }}
      >
        Aa
      </span>
      <button
        onClick={() => update(size + STEP)}
        disabled={size >= MAX}
        aria-label="Increase font size"
        style={{
          width: 30,
          height: 30,
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--text-primary)",
          fontSize: "var(--text-sm)",
          cursor: size >= MAX ? "not-allowed" : "pointer",
          opacity: size >= MAX ? 0.4 : 1,
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
