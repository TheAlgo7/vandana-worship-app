"use client";

import { useCallback, useEffect, useState } from "react";

export const SETLIST_ENABLED_STORAGE_KEY = "vandana-setlist-enabled";
const SETLIST_PREFERENCE_EVENT = "vandana-setlist-preference-change";

export function getStoredSetlistEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SETLIST_ENABLED_STORAGE_KEY) === "true";
}

export function setStoredSetlistEnabled(enabled: boolean) {
  window.localStorage.setItem(SETLIST_ENABLED_STORAGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent(SETLIST_PREFERENCE_EVENT, { detail: { enabled } }));
}

export function useSetlistEnabled() {
  const [enabled, setEnabled] = useState(false);
  const [enabledPulse, setEnabledPulse] = useState(0);

  useEffect(() => {
    const sync = () => setEnabled(getStoredSetlistEnabled());
    const syncPreferenceChange = (event: Event) => {
      const nextEnabled = getStoredSetlistEnabled();
      setEnabled(nextEnabled);

      if (event instanceof CustomEvent && event.detail?.enabled === true) {
        setEnabledPulse((pulse) => pulse + 1);
      }
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SETLIST_PREFERENCE_EVENT, syncPreferenceChange);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SETLIST_PREFERENCE_EVENT, syncPreferenceChange);
    };
  }, []);

  const updateEnabled = useCallback((nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    setStoredSetlistEnabled(nextEnabled);
  }, []);

  return [enabled, updateEnabled, enabledPulse] as const;
}
