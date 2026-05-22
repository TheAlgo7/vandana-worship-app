"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "@/app/page.module.css";

export default function LandingNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || theme !== "light";

  return (
    <nav className={styles.topbarNav}>
      <a className={styles.navMinor} href="#about">About</a>

      <a
        className={styles.navMinor}
        href="https://github.com/TheAlgo7/vandana-worship-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>

      <button
        className={styles.navThemeToggle}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      <a className={styles.navCta} href="/app">Open app</a>
    </nav>
  );
}
