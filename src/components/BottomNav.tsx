"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import updatesData from "@/data/updates.json";
import { House, Bell, Heart, Settings as SettingsIcon } from "lucide-react";

/** Fixed bottom navigation — Home · Updates · Favourites · Settings (4-item) */
export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isUpdates = pathname === "/updates";
  const isFavourites = pathname === "/favourites";
  const isSettings = pathname.startsWith("/settings");

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const lastRead = localStorage.getItem("vandana-updates-last-read");
    if (!lastRead) {
      setHasUnread(updatesData.length > 0);
      return;
    }
    const latestUpdate = updatesData
      .map((u) => new Date(u.date + "T00:00:00").getTime())
      .reduce((a, b) => Math.max(a, b), 0);
    setHasUnread(latestUpdate > new Date(lastRead).getTime());
  }, [pathname]);

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
          background: "var(--bg-overlay)",
          borderTop: "1px solid var(--border-subtle)",
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
          <House
            size={24}
            strokeWidth={2}
            color={isHome ? "var(--accent)" : "var(--text-muted)"}
            fill={isHome ? "var(--accent)" : "none"}
          />
          Home
        </Link>

        {/* Updates */}
        <Link href="/updates" style={itemStyle(isUpdates)}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <Bell
              size={24}
              strokeWidth={2}
              color={isUpdates ? "var(--accent)" : "var(--text-muted)"}
              fill={isUpdates ? "var(--accent)" : "none"}
            />
            {hasUnread && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
            )}
          </span>
          Updates
        </Link>

        {/* Favourites */}
        <Link href="/favourites" style={itemStyle(isFavourites)}>
          <Heart
            size={24}
            strokeWidth={2}
            color={isFavourites ? "var(--accent)" : "var(--text-muted)"}
            fill={isFavourites ? "var(--accent)" : "none"}
          />
          Favourites
        </Link>

        {/* Settings */}
        <Link href="/settings" style={itemStyle(isSettings)}>
          <SettingsIcon
            size={24}
            strokeWidth={2}
            color={isSettings ? "var(--accent)" : "var(--text-muted)"}
            fill={isSettings ? "var(--accent)" : "none"}
          />
          Settings
        </Link>
      </nav>
    </>
  );
}
