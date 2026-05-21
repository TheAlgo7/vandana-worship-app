"use client";

import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Heart, ListMusic } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DailyVerse from "@/components/DailyVerse";
import FontSizeControl from "@/components/FontSizeControl";
import NotificationToggle from "@/components/NotificationToggle";
import { useSetlistEnabled } from "@/lib/setlistPreference";
import {
  DEFAULT_LANGUAGE_STORAGE_KEY,
  getStoredDefaultLanguage,
  isLanguage,
} from "@/lib/languagePreference";

const LANG_OPTIONS = [
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "हिंदी (Hindi)" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";
  const [setlistEnabled, setSetlistEnabled] = useSetlistEnabled();

  const [lang, setLang] = useState<string>(() => {
    return getStoredDefaultLanguage();
  });

  const handleLangChange = useCallback((val: string) => {
    if (!isLanguage(val)) return;
    setLang(val);
    localStorage.setItem(DEFAULT_LANGUAGE_STORAGE_KEY, val);
  }, []);

  return (
    <div
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        paddingBottom: "calc(var(--nav-clearance) + 16px)",
      }}
    >
      {/* ── Header ── */}
      <header
        className="page-sticky-header"
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

      <div className="page-desktop-grid">
      <main id="main-content" className="settings-main" style={{ padding: "24px 20px" }}>
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
            </div>
            {/* pill toggle - outer button is the 44px tap zone */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                minHeight: 44,
                background: "none",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "block",
                  width: 48,
                  height: 28,
                  borderRadius: "var(--radius-pill)",
                  background: isDark ? "var(--accent)" : "var(--border)",
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
              </span>
            </button>
          </div>
        </section>

        {/* ── Default Language ── */}
        <section style={{ marginBottom: 36 }}>
          <p className="section-label">Default Language</p>
          <div
            role="radiogroup"
            aria-label="Default language"
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
                  role="radio"
                  aria-checked={active}
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

        {/* ── Lyrics Font Size ── */}
        <section style={{ marginBottom: 36 }}>
          <p className="section-label">Lyrics Font Size</p>
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
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
              Default size for all songs
            </p>
            <FontSizeControl />
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <p className="section-label">Worship Planning</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              padding: "14px 16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                <ListMusic size={17} strokeWidth={1.8} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "var(--text-base)", fontWeight: 500, margin: 0 }}>
                  Show Setlist
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.45, marginTop: 2 }}>
                  Adds planning tools for worship leaders and teams.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              onClick={() => setSetlistEnabled(!setlistEnabled)}
              aria-checked={setlistEnabled}
              aria-label={setlistEnabled ? "Hide Setlist from navigation" : "Show Setlist in navigation"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                minHeight: 44,
                background: "none",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "block",
                  width: 48,
                  height: 28,
                  borderRadius: "var(--radius-pill)",
                  background: setlistEnabled ? "var(--accent)" : "var(--border)",
                  transition: "background var(--transition-fast)",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: setlistEnabled ? 23 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: setlistEnabled ? "var(--bg-base)" : "var(--bg-surface)",
                    transition: "left var(--transition-fast)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                  }}
                />
              </span>
            </button>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section style={{ marginBottom: 36 }}>
          <p className="section-label">Notifications</p>
          <NotificationToggle />
        </section>

        {/* ── About (mobile only, on desktop it moves to the aside) ── */}
        <section className="settings-about-mobile">
          <p className="section-label">About</p>
          <div
            style={{
              padding: "16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <AboutCard />
          </div>
        </section>
      </main>

      <aside className="page-aside-col" aria-label="About Vandana">
        <div className="page-aside-card">
          <DailyVerse />
        </div>
        <div className="page-aside-card" style={{ padding: "18px 20px" }}>
          <AboutCard />
        </div>
      </aside>
      </div>

      <BottomNav />
    </div>
  );
}

function AboutCard() {
  return (
    <div
      style={{
        fontSize: "var(--text-sm)",
        lineHeight: 1.65,
        color: "var(--text-secondary)",
      }}
    >
      <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, fontSize: "var(--text-base)" }}>
        Vandana
      </p>
      <p style={{ marginBottom: 12, color: "var(--text-muted)", fontSize: "var(--text-xs)", fontStyle: "italic" }}>
        वंदना means to worship, to praise
      </p>
      <p style={{ marginBottom: 12 }}>
        A modern, minimal worship lyrics app for the Indian church. Every song in both Hinglish and Hindi, with a presentation mode for worship leaders.
      </p>
      <p style={{ marginBottom: 12 }}>
        Built with the blessing of{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Isus Christos Ministries (ICM)</span>
        , a personal offering to the Indian worship community from a church member.
      </p>
      <p>
        Made with{" "}
        <Heart size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" style={{ display: "inline", verticalAlign: "-2px", color: "var(--accent)" }} />{" "}
        by{" "}
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
          Gaurav - The Algothrim
        </a>
      </p>
      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 11, marginTop: 16 }}>
        v2.5.0 Public Beta
      </p>
    </div>
  );
}
