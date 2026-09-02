"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";

import type { CurrencyOut, LanguageOut } from "@royal-vacation/api-client";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const selectClass =
  "h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PreferencesForm() {
  const [currencies, setCurrencies] = useState<CurrencyOut[]>([]);
  const [languages, setLanguages] = useState<LanguageOut[]>([]);
  const [currency, setCurrency] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.profile.get(),
      api.reference.currencies().catch(() => [] as CurrencyOut[]),
      api.reference.languages().catch(() => [] as LanguageOut[]),
    ])
      .then(([me, cur, lang]) => {
        setCurrencies(cur);
        setLanguages(lang);
        setCurrency(me.preferred_currency ?? "");
        setLanguage(me.preferred_language ?? "");
      })
      .catch(() => setError("Couldn't load your preferences."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.profile.updatePreferences({
        preferred_currency: currency || undefined,
        preferred_language: language || undefined,
      });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your preferences.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-navy">Customisation preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose the currency and language used across the site.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={selectClass}
          >
            <option value="">Default</option>
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="language">Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={selectClass}
          >
            <option value="">Default</option>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native_name || l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="submit"
          disabled={busy}
          className="gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save preferences
        </Button>
        {done && (
          <span className="flex items-center gap-1 text-sm text-rating">
            <BadgeCheck className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
