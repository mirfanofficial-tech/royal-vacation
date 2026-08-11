"use client";

import { useState } from "react";
import { CheckIcon, ChevronDown, Coins, Globe, Search } from "lucide-react";

import { useLocale } from "@/components/providers/locale-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Tab = "language" | "currency";

export function LocaleSwitcher() {
  const {
    currency,
    currencies,
    setCurrencyCode,
    language,
    languages,
    setLanguageCode,
    isLoading,
  } = useLocale();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("language");
  const [query, setQuery] = useState("");

  if (isLoading || !currency || !language) return null;

  const filteredLanguages = languages.filter((l) =>
    `${l.name} ${l.native_name} ${l.code}`.toLowerCase().includes(query.toLowerCase())
  );
  const filteredCurrencies = currencies.filter((c) =>
    `${c.name} ${c.code}`.toLowerCase().includes(query.toLowerCase())
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  function selectTab(next: Tab) {
    setTab(next);
    setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground outline-none hover:border-navy/40">
        <Globe className="h-3.5 w-3.5" />
        {language.code.toUpperCase()} · {currency.code}
        <ChevronDown className="h-3 w-3" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-0 p-0 sm:w-96 lg:w-[34rem]">
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => selectTab("language")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "language"
                ? "border-b-2 border-navy text-navy"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe className="h-3.5 w-3.5" /> Language &amp; region
          </button>
          <button
            type="button"
            onClick={() => selectTab("currency")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "currency"
                ? "border-b-2 border-navy text-navy"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Coins className="h-3.5 w-3.5" /> Currency
          </button>
        </div>

        <div className="p-3">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "language"
                  ? `Search ${languages.length} languages`
                  : `Search ${currencies.length} currencies`
              }
              className="h-9 w-full rounded-lg border border-border bg-background pr-3 pl-8 text-sm outline-none focus-visible:border-navy"
            />
          </div>

          {tab === "language" ? (
            <>
              <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                All languages · {filteredLanguages.length} of {languages.length}
              </p>
              <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {filteredLanguages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguageCode(l.code)}
                    className={cn(
                      "relative flex flex-col gap-1 rounded-lg border p-2 text-left transition-colors",
                      l.code === language.code
                        ? "border-navy bg-navy/5"
                        : "border-border hover:border-navy/40"
                    )}
                  >
                    {l.code === language.code && (
                      <CheckIcon className="absolute top-2 right-2 h-3.5 w-3.5 text-navy" />
                    )}
                    <span className="inline-flex w-fit items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                      {l.code}
                    </span>
                    <span className="text-sm font-medium">{l.name}</span>
                    <span className="text-xs text-muted-foreground">{l.native_name}</span>
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                    No languages match.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                All currencies · {filteredCurrencies.length} of {currencies.length}
              </p>
              <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrencyCode(c.code)}
                    className={cn(
                      "relative flex flex-col gap-1 rounded-lg border p-2 text-left transition-colors",
                      c.code === currency.code
                        ? "border-navy bg-navy/5"
                        : "border-border hover:border-navy/40"
                    )}
                  >
                    {c.code === currency.code && (
                      <CheckIcon className="absolute top-2 right-2 h-3.5 w-3.5 text-navy" />
                    )}
                    <span className="inline-flex w-fit items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                      {c.code}
                    </span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </button>
                ))}
                {filteredCurrencies.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                    No currencies match.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          Your choice is saved to this browser and applied instantly — no page reload.
        </p>
      </PopoverContent>
    </Popover>
  );
}
