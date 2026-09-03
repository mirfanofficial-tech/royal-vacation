"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { GeniusLevelPublicOut } from "@royal-vacation/api-client";
import { api, bookings } from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  SAMPLE_GENIUS_VIEW,
  STATIC_TIERS,
  buildGeniusView,
  tiersFromApi,
  type GeniusTier,
  type GeniusView,
} from "@/lib/genius";

type GeniusContextValue = {
  /** true while real data is being fetched for a signed-in user. */
  loading: boolean;
  view: GeniusView;
  /** Loyalty tiers — admin-configured from the backend, static fallback otherwise. */
  tiers: GeniusTier[];
};

const GeniusContext = createContext<GeniusContextValue>({
  loading: false,
  view: SAMPLE_GENIUS_VIEW,
  tiers: STATIC_TIERS,
});

export const useGenius = () => useContext(GeniusContext);

export function GeniusProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<GeniusView>(SAMPLE_GENIUS_VIEW);
  const [tiers, setTiers] = useState<GeniusTier[]>(STATIC_TIERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const signedIn = !!getSession();
    setLoading(signedIn);

    (async () => {
      const [levelsRes, rows, me] = await Promise.all([
        api.genius.levels().catch(() => [] as GeniusLevelPublicOut[]),
        signedIn ? bookings.list().catch(() => []) : Promise.resolve([]),
        signedIn ? api.profile.get().catch(() => null) : Promise.resolve(null),
      ]);
      if (!alive) return;

      const nextTiers = levelsRes.length ? tiersFromApi(levelsRes) : STATIC_TIERS;
      setTiers(nextTiers);
      if (signedIn) setView(buildGeniusView(rows, me, nextTiers));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <GeniusContext.Provider value={{ loading, view, tiers }}>{children}</GeniusContext.Provider>
  );
}
