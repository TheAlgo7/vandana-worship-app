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
          fontSize: "22px",
          fontWeight: 500,
          color: "var(--accent)",
          letterSpacing: isHindi ? "0" : "-0.02em",
        }}
      >
        {isHindi ? "वंदना" : "Vandana"}
      </span>
    </div>
  );
}
