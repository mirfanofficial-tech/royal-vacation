"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CurrencyOut, LanguageOut } from "@royal-vacation/api-client";
import { useCurrenciesQuery, useLanguagesQuery } from "@/lib/reference";

const STORAGE_KEY = "royal-vacation-locale";

type StoredLocale = { currencyCode?: string; languageCode?: string };

type LocaleContextValue = {
  currency: CurrencyOut | undefined;
  currencies: CurrencyOut[];
  setCurrencyCode: (code: string) => void;
  language: LanguageOut | undefined;
  languages: LanguageOut[];
  setLanguageCode: (code: string) => void;
  isLoading: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function loadStoredLocale(): StoredLocale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredLocale) : {};
  } catch {
    return {};
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrenciesQuery();
  const { data: languages = [], isLoading: languagesLoading } = useLanguagesQuery();

  const [stored, setStored] = useState<StoredLocale>({});

  useEffect(() => {
    setStored(loadStoredLocale());
  }, []);

  const persist = useCallback((next: StoredLocale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage write failures (e.g. private browsing)
    }
  }, []);

  const currency = useMemo(() => {
    if (stored.currencyCode) {
      const match = currencies.find((c) => c.code === stored.currencyCode);
      if (match) return match;
    }
    return currencies.find((c) => c.is_default) ?? currencies[0];
  }, [currencies, stored.currencyCode]);

  const language = useMemo(() => {
    if (stored.languageCode) {
      const match = languages.find((l) => l.code === stored.languageCode);
      if (match) return match;
    }
    return languages.find((l) => l.code === "en") ?? languages[0];
  }, [languages, stored.languageCode]);

  const setCurrencyCode = useCallback(
    (code: string) => {
      setStored((prev) => {
        const next = { ...prev, currencyCode: code };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setLanguageCode = useCallback(
    (code: string) => {
      setStored((prev) => {
        const next = { ...prev, languageCode: code };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      currency,
      currencies,
      setCurrencyCode,
      language,
      languages,
      setLanguageCode,
      isLoading: currenciesLoading || languagesLoading,
    }),
    [
      currency,
      currencies,
      setCurrencyCode,
      language,
      languages,
      setLanguageCode,
      currenciesLoading,
      languagesLoading,
    ]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
