"use client";

import type { Language } from "@/lib/getSongs";

interface LanguageToggleProps {
  available: Language[];
  current: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageToggle({
  available,
  current,
  onChange,
}: LanguageToggleProps) {
  if (available.length < 2) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        position: "relative",
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {available.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          style={{
            position: "relative",
            padding: "6px 14px",
            fontSize: "var(--text-xs)",
            fontWeight: current === lang ? 600 : 400,
            background: current === lang ? "var(--accent)" : "transparent",
            color: current === lang ? "var(--bg-base)" : "var(--text-muted)",
            border: "none",
            cursor: "pointer",
            transition: "color var(--transition-fast), background var(--transition-fast)",
          }}
        >
          <span
            style={{
              position: "relative",
              zIndex: 1,
              opacity: current === lang ? 1 : 0.72,
              transition: "opacity var(--transition-fast)",
            }}
          >
            {lang === "hinglish" ? "Hinglish" : "Hindi"}
          </span>
        </button>
      ))}
    </div>
  );
}
