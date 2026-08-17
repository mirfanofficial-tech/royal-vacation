"use client";

import { MapPin } from "lucide-react";
import { LeafletMap } from "@/components/search/leaflet-map";

export function MiniMapCard({
  location,
  lat,
  lng,
}: {
  location: string;
  lat: number;
  lng: number;
}) {
  return (
    <div id="location" className="scroll-mt-36 overflow-hidden rounded-xl border border-border bg-white">
      <div className="relative aspect-[4/3] w-full">
        <LeafletMap
          pins={[{ id: "property", lat, lng, price: "You're here" }]}
          className="h-full w-full"
        />
      </div>
      <div className="p-3">
        <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {location}
        </p>
        <button
          type="button"
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
        >
          View on map
        </button>
      </div>
    </div>
  );
}
