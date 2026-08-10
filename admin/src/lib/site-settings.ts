"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SiteLanguage {
  code: string;
  label: string;
  enabled: boolean;
}

export interface SiteSettings {
  defaultCurrency: string;
  currencyPosition: "before" | "after";
  decimals: string;
  defaultLanguage: string;
  languages: SiteLanguage[];
}

export const currencyOptions = [
  "AED",
  "USD",
  "EUR",
  "GBP",
  "SAR",
  "KWD",
  "QAR",
];

export const currencyPositions = [
  { value: "before", label: "Before amount (AED 1,200)" },
  { value: "after", label: "After amount (1,200 AED)" },
];

export const decimalOptions = [
  { value: "0", label: "0 decimals" },
  { value: "2", label: "2 decimals" },
  { value: "3", label: "3 decimals" },
];

const DEFAULTS: SiteSettings = {
  defaultCurrency: "AED",
  currencyPosition: "before",
  decimals: "0",
  defaultLanguage: "en",
  languages: [
    { code: "en", label: "English", enabled: true },
    { code: "ar", label: "العربية (Arabic)", enabled: false },
    { code: "fr", label: "Français", enabled: false },
    { code: "de", label: "Deutsch", enabled: false },
    { code: "es", label: "Español", enabled: false },
  ],
};

const STORAGE_KEY = "rv_admin_site_settings";

function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SiteSettings;
  } catch {
    // ignore corrupt storage
  }
  return DEFAULTS;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setSettings(loadSettings());
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota errors
    }
  }, [settings]);

  const update = useCallback((patch: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleLanguage = useCallback((code: string) => {
    setSettings((prev) => ({
      ...prev,
      languages: prev.languages.map((language) =>
        language.code === code
          ? { ...language, enabled: !language.enabled }
          : language
      ),
    }));
  }, []);

  return { settings, update, toggleLanguage };
}
