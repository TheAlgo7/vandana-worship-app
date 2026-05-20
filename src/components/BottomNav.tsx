"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { House, Bell, Heart, ListMusic, Settings } from "lucide-react";
import updatesData from "@/data/updates.json";
import styles from "./BottomNav.module.css";

const NAV_ITEMS: {
  href: string;
  label: string;
  shortLabel?: string;
  Icon: LucideIcon;
  exact: boolean;
  badge?: "updates";
}[] = [
  { href: "/",           label: "Home",       Icon: House,    exact: true  },
  { href: "/updates",    label: "Updates",    Icon: Bell,     exact: true, badge: "updates" },
  { href: "/setlist",    label: "Setlist",    Icon: ListMusic, exact: false },
  { href: "/favourites", label: "Favourites", shortLabel: "Saved", Icon: Heart, exact: false },
  { href: "/settings",   label: "Settings",   Icon: Settings, exact: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const isScrubbingRef = useRef(false);
  const activeIndexRef = useRef(0);
  const suppressClickRef = useRef(false);

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

  const activeIndex = Math.max(
    NAV_ITEMS.findIndex(({ href, exact }) => isActive(href, exact)),
    0,
  );
  const visualIndex = scrubIndex ?? activeIndex;

  const getIndexFromClientX = useCallback((clientX: number): number => {
    const links = Array.from(
      navRef.current?.querySelectorAll<HTMLElement>("[data-nav-index]") ?? [],
    );
    if (links.length === 0) return activeIndex;

    return links.reduce(
      (closest, link) => {
        const rect = link.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(clientX - center);
        return distance < closest.distance
          ? { index: Number(link.dataset.navIndex), distance }
          : closest;
      },
      { index: activeIndex, distance: Number.POSITIVE_INFINITY },
    ).index;
  }, [activeIndex]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const move = (event: PointerEvent) => {
      if (!isScrubbingRef.current) return;
      setScrubIndex(getIndexFromClientX(event.clientX));
    };

    const end = (event: PointerEvent) => {
      if (!isScrubbingRef.current) return;
      const nextIndex = getIndexFromClientX(event.clientX);
      isScrubbingRef.current = false;
      setIsScrubbing(false);
      setScrubIndex(null);

      if (nextIndex !== activeIndexRef.current) {
        suppressClickRef.current = true;
        router.push(NAV_ITEMS[nextIndex].href);
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    };

    const cancel = () => {
      if (!isScrubbingRef.current) return;
      isScrubbingRef.current = false;
      setIsScrubbing(false);
      setScrubIndex(null);
    };

    const start = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      isScrubbingRef.current = true;
      setIsScrubbing(true);
      setScrubIndex(getIndexFromClientX(event.clientX));
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end, { once: true });
      window.addEventListener("pointercancel", cancel, { once: true });
    };

    nav.addEventListener("pointerdown", start);

    return () => {
      nav.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [getIndexFromClientX, router]);

  return (
    <>
      <div aria-hidden className={styles.fade} />

      <nav
        ref={navRef}
        aria-label="Main navigation"
        className={`${styles.pill}${isScrubbing ? ` ${styles.scrubbing}` : ""}`}
        style={{ "--nav-index": visualIndex } as React.CSSProperties}
      >
        <span aria-hidden className={styles.thumb} />
        {NAV_ITEMS.map(({ href, label, shortLabel, Icon, exact, badge }, index) => {
          const active = isActive(href, exact);
          const visuallyActive = index === visualIndex;
          const showDot = badge === "updates" && hasUnread && !active;

          return (
            <Link
              key={href}
              href={href}
              data-nav-index={index}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`${styles.item}${visuallyActive ? ` ${styles.active}` : ""}`}
              onClick={(event) => {
                if (!suppressClickRef.current) return;
                event.preventDefault();
                suppressClickRef.current = false;
              }}
            >
              <span className={styles.icon}>
                <Icon size={20} strokeWidth={visuallyActive ? 2.1 : 1.7} aria-hidden />
                {showDot && (
                  <span aria-label="Unread updates" className={styles.dot} />
                )}
              </span>
              <span className={styles.label}>{shortLabel ?? label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
