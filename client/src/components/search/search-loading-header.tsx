"use client";

import { CheckCircle2, Loader2, RefreshCcw } from "lucide-react";

export function SearchLoadingHeader({
  propertyCount,
  dateRangeLabel,
  adults,
  rooms,
  view,
}: {
  propertyCount: number;
  dateRangeLabel: string;
  adults: number;
  rooms: number;
  view: "list" | "grid";
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-gold" />
        <div>
          <h1 className="font-heading text-lg font-bold text-navy sm:text-xl">
            Almost there — arranging {propertyCount} stays on the map…
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "list" ? "List" : "Grid"} view · {dateRangeLabel} · {adults} adult
            {adults > 1 ? "s" : ""}, {rooms} room{rooms > 1 ? "s" : ""} · sorted by Recommended
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-rating/10 px-3 py-1.5 text-xs font-semibold text-rating">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Availability checked
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-rating/10 px-3 py-1.5 text-xs font-semibold text-rating">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Prices compared
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold">
          <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
          Applying filters
        </span>
      </div>
    </div>
  );
}
