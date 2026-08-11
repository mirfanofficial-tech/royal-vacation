"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Coins,
  Info,
  Loader2,
  Save,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { useCountries, useCurrencies } from "@/lib/reference";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function AddCurrencyPage() {
  const router = useRouter();
  const { createCurrency } = useCurrencies();
  const { countries } = useCountries();

  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [rate, setRate] = useState("1");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const canSave = Boolean(code.trim() && symbol.trim() && name.trim());

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const created = await createCurrency({
        code: code.trim(),
        symbol: symbol.trim(),
        name: name.trim(),
        rate_to_aed: Number(rate) || 1,
        country_code: country || undefined,
      });
      router.push(`/settings/currency/${created.id}`);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to add currency."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/settings/currency" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Currency
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-navy">Add Currency</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new currency to the catalog.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Add Currency
          </Button>
          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {saveError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Coins className="size-4 text-muted-foreground" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel} htmlFor="currency-add-code">
                  Currency Code
                </label>
                <Input
                  id="currency-add-code"
                  value={code}
                  maxLength={3}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="USD"
                  className="font-mono uppercase"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  ISO 4217 3-letter currency code
                </p>
              </div>
              <div>
                <label className={fieldLabel} htmlFor="currency-add-symbol">
                  Symbol
                </label>
                <Input
                  id="currency-add-symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="$"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Symbol shown next to amounts
                </p>
              </div>
              <div>
                <label className={fieldLabel} htmlFor="currency-add-name">
                  Name
                </label>
                <Input
                  id="currency-add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="US Dollar"
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="currency-add-country">
                  Country Name
                </label>
                <select
                  id="currency-add-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={selectClass}
                >
                  <option value="">— None —</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Country using this currency
                </p>
              </div>
              <div>
                <label className={fieldLabel} htmlFor="currency-add-rate">
                  Exchange Rate
                </label>
                <Input
                  id="currency-add-rate"
                  type="number"
                  min={0}
                  step="0.000001"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Rate relative to base currency (AED)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-muted-foreground" />
                Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Currency Code: </span>
                  Use 3-letter ISO 4217 currency codes like USD, EUR, GBP, etc. Must be
                  exactly 3 uppercase letters, and can&apos;t be changed later.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Coins className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Exchange Rate: </span>
                  Enter the exchange rate relative to your base currency (AED). For the
                  base currency itself, use 1.00.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Status and Default Currency can be set after creation, from the
                  currency&apos;s detail page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
