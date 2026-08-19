"use client";

import { useEffect, useState } from "react";
import { ResultsToolbar, type ResultsView } from "@/components/search/results-toolbar";
import { FilterPanel } from "@/components/search/filter-panel";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchResultGridCard } from "@/components/search/search-result-grid-card";
import { Pagination } from "@/components/search/pagination";
import { MapCard } from "@/components/search/map-card";
import { WhyBookCard } from "@/components/search/why-book-card";
import { DiscoverCard } from "@/components/search/discover-card";
import { RecentlyViewedCard } from "@/components/search/recently-viewed-card";
import { MapViewDialog } from "@/components/search/map-view-dialog";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchLoadingHeader } from "@/components/search/search-loading-header";
import { SearchLoadingSkeleton } from "@/components/search/search-loading-skeleton";
import { SearchWaitTips } from "@/components/search/search-wait-tips";
import type { SearchProperty } from "@/lib/search-mock-data";

// Simulates the time a real search API would take — this page fetches from
// static mock data with no real backend behind it, so the delay is faked to
// give the loading experience below something real to fill. Swap for an
// actual `isLoading` from the fetch once a real search endpoint exists.
const SIMULATED_SEARCH_DELAY_MS = 2500;

export function SearchResultsView({
  destination,
  destinationFull,
  propertyCount,
  nightsLabel,
  dateRangeLabel,
  adults,
  rooms,
  properties,
  defaultTypeId,
}: {
  destination: string;
  destinationFull: string;
  propertyCount: number;
  nightsLabel: string;
  dateRangeLabel: string;
  adults: number;
  rooms: number;
  properties: SearchProperty[];
  defaultTypeId?: string;
}) {
  const [view, setView] = useState<ResultsView>("list");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const id = window.setTimeout(() => setIsLoading(false), SIMULATED_SEARCH_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [destinationFull, dateRangeLabel]);

  const showOnMap = (id: string) => {
    setHighlightedId(id);
    setMapDialogOpen(true);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="mt-4">
          <SearchLoadingHeader
            propertyCount={propertyCount}
            dateRangeLabel={dateRangeLabel}
            adults={adults}
            rooms={rooms}
            view={view}
          />
        </div>

        <SearchLoadingSkeleton />

        <div className="mt-8">
          <SearchWaitTips />
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Search Results" },
          { label: destinationFull },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-5">
          <div className="hidden lg:block">
            <MapCard onExpand={() => setMapDialogOpen(true)} />
          </div>
          <FilterPanel defaultTypeId={defaultTypeId} onOpenMap={() => setMapDialogOpen(true)} />
        </aside>

        <section className="flex flex-col gap-4">
          <ResultsToolbar
            destination={destination}
            propertyCount={propertyCount}
            nightsLabel={nightsLabel}
            view={view}
            onViewChange={setView}
          />

          {view === "list" ? (
            <div className="flex flex-col gap-4">
              {properties.map((property) => (
                <SearchResultCard
                  key={property.id}
                  property={property}
                  onShowOnMap={showOnMap}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
              {properties.map((property) => (
                <SearchResultGridCard
                  key={property.id}
                  property={property}
                  onShowOnMap={showOnMap}
                />
              ))}
            </div>
          )}

          <div className="mt-2">
            <Pagination totalPages={27} />
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <WhyBookCard />
        <DiscoverCard destination={destination} />
        <RecentlyViewedCard />
      </div>

      <MapViewDialog
        open={mapDialogOpen}
        onOpenChange={setMapDialogOpen}
        properties={properties}
        propertyCount={propertyCount}
        highlightedId={highlightedId}
      />
    </>
  );
}
