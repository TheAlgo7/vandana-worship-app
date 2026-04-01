"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

/* ── Settings modal ─────────────────────────────────────────
   Three sections:
   1. Dark / Light theme toggle
   2. Default language preference (persisted to localStorage)
   3. About & credits
   ──────────────────────────────────────────────────────────── */

const LANG_OPTIONS = [
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "हिंदी (Hindi)" },
] as const;

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [defaultLang, setDefaultLang] = useState<string>(() => {
    if (typeof window === "undefined") return "hinglish";
    const saved = window.localStorage.getItem("vandana-default-lang");
    return saved === "hindi" || saved === "hinglish" ? saved : "hinglish";
  });

  const handleLangChange = useCallback(
    (val: string) => {
      setDefaultLang(val);
      window.localStorage.setItem("vandana-default-lang", val);
    },
    [],
  );

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isDark = theme !== "light";

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom)",
      }}
    >
      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "28rem",
          background: "var(--color-surface-elevated)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          padding: "var(--space-lg) var(--space-md) var(--space-xl)",
          color: "var(--color-text)",
          maxHeight: "80dvh",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: "2.5rem",
            height: "0.25rem",
            borderRadius: "var(--radius-full)",
            background: "var(--color-border)",
            margin: "0 auto var(--space-lg)",
          }}
        />

        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--font-size-xl)",
            fontWeight: 700,
            marginBottom: "var(--space-lg)",
          }}
        >
          Settings
        </h2>

        {/* ── 1. Theme toggle ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "var(--font-size-base)", fontWeight: 500 }}>
              Dark Mode
            </span>
            {/* Toggle pill */}
            <button
              role="switch"
              aria-checked={isDark}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              style={{
                position: "relative",
                width: "3rem",
                height: "1.75rem",
                borderRadius: "var(--radius-full)",
                border: "none",
                cursor: "pointer",
                background: isDark ? "var(--color-primary)" : "var(--color-border)",
                transition: "background var(--transition-fast)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "0.2rem",
                  left: isDark ? "1.45rem" : "0.2rem",
                  width: "1.35rem",
                  height: "1.35rem",
                  borderRadius: "50%",
                  background: "var(--color-control-thumb)",
                  transition: "left var(--transition-fast)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </label>
        </section>

        {/* ── 2. Default language ── */}
        <section style={{ marginBottom: "var(--space-lg)" }}>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
              marginBottom: "var(--space-sm)",
            }}
          >
            Default Language
          </p>
          <div style={{ display: "flex", gap: "var(--space-sm)" }}>
            {LANG_OPTIONS.map((opt) => {
              const active = defaultLang === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleLangChange(opt.value)}
                  style={{
                    flex: 1,
                    padding: "var(--space-sm) var(--space-md)",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: active ? "var(--color-primary-soft)" : "transparent",
                    color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                    fontWeight: active ? 600 : 400,
                    fontSize: "var(--font-size-sm)",
                    cursor: "pointer",
                    transition:
                      "background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-xs)",
            }}
          >
            Songs will open in this language by default.
          </p>
        </section>

        {/* ── 3. About & credits ── */}
        <section>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
              marginBottom: "var(--space-sm)",
            }}
          >
            About
          </p>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              lineHeight: 1.6,
              color: "var(--color-text-muted)",
            }}
          >
            <p style={{ marginBottom: "var(--space-sm)" }}>
              <strong style={{ color: "var(--color-text)" }}>Vandana</strong> — Worship
              in your language. A free, open-source worship lyrics app for the Indian
              church.
            </p>
            <p style={{ marginBottom: "var(--space-sm)" }}>
              Built with ❤️ by{" "}
              <a
                href="https://thealgothrim.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", textDecoration: "none" }}
              >
                Gaurav — The Algothrim
              </a>
            </p>
            <p>Version 1.0.0</p>
          </div>
        </section>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            marginTop: "var(--space-lg)",
            width: "100%",
            padding: "var(--space-sm) 0",
            borderRadius: "var(--radius-md)",
            border: `1px solid var(--color-border)`,
            background: "transparent",
            color: "var(--color-text)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background var(--transition-fast)",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
