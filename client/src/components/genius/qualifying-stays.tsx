import Link from "next/link";
import { ArrowUpRight, Calendar, Check, Headset, Info, TrendingUp, Wallet2 } from "lucide-react";

import { geniusLevels, geniusMember, qualifyingStays } from "@/lib/genius-mock-data";

export function QualifyingStays() {
  const nextLevel = geniusLevels[geniusMember.levelIndex + 1];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-navy">Your qualifying stays</h2>
          <Link href="/wishlist" className="text-sm font-medium text-navy hover:underline">
            View all activity
          </Link>
        </div>

        <ul className="divide-y divide-border">
          {qualifyingStays.map((stay) => (
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
                    {stay.location} · {stay.dateRange}
                  </p>
                </div>
              </div>
              {stay.status === "completed" ? (
                <span className="shrink-0 text-sm font-semibold text-rating">
                  {geniusMember.currency}
                  {stay.savedAmount} saved
                </span>
              ) : (
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  Upcoming
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {nextLevel && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Next up</span>
            <h3 className="mt-1 font-heading text-lg font-bold text-navy">
              {nextLevel.name} unlocks at {nextLevel.staysRequired} stays
            </h3>

            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: nextLevel.staysRequired }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < geniusMember.qualifyingStays ? "bg-gold" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {geniusMember.qualifyingStays} of {nextLevel.staysRequired} stays counted ·{" "}
              {Math.max(0, nextLevel.staysRequired - geniusMember.qualifyingStays)} to go
            </p>

            <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-navy" />
                {nextLevel.discountPercent}% off instead of{" "}
                {geniusLevels[geniusMember.levelIndex]!.discountPercent}%
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
              Levels are permanent. Once you reach {geniusLevels[geniusLevels.length - 1]!.name},
              you keep it — even if you don&apos;t travel for a year.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
