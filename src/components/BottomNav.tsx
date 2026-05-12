"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { House, Bell, Heart, Settings } from "lucide-react";
import updatesData from "@/data/updates.json";
import styles from "./BottomNav.module.css";

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
      <div aria-hidden className={styles.fade} />

      <nav aria-label="Main navigation" className={styles.pill}>
        {NAV_ITEMS.map(({ href, label, Icon, exact, badge }) => {
          const active = isActive(href, exact);
          const showDot = badge === "updates" && hasUnread && !active;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${styles.item}${active ? ` ${styles.active}` : ""}`}
            >
              <span className={styles.icon}>
                <Icon size={20} strokeWidth={active ? 2.1 : 1.7} aria-hidden />
                {showDot && (
                  <span aria-label="Unread updates" className={styles.dot} />
                )}
              </span>
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
