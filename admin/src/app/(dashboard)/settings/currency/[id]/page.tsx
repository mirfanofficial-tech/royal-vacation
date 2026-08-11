"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Coins,
  Info,
  Loader2,
  Save,
  Star,
} from "lucide-react";

import type { CountryOut, CurrencyOut, CurrencyUpdate } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCountries, useCurrencies } from "@/lib/reference";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const statusVariant = {
  active: "default",
  inactive: "outline",
} as const;

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const inputClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function CurrencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currencies, isLoading, error, updateCurrency } = useCurrencies();
  const { countries } = useCountries();
  const currency = currencies.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-destructive">
            {errorMessage(error, "Failed to load currency.")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currency) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Currency not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CurrencyDetailView
      key={currency.id}
      currency={currency}
      countries={countries}
      updateCurrency={updateCurrency}
    />
  );
}

function CurrencyDetailView({
  currency,
  countries,
  updateCurrency,
}: {
  currency: CurrencyOut;
  countries: CountryOut[];
  updateCurrency: (id: string, body: CurrencyUpdate) => Promise<CurrencyOut>;
}) {
  const [status, setStatus] = useState<"active" | "inactive">(
    currency.is_active ? "active" : "inactive"
  );
  const [isDefault, setIsDefault] = useState(currency.is_default);
  const [country, setCountry] = useState(currency.country_code ?? "");
  const [rate, setRate] = useState(String(currency.rate_to_aed));

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const countryName = countries.find((c) => c.code === currency.country_code)?.name;

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      await updateCurrency(currency.id, {
        is_active: status === "active",
        is_default: isDefault,
        country_code: country || null,
        rate_to_aed: Number(rate) || undefined,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save currency."));
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-navy">{currency.code}</h1>
              <Badge variant="secondary">{countryName ?? "No country"}</Badge>
              {currency.is_default && (
                <Badge className="bg-gold/10 text-gold">
                  <Star data-icon="inline-start" className="size-3" />
                  Default
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{currency.name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Update Currency
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {saveError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">
                Inactive currencies can&apos;t be selected for new bookings.
              </p>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
              className="h-8 w-32 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">Default Currency</p>
              <p className="text-xs text-muted-foreground">
                Only one currency can be the default at a time.
              </p>
            </div>
            <select
              value={isDefault ? "yes" : "no"}
              onChange={(e) => setIsDefault(e.target.value === "yes")}
              className="h-8 w-32 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </CardContent>
        </Card>
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
                <label className={fieldLabel} htmlFor="currency-detail-code">
                  Currency Code
                </label>
                <Input
                  id="currency-detail-code"
                  value={currency.code}
                  disabled
                  className="font-mono uppercase"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  ISO 4217 3-letter currency code
                </p>
              </div>
              <div>
                <label className={fieldLabel} htmlFor="currency-detail-country">
                  Country Name
                </label>
                <select
                  id="currency-detail-country"
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
                <label className={fieldLabel} htmlFor="currency-detail-rate">
                  Exchange Rate
                </label>
                <input
                  id="currency-detail-rate"
                  type="number"
                  min={0}
                  step="0.000001"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className={inputClass}
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
                <Info className="size-4 text-muted-foreground" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Currency ID</span>
                <span className="truncate font-mono text-xs">{currency.id}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Currency Code</span>
                <span className="font-mono">{currency.code}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium">{countryName ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant[status]}>
                  {status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

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
                  exactly 3 uppercase letters.
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
                <Star className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Default Currency: </span>
                  This will be the primary currency used throughout the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
