"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "vandana-favourites";

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

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
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
