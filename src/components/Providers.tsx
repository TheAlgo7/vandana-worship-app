"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useRef, useEffect } from "react";
import RouteTransition from "@/components/RouteTransition";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SplashScreen from "@/components/SplashScreen";
import { FavouritesProvider } from "@/contexts/FavouritesContext";
import { SetlistProvider } from "@/contexts/SetlistContext";
import { UILanguageProvider } from "@/lib/uiStrings";

const THEME_BAR_COLORS: Record<string, string> = {
  dark: "#0A0A0E",
  light: "#F4F0E8",
};

function ThemeFadeOverlay() {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const prevTheme = useRef(resolvedTheme);

  // Keep the browser/status-bar chrome in step with the active theme so the
  // installed app feels native in light mode too.
  useEffect(() => {
    const color = THEME_BAR_COLORS[resolvedTheme ?? "dark"];
    if (!color) return;
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }, [resolvedTheme]);

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
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
      <UILanguageProvider>
        <FavouritesProvider>
          <SetlistProvider>
            <ServiceWorkerRegistration />
            <SplashScreen />
            <RouteTransition>{children}</RouteTransition>
            <ThemeFadeOverlay />
          </SetlistProvider>
        </FavouritesProvider>
      </UILanguageProvider>
    </ThemeProvider>
  );
}
