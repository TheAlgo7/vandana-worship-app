"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import RouteTransition from "@/components/RouteTransition";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

function ThemeFadeOverlay() {
  const { resolvedTheme } = useTheme();
  if (!resolvedTheme) return null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`theme-${resolvedTheme}`}
        initial={{ opacity: 0.38 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          pointerEvents: "none",
          background: "var(--color-bg)",
        }}
      />
    </AnimatePresence>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <ServiceWorkerRegistration />
      <RouteTransition>{children}</RouteTransition>
      <ThemeFadeOverlay />
    </ThemeProvider>
  );
}
