"use client";

import { useState } from "react";
import { ResultsToolbar, type ResultsView } from "@/components/search/results-toolbar";
import { FilterPanel } from "@/components/search/filter-panel";
import { GeniusInlineBanner } from "@/components/search/genius-inline-banner";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchResultGridCard } from "@/components/search/search-result-grid-card";
import { Pagination } from "@/components/search/pagination";
import { MapCard } from "@/components/search/map-card";
import { WhyBookCard } from "@/components/search/why-book-card";
import { DiscoverCard } from "@/components/search/discover-card";
import { RecentlyViewedCard } from "@/components/search/recently-viewed-card";
import { MapViewDialog } from "@/components/search/map-view-dialog";
import type { SearchProperty } from "@/lib/search-mock-data";

export function SearchResultsView({
  destination,
  propertyCount,
  nightsLabel,
  properties,
  defaultTypeId,
}: {
  destination: string;
  propertyCount: number;
  nightsLabel: string;
  properties: SearchProperty[];
  defaultTypeId?: string;
}) {
  const [view, setView] = useState<ResultsView>("list");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const showOnMap = (id: string) => {
    setHighlightedId(id);
    setMapDialogOpen(true);
  };

  return (
    <>
      <div className="mt-6">
        <ResultsToolbar
          destination={destination}
          propertyCount={propertyCount}
          nightsLabel={nightsLabel}
          view={view}
          onViewChange={setView}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr_280px]">
        <FilterPanel defaultTypeId={defaultTypeId} />

        <section className="flex flex-col gap-4">
          <GeniusInlineBanner />

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

        <aside className="flex flex-col gap-5">
          <MapCard onExpand={() => setMapDialogOpen(true)} />
          <WhyBookCard />
          <DiscoverCard destination={destination} />
          <RecentlyViewedCard />
        </aside>
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
