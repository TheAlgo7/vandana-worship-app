"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useRef, useEffect } from "react";
import RouteTransition from "@/components/RouteTransition";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SplashScreen from "@/components/SplashScreen";
import { FavouritesProvider } from "@/contexts/FavouritesContext";

function ThemeFadeOverlay() {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const prevTheme = useRef(resolvedTheme);

  useEffect(() => {
    if (prevTheme.current && prevTheme.current !== resolvedTheme && ref.current) {
      ref.current.classList.remove("theme-flash");
      void ref.current.offsetWidth;
      ref.current.classList.add("theme-flash");
    }
    prevTheme.current = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        pointerEvents: "none",
        background: "var(--bg-base)",
        opacity: 0,
      }}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <FavouritesProvider>
        <ServiceWorkerRegistration />
        <SplashScreen />
        <RouteTransition>{children}</RouteTransition>
        <ThemeFadeOverlay />
      </FavouritesProvider>
    </ThemeProvider>
  );
}
