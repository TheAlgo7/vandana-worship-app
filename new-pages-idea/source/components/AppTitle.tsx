"use client";

import { useState, useEffect } from "react";

export default function AppTitle() {
  const [lang, setLang] = useState<"hinglish" | "hindi">("hinglish");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("vandana-default-lang");
      if (stored === "hindi") setLang("hindi");
      setMounted(true);
    });
  }, []);

  const isHindi = mounted && lang === "hindi";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1
        style={{
          fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-brand)",
          fontSize: isHindi ? "22px" : "28px",
          fontWeight: "normal",
          color: "var(--accent)",
          letterSpacing: isHindi ? "0" : "0.04em",
          visibility: mounted ? "visible" : "hidden",
          margin: 0,
        }}
      >
        {isHindi ? "वंदना" : "Vandana"}
      </h1>
      <span
        style={{
          display: "block",
          width: "32px",
          height: "1px",
          background: "var(--accent)",
          opacity: 0.4,
          marginTop: "4px",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
