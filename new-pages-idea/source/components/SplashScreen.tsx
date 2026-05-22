"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Allow one frame so the splash is painted, then fade
    requestAnimationFrame(() => setFadeOut(true));
    const timer = setTimeout(() => setRemoved(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (removed) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 400ms ease",
        pointerEvents: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/logo-tagline.svg"
        alt="Vandana"
        width={240}
        style={{ height: "auto" }}
      />
    </div>
  );
}
