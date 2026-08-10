"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "royal-vacation-favorites";

export type FavoriteEntry = { id: string; addedAt: number };

type FavoritesContextValue = {
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  favoriteEntries: FavoriteEntry[];
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function loadStoredFavorites(): Map<string, number> {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return new Map();

    // Migrate from the old string[]-of-ids format to {id, addedAt} entries.
    if (typeof parsed[0] === "string") {
      const now = Date.now();
      return new Map((parsed as string[]).map((id, index) => [id, now - index]));
    }
    return new Map((parsed as FavoriteEntry[]).map((entry) => [entry.id, entry.addedAt]));
  } catch {
    return new Map();
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    setFavorites(loadStoredFavorites());
  }, []);

  const persist = useCallback((next: Map<string, number>) => {
    try {
      const entries: FavoriteEntry[] = [...next].map(([id, addedAt]) => ({ id, addedAt }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore storage write failures (e.g. private browsing)
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Map(prev);
        if (next.has(id)) next.delete(id);
        else next.set(id, Date.now());
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearFavorites = useCallback(() => {
    setFavorites(new Map());
    persist(new Map());
  }, [persist]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const favoriteEntries = useMemo<FavoriteEntry[]>(
    () => [...favorites].map(([id, addedAt]) => ({ id, addedAt })),
    [favorites]
  );

  const value = useMemo(
    () => ({ isFavorite, toggleFavorite, clearFavorites, favoriteEntries }),
    [isFavorite, toggleFavorite, clearFavorites, favoriteEntries]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
