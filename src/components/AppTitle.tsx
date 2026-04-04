"use client";

import { useState, useEffect } from "react";

export default function AppTitle() {
  const [lang, setLang] = useState<"hinglish" | "hindi">("hinglish");

  useEffect(() => {
    const stored = localStorage.getItem("vandana-default-lang");
    if (stored === "hindi") setLang("hindi");
  }, []);

  const isHindi = lang === "hindi";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-brand)",
          fontSize: isHindi ? "22px" : "28px",
          fontWeight: "normal",
          color: "var(--accent)",
          letterSpacing: isHindi ? "0" : "0.04em",
        }}
      >
        {isHindi ? "वंदना" : "Vandana"}
      </span>
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
