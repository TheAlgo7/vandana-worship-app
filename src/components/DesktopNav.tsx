"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { House, Bell, Heart, ListMusic, Settings } from "lucide-react";
import updatesData from "@/data/updates.json";
import { useSetlistEnabled } from "@/lib/setlistPreference";
import styles from "./DesktopNav.module.css";

const NAV_ITEMS: {
  href: string;
  label: string;
  Icon: LucideIcon;
  exact: boolean;
  badge?: "updates";
  feature?: "setlist";
}[] = [
  { href: "/app",        label: "Home",       Icon: House,    exact: true  },
  { href: "/updates",    label: "Updates",    Icon: Bell,     exact: true,  badge: "updates" },
  { href: "/setlist",    label: "Setlist",    Icon: ListMusic, exact: false, feature: "setlist" },
  { href: "/favourites", label: "Favourites", Icon: Heart,    exact: false },
  { href: "/settings",   label: "Settings",   Icon: Settings, exact: false },
];

export default function DesktopNav() {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);
  const [setlistEnabled, , setlistRevealPulse] = useSetlistEnabled();
  const isPresent = pathname.startsWith("/present");

  useEffect(() => {
    if (isPresent) return;
    queueMicrotask(() => {
      try {
        const lastRead = localStorage.getItem("vandana-updates-last-read");
        if (!lastRead) { setHasUnread(updatesData.length > 0); return; }
        const latest = (updatesData as Array<{ date: string }>)
          .map((u) => new Date(u.date + "T00:00:00").getTime())
          .reduce((a, b) => Math.max(a, b), 0);
        setHasUnread(latest > new Date(lastRead).getTime());
      } catch { /* ignore */ }
    });
  }, [pathname, isPresent]);

  if (isPresent || pathname === "/" || pathname === "/install") return null;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={styles.sidebar} aria-label="Sidebar navigation">
      {/* Logo */}
      <div className={styles.logoArea}>
        <Link href="/app" className={styles.wordmark}>Vandana</Link>
        <span className={styles.wordmarkLine} aria-hidden="true" />
        <span className={styles.tagline}>Worship in your language</span>
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" className={styles.nav}>
        {NAV_ITEMS
          .filter((item) => item.feature !== "setlist" || setlistEnabled)
          .map(({ href, label, Icon, exact, badge, feature }) => {
          const active = isActive(href, exact);
          const showDot = badge === "updates" && hasUnread && !active;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                styles.item,
                active ? styles.active : "",
                feature === "setlist" && setlistRevealPulse > 0 ? styles.setlistPop : "",
              ].filter(Boolean).join(" ")}
            >
              <span className={styles.icon} aria-hidden="true">
                <Icon size={18} strokeWidth={active ? 2.1 : 1.7} />
              </span>
              <span className={styles.label}>{label}</span>
              {showDot && (
                <span aria-label="Unread updates" className={styles.dot} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/about" className={styles.aboutLink}>About</Link>
        <p className={styles.version}>v2.5.0 Public Beta</p>
      </div>
    </aside>
  );
}
