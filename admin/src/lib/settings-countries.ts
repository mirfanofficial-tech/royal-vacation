"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mockSettingCountries, type SettingCountry } from "@/lib/mock-data";

const STORAGE_KEY = "rv_admin_settings_countries";

function load(): SettingCountry[] {
  if (typeof window === "undefined") return mockSettingCountries;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SettingCountry[]) : mockSettingCountries;
  } catch {
    return mockSettingCountries;
  }
}

export function useCountries() {
  const [countries, setCountries] = useState<SettingCountry[]>(mockSettingCountries);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setCountries(load());
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(countries));
    }
  }, [countries]);

  const addCountry = useCallback((country: SettingCountry) => {
    setCountries((prev) => [...prev, country]);
  }, []);

  const updateCountry = useCallback((updated: SettingCountry) => {
    setCountries((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const deleteCountry = useCallback((id: string) => {
    setCountries((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setCountries((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c
      )
    );
  }, []);

  return { countries, addCountry, updateCountry, deleteCountry, toggleStatus };
}
