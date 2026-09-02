"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api, bookings } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { SAMPLE_GENIUS_VIEW, buildGeniusView, type GeniusView } from "@/lib/genius";

type GeniusContextValue = {
  /** true while real data is being fetched for a signed-in user. */
  loading: boolean;
  view: GeniusView;
};

const GeniusContext = createContext<GeniusContextValue>({
  loading: false,
  view: SAMPLE_GENIUS_VIEW,
});

export const useGenius = () => useContext(GeniusContext);

export function GeniusProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<GeniusView>(SAMPLE_GENIUS_VIEW);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getSession()) return;
    let alive = true;
    setLoading(true);
    Promise.all([bookings.list().catch(() => []), api.profile.get().catch(() => null)])
      .then(([rows, me]) => {
        if (alive) setView(buildGeniusView(rows, me));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GeniusContext.Provider value={{ loading, view }}>{children}</GeniusContext.Provider>
  );
}
