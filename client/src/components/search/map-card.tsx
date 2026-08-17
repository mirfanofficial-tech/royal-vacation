"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LeafletMap } from "@/components/search/leaflet-map";
import { mapPins } from "@/lib/search-mock-data";

export function MapCard({ onExpand }: { onExpand?: () => void }) {
  const [followMap, setFollowMap] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <label
        htmlFor="follow-map"
        className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 text-sm text-foreground"
      >
        <Checkbox
          id="follow-map"
          checked={followMap}
          onCheckedChange={(checked) => setFollowMap(checked === true)}
        />
        Search as I move the map
      </label>

      <div className="relative aspect-square w-full">
        <LeafletMap pins={mapPins} className="h-full w-full" />
      </div>

      {onExpand && (
        <div className="p-3">
          <Button
            onClick={onExpand}
            variant="outline"
            className="w-full gap-1.5 rounded-lg"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Show map
          </Button>
        </div>
      )}
    </div>
  );
}
