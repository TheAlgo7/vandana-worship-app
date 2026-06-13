"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { House, Bell, Heart, ListMusic, Settings } from "lucide-react";
import updatesData from "@/data/updates.json";
import { useSetlistEnabled } from "@/lib/setlistPreference";
import { useUIStrings, type UIStrings } from "@/lib/uiStrings";
import styles from "./BottomNav.module.css";

const NAV_ITEMS: {
  href: string;
  labelKey: keyof UIStrings;
  shortLabelKey?: keyof UIStrings;
  Icon: LucideIcon;
  exact: boolean;
  badge?: "updates";
  feature?: "setlist";
}[] = [
  { href: "/app",        labelKey: "navHome",       Icon: House,    exact: true  },
  { href: "/updates",    labelKey: "navUpdates",    Icon: Bell,     exact: true, badge: "updates" },
  { href: "/setlist",    labelKey: "navSetlist",    Icon: ListMusic, exact: false, feature: "setlist" },
  { href: "/favourites", labelKey: "navFavourites", shortLabelKey: "navSaved", Icon: Heart, exact: false },
  { href: "/settings",   labelKey: "navSettings",   Icon: Settings, exact: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);
  const [setlistEnabled, , setlistRevealPulse] = useSetlistEnabled();
  const { t, uiLang } = useUIStrings();

  useEffect(() => {
    queueMicrotask(() => {
      const lastRead = localStorage.getItem("vandana-updates-last-read");
      if (!lastRead) { setHasUnread(updatesData.length > 0); return; }
      const latest = updatesData
        .map((u) => new Date(u.date + "T00:00:00").getTime())
        .reduce((a, b) => Math.max(a, b), 0);
      setHasUnread(latest > new Date(lastRead).getTime());
    });
  }, [pathname]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <div aria-hidden className={styles.fade} />

      <nav aria-label="Main navigation" className={styles.pill}>
        {NAV_ITEMS
          .filter((item) => item.feature !== "setlist" || setlistEnabled)
          .map(({ href, labelKey, shortLabelKey, Icon, exact, badge, feature }) => {
          const active = isActive(href, exact);
          const showDot = badge === "updates" && hasUnread && !active;
          const label = t[labelKey];

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              lang={uiLang === "hi" ? "hi" : undefined}
              className={[
                styles.item,
                active ? styles.active : "",
                feature === "setlist" && setlistRevealPulse > 0 ? styles.setlistPop : "",
              ].filter(Boolean).join(" ")}
            >
              <span className={styles.icon}>
                <Icon size={20} strokeWidth={active ? 2.1 : 1.7} aria-hidden />
                {showDot && (
                  <span aria-label="Unread updates" className={styles.dot} />
                )}
              </span>
              <span className={styles.label}>{shortLabelKey ? t[shortLabelKey] : label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
