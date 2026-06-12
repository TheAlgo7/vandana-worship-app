"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import { requestSongPrecache } from "@/lib/offlineCache";

const STORAGE_KEY = "vandana-favourites";

/** Most-recent favourites to keep available offline (reading pages). */
const OFFLINE_FAVOURITES_LIMIT = 24;

interface FavouritesCtx {
  favourites: string[];
  toggleFavourite: (id: string) => void;
  isFavourite: (id: string) => boolean;
}

const FavouritesContext = createContext<FavouritesCtx>({
  favourites: [],
  toggleFavourite: () => {},
  isFavourite: () => false,
});

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* Hydrate from localStorage once on mount */
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setFavourites(JSON.parse(raw));
      } catch {
        /* ignore corrupt data */
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  /* Persist every change */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites, hydrated]);

  /* Keep the most recent favourites readable offline (late-night prayer
     shouldn't depend on signal). Debounced so toggle bursts batch. */
  useEffect(() => {
    if (!hydrated || favourites.length === 0) return;
    const timer = setTimeout(
      () => requestSongPrecache(favourites.slice(-OFFLINE_FAVOURITES_LIMIT)),
      1500,
    );
    return () => clearTimeout(timer);
  }, [favourites, hydrated]);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (id: string) => favourites.includes(id),
    [favourites],
  );

  return (
    <FavouritesContext.Provider
      value={{ favourites, toggleFavourite, isFavourite }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
