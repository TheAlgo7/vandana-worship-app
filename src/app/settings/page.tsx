"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

const LANG_OPTIONS = [
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "हिंदी (Hindi)" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  const [lang, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "hinglish";
    const stored = localStorage.getItem("vandana-default-lang");
    return stored === "hindi" || stored === "hinglish" ? stored : "hinglish";
  });

  const handleLangChange = useCallback((val: string) => {
    setLang(val);
    localStorage.setItem("vandana-default-lang", val);
  }, []);

  /* close on Escape → go back */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") window.history.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 24px)",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            color: "var(--text-primary)",
            transition: "background var(--transition-fast)",
          }}
          aria-label="Back to home"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Settings
        </h1>
      </header>

      <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
        {/* ── Appearance ── */}
        <section style={{ marginBottom: 36 }}>
          <p className="section-label">Appearance</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <p style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>
                Dark Mode
              </p>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-secondary)",
                  marginTop: 2,
                }}
              >
                {isDark ? "Dark theme active" : "Light theme active"}
              </p>
            </div>
            {/* pill toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                position: "relative",
                width: 48,
                height: 28,
                borderRadius: "var(--radius-pill)",
                border: "none",
                background: isDark ? "var(--accent)" : "var(--border)",
                cursor: "pointer",
                transition: "background var(--transition-fast)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: isDark ? 23 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: isDark ? "var(--bg-base)" : "var(--bg-surface)",
                  transition: "left var(--transition-fast)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                }}
              />
            </button>
          </div>
        </section>

        {/* ── Default Language ── */}
        <section style={{ marginBottom: 36 }}>
          <p className="section-label">Default Language</p>
          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            {LANG_OPTIONS.map((opt) => {
              const active = lang === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleLangChange(opt.value)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid",
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    background: active ? "var(--accent-dim)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    fontSize: "var(--text-sm)",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition:
                      "border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── About ── */}
        <section>
          <p className="section-label">About</p>
          <div
            style={{
              padding: "16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              fontSize: "var(--text-sm)",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Vandana
            </p>
            <p style={{ marginBottom: 12 }}>
              Vandana — Worship in your language.
              <br />
              A free worship lyrics app for the Indian church.
            </p>
            <p style={{ marginBottom: 12 }}>
              Built with ❤️ by{" "}
              <a
                href="https://thealgothrim.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Gaurav — The Algothrim
              </a>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
              Version 1.0.0
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
