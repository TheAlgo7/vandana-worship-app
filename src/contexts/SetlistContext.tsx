"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "vandana-setlist";

interface SetlistCtx {
  setlist: string[];
  addToSetlist: (id: string) => void;
  removeFromSetlist: (id: string) => void;
  toggleSetlist: (id: string) => void;
  clearSetlist: () => void;
  isInSetlist: (id: string) => boolean;
}

const SetlistContext = createContext<SetlistCtx>({
  setlist: [],
  addToSetlist: () => {},
  removeFromSetlist: () => {},
  toggleSetlist: () => {},
  clearSetlist: () => {},
  isInSetlist: () => false,
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

  const addToSetlist = useCallback((id: string) => {
    setSetlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromSetlist = useCallback((id: string) => {
    setSetlist((prev) => prev.filter((item) => item !== id));
  }, []);

  const toggleSetlist = useCallback((id: string) => {
    setSetlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const clearSetlist = useCallback(() => {
    setSetlist([]);
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
      }}
    >
      {children}
    </SetlistContext.Provider>
  );
}

export function useSetlist() {
  return useContext(SetlistContext);
}
