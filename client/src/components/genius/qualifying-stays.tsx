"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Check,
  Headset,
  Info,
  Loader2,
  TrendingUp,
  Wallet2,
} from "lucide-react";

import { useGenius } from "@/components/genius/genius-context";

function money(currency: string, n: number) {
  return `${currency}${currency.length > 1 ? " " : ""}${n.toLocaleString()}`;
}

export function QualifyingStays() {
  const { view, loading, tiers } = useGenius();

  const currentDiscount = view.enrolled ? (tiers[view.levelIndex]?.discountPercent ?? 0) : 0;
  const nextLevel = view.enrolled ? tiers[view.levelIndex + 1] : tiers[0];
  const target = nextLevel?.staysRequired ?? 0;
  const topTierName = tiers[tiers.length - 1]?.name ?? "the top level";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-navy">Your qualifying stays</h2>
          <Link
            href="/account/trips"
            className="text-sm font-medium text-navy hover:underline"
          >
            View all activity
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : view.stays.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No stays yet. Your completed trips will count towards Genius automatically.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {view.stays.map((stay) => (
              <li key={stay.id} className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      stay.status === "completed"
                        ? "bg-rating/10 text-rating"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stay.status === "completed" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stay.propertyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[stay.location, stay.dateRange].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                {stay.status === "completed" ? (
                  <span className="shrink-0 text-sm font-semibold text-rating">
                    {stay.savedAmount
                      ? `${money(view.currency, stay.savedAmount)} saved`
                      : "Counted"}
                  </span>
                ) : (
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    Upcoming
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {nextLevel && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Next up</span>
            <h3 className="mt-1 font-heading text-lg font-bold text-navy">
              {nextLevel.name} unlocks at {target} stays
            </h3>

            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: target }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < view.qualifyingStays ? "bg-gold" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {view.qualifyingStays} of {target} stays counted ·{" "}
              {Math.max(0, target - view.qualifyingStays)} to go
            </p>

            <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-navy" />
                {nextLevel.discountPercent}% off instead of {currentDiscount}%
              </li>
              <li className="flex items-center gap-2">
                <Wallet2 className="h-4 w-4 text-navy" />
                Free room upgrades
              </li>
              <li className="flex items-center gap-2">
                <Headset className="h-4 w-4 text-navy" />
                24/7 concierge line
              </li>
            </ul>

            <Link
              href="/search"
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
            >
              Browse Genius stays
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-navy/5 px-4 py-3.5 text-xs text-navy">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
            <p>
              Levels are permanent. Once you reach {topTierName}, you keep it — even if you
              don&apos;t travel for a year.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
