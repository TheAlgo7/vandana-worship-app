"use client";

import { useState, useEffect } from "react";

const LINES: { text: string; lang: "en" | "hi" }[] = [
  { text: "Worship in your language.", lang: "en" },
  { text: "तेरी वंदना गाएँ शामों सवेरे", lang: "hi" },
  { text: "Teri vandana gaayein shaamon savere", lang: "en" },
  { text: "धरती झूमे हालेलुया", lang: "hi" },
  { text: "Dharti jhoome Hallelujah", lang: "en" },
  { text: "Worship shouldn't need WiFi.", lang: "en" },
];

export default function LandingTagline() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % LINES.length);
        setVisible(true);
      }, 600);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  const line = LINES[idx];

  return (
    <span
      style={{
        fontFamily:
          line.lang === "hi" ? "var(--font-devanagari)" : "var(--font-display)",
        fontStyle: line.lang === "hi" ? "normal" : "italic",
        fontWeight: line.lang === "hi" ? 500 : 400,
        fontSize: "clamp(20px, 2.6vw, 32px)",
        color: "var(--text-primary)",
        lineHeight: 1.4,
        transition: "opacity 600ms ease",
        opacity: visible ? 1 : 0,
        letterSpacing: "-0.005em",
        display: "block",
      }}
    >
      {line.text}
    </span>
  );
}
