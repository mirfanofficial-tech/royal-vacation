"use client";

import { List, LayoutGrid, Info } from "lucide-react";
import { SortSelect } from "@/components/search/sort-select";

export type ResultsView = "list" | "grid";

export function ResultsToolbar({
  destination,
  propertyCount,
  nightsLabel,
  view,
  onViewChange,
}: {
  destination: string;
  propertyCount: number;
  nightsLabel: string;
  view: ResultsView;
  onViewChange: (view: ResultsView) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          {destination}: {propertyCount} properties found
        </h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          {nightsLabel}
          <Info className="h-3.5 w-3.5" />
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Below `lg` this moves next to the Filters/Map buttons in FilterPanel instead —
            same breakpoint as FilterPanel's mobile row, so it never shows in both places. */}
        <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
          <span>Sort by:</span>
          <SortSelect />
        </div>

        <div className="hidden items-center rounded-lg border border-border bg-white p-1 sm:flex">
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "list" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            type="button"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "grid" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
        </div>
      </div>
    </div>
  );
}
