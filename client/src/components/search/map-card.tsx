"use client";

import { Maximize2 } from "lucide-react";
import { LeafletMap } from "@/components/search/leaflet-map";
import { mapPins } from "@/lib/search-mock-data";

export function MapCard({ onExpand }: { onExpand?: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="relative isolate aspect-[16/9] w-full">
        <LeafletMap pins={mapPins} className="h-full w-full" showZoomControls={false} />

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="absolute bottom-3 left-3 z-[500] flex w-fit items-center gap-1.5 rounded-lg bg-navy-dark/90 px-3 py-2 text-sm font-semibold text-white shadow-md backdrop-blur-sm hover:bg-navy-dark"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Show map
          </button>
        )}
      </div>
    </div>
  );
}
