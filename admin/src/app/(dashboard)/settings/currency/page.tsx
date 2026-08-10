"use client";

import { useState } from "react";
import { BadgeCheck, Coins, Save } from "lucide-react";

import {
  currencyOptions,
  currencyPositions,
  decimalOptions,
  useSiteSettings,
} from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function formatPreview(
  currency: string,
  position: "before" | "after",
  decimals: string
) {
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number(decimals),
    maximumFractionDigits: Number(decimals),
  }).format(1234567.89);
  return position === "before"
    ? `${currency} ${amount}`
    : `${amount} ${currency}`;
}

export default function CurrencySettingsPage() {
  const { settings, update } = useSiteSettings();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Currency</h1>
          <p className="text-sm text-muted-foreground">
            Set how prices are displayed across the customer site.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save data-icon="inline-start" />
          Save changes
          {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="size-4 text-muted-foreground" />
            Currency settings
          </CardTitle>
          <CardDescription>
            Default currency and how amounts are formatted.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-md space-y-5">
          <div>
            <label className={fieldLabel} htmlFor="settings-currency">
              Default currency
            </label>
            <select
              id="settings-currency"
              value={settings.defaultCurrency}
              onChange={(e) => update({ defaultCurrency: e.target.value })}
              className={selectClass}
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="settings-position">
              Currency position
            </label>
            <select
              id="settings-position"
              value={settings.currencyPosition}
              onChange={(e) =>
                update({
                  currencyPosition: e.target.value as "before" | "after",
                })
              }
              className={selectClass}
            >
              {currencyPositions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="settings-decimals">
              Decimal places
            </label>
            <select
              id="settings-decimals"
              value={settings.decimals}
              onChange={(e) => update({ decimals: e.target.value })}
              className={selectClass}
            >
              {decimalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="mt-1 text-lg font-semibold text-navy">
              {formatPreview(
                settings.defaultCurrency,
                settings.currencyPosition,
                settings.decimals
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
