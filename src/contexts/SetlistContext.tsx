"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { requestSongPrecache } from "@/lib/offlineCache";

const STORAGE_KEY = "vandana-setlist";

interface SetlistCtx {
  setlist: string[];
  addToSetlist: (id: string) => void;
  removeFromSetlist: (id: string) => void;
  toggleSetlist: (id: string) => void;
  clearSetlist: () => void;
  isInSetlist: (id: string) => boolean;
  moveInSetlist: (id: string, direction: -1 | 1) => void;
}

const SetlistContext = createContext<SetlistCtx>({
  setlist: [],
  addToSetlist: () => {},
  removeFromSetlist: () => {},
  toggleSetlist: () => {},
  clearSetlist: () => {},
  isInSetlist: () => false,
  moveInSetlist: () => {},
});

export function SetlistProvider({ children }: { children: ReactNode }) {
  const [setlist, setSetlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setSetlist(JSON.parse(raw));
      } catch {
        /* ignore corrupt data */
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setlist));
  }, [setlist, hydrated]);

  // Pre-cache setlist songs (reading + present pages) so tonight's set
  // survives church halls with no signal — even songs never opened before.
  // Debounced so rapid add/remove taps batch into one pass.
  useEffect(() => {
    if (!hydrated || setlist.length === 0) return;
    const timer = setTimeout(
      () => requestSongPrecache(setlist, { includePresent: true }),
      1500,
    );
    return () => clearTimeout(timer);
  }, [setlist, hydrated]);

  const addToSetlist = useCallback((id: string) => {
    setSetlist((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromSetlist = useCallback((id: string) => {
    setSetlist((prev) => {
      const next = prev.filter((item) => item !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleSetlist = useCallback((id: string) => {
    setSetlist((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSetlist = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setSetlist([]);
  }, []);

  const moveInSetlist = useCallback((id: string, direction: -1 | 1) => {
    setSetlist((prev) => {
      const index = prev.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isInSetlist = useCallback(
    (id: string) => setlist.includes(id),
    [setlist],
  );

  return (
    <SetlistContext.Provider
      value={{
        setlist,
        addToSetlist,
        removeFromSetlist,
        toggleSetlist,
        clearSetlist,
        isInSetlist,
        moveInSetlist,
      }}
    >
      {children}
    </SetlistContext.Provider>
  );
}

export function useSetlist() {
  return useContext(SetlistContext);
}
