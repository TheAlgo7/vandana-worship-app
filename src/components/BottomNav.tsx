"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { House, Bell, Heart, Settings } from "lucide-react";
import updatesData from "@/data/updates.json";

const NAV_ITEMS: {
  href: string;
  label: string;
  Icon: LucideIcon;
  exact: boolean;
  badge?: "updates";
}[] = [
  { href: "/",           label: "Home",       Icon: House,    exact: true  },
  { href: "/updates",    label: "Updates",    Icon: Bell,     exact: true, badge: "updates" },
  { href: "/favourites", label: "Favourites", Icon: Heart,    exact: false },
  { href: "/settings",   label: "Settings",   Icon: Settings, exact: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const lastRead = localStorage.getItem("vandana-updates-last-read");
    if (!lastRead) { setHasUnread(updatesData.length > 0); return; }
    const latest = updatesData
      .map((u) => new Date(u.date + "T00:00:00").getTime())
      .reduce((a, b) => Math.max(a, b), 0);
    setHasUnread(latest > new Date(lastRead).getTime());
  }, [pathname]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Soft gradient so content isn't hidden behind the floating nav */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4.5rem",
          pointerEvents: "none",
          zIndex: 49,
          background: "linear-gradient(to top, var(--bg-base) 40%, transparent)",
        }}
      />

      {/* Floating pill */}
      <nav
        aria-label="Main navigation"
        style={{
          position: "fixed",
          bottom: "calc(14px + env(safe-area-inset-bottom))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: 8,
          background: "rgba(20,20,24,0.62)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          border: "0.5px solid rgba(236,234,228,0.09)",
          borderRadius: 999,
          boxShadow: [
            "0 18px 40px rgba(0,0,0,0.55)",
            "0 2px 10px rgba(0,0,0,0.3)",
            "inset 0 1px 0 rgba(255,255,255,0.05)",
            "inset 0 -1px 0 rgba(0,0,0,0.4)",
          ].join(", "),
        }}
      >
        {NAV_ITEMS.map(({ href, label, Icon, exact, badge }) => {
          const active = isActive(href, exact);
          const showDot = badge === "updates" && hasUnread && !active;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                height: 44,
                minWidth: 44,
                padding: "0 14px",
                borderRadius: 999,
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
                color: active ? "#0A0A0E" : "#6D6B7A",
                background: active
                  ? "linear-gradient(180deg, #D4BC94 0%, #B89B70 100%)"
                  : "transparent",
                boxShadow: active
                  ? [
                      "0 4px 14px rgba(196,170,126,0.35)",
                      "inset 0 1px 0 rgba(255,255,255,0.35)",
                      "inset 0 -1px 0 rgba(0,0,0,0.15)",
                    ].join(", ")
                  : "none",
                transition: "color 180ms ease, background 220ms ease, box-shadow 220ms ease",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.1 : 1.7} />

              {/* Label — expands in when active */}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: active ? 100 : 0,
                  opacity: active ? 1 : 0,
                  marginLeft: active ? 8 : 0,
                  transition: [
                    "max-width 280ms cubic-bezier(0.22,1,0.36,1)",
                    "opacity 200ms ease",
                    "margin-left 240ms ease",
                  ].join(", "),
                }}
              >
                {label}
              </span>

              {/* Unread badge */}
              {showDot && (
                <span
                  aria-label="Unread updates"
                  style={{
                    position: "absolute",
                    top: 11,
                    right: 11,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 0 2px rgba(10,10,14,0.9)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
