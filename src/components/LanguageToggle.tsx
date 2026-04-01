"use client";

import type { Language } from "@/lib/getSongs";
import { motion } from "framer-motion";

interface LanguageToggleProps {
  available: Language[];
  current: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageToggle({
  available,
  current,
  onChange,
}: LanguageToggleProps) {
  if (available.length < 2) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        position: "relative",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {available.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          style={{
            position: "relative",
            padding: "var(--space-xs) var(--space-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: current === lang ? 600 : 400,
            background: "transparent",
            color: current === lang ? "var(--primary-foreground)" : "var(--text-muted)",
            border: "none",
            cursor: "pointer",
            transition: "color 0.3s",
          }}
        >
          {current === lang && (
            <motion.span
              layoutId="language-active-pill"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--primary)",
                zIndex: 0,
              }}
            />
          )}
          <motion.span
            animate={{ opacity: current === lang ? 1 : 0.72 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ position: "relative", zIndex: 1 }}
          >
            {lang === "hinglish" ? "Hinglish" : "Hindi"}
          </motion.span>
        </button>
      ))}
    </div>
  );
}
