"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Fixed bottom navigation — Home · Favourites · Settings (3-item) */
export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isFavourites = pathname === "/favourites";
  const isSettings = pathname.startsWith("/settings");

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    textDecoration: "none",
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    transition: `color var(--transition-fast)`,
    WebkitTapHighlightColor: "transparent",
  });

  return (
    <>
      {/* Gradient fade above nav */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "5.5rem",
          pointerEvents: "none",
          zIndex: 49,
          background:
            "linear-gradient(to top, var(--bg-base) 56px, transparent)",
        }}
      />

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(14,14,18,0.92)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "56px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Home */}
        <Link href="/" style={itemStyle(isHome)}>
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
            <path
              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              fill={isHome ? "currentColor" : "none"}
            />
            <polyline
              points="9 22 9 12 15 12 15 22"
              fill={isHome ? "var(--bg-base)" : "none"}
              stroke="currentColor"
            />
          </svg>
          Home
        </Link>

        {/* Favourites */}
        <Link href="/favourites" style={itemStyle(isFavourites)}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={isFavourites ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          Favourites
        </Link>

        {/* Settings */}
        <Link href="/settings" style={itemStyle(isSettings)}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={isSettings ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
            <circle cx="12" cy="12" r="3" fill={isSettings ? "var(--bg-base)" : "none"} stroke="currentColor" />
          </svg>
          Settings
        </Link>
      </nav>
    </>
  );
}
