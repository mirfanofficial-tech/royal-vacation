"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const OPTIONS: { key: string; label: string; locked?: boolean }[] = [
  { key: "confirmations", label: "Booking confirmations & trip updates", locked: true },
  { key: "deals", label: "Deals, offers and Genius rewards" },
  { key: "reminders", label: "Trip reminders before check-in" },
  { key: "reviews", label: "Review reminders after your stay" },
  { key: "news", label: "Product news and surveys" },
];

export function EmailPreferencesForm() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    confirmations: true,
    deals: true,
    reminders: true,
    reviews: true,
    news: false,
  });
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
        setTimeout(() => setDone(false), 3000);
      }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h2 className="text-base font-semibold text-navy">Email preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose which emails you&apos;d like to receive from Royal Vacation.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <label
            key={o.key}
            className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm"
          >
            <Checkbox
              checked={prefs[o.key]}
              disabled={o.locked}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, [o.key]: v === true }))}
              className="mt-0.5"
            />
            <span>
              {o.label}
              {o.locked && (
                <span className="ml-2 text-xs text-muted-foreground">(always on)</span>
              )}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="submit"
          className="rounded-lg bg-navy text-white hover:bg-navy-light"
        >
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
