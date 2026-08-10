"use client";

import { useState } from "react";
import { Plus, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

      <div
        className="relative aspect-square w-full bg-[#dce6ef]"
        style={{
          backgroundImage:
            "linear-gradient(#c8d6e3 1px, transparent 1px), linear-gradient(90deg, #c8d6e3 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        {mapPins.map((pin) => (
          <span
            key={pin.id}
            style={{ top: pin.top, left: pin.left }}
            className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full px-2 py-1 text-[11px] font-bold shadow-md ${
              pin.highlight ? "bg-navy text-white" : "bg-white text-navy"
            }`}
          >
            {pin.price}
          </span>
        ))}

        <div className="absolute bottom-2 right-2 z-10 flex flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm">
          <button
            type="button"
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="h-px bg-border" />
          <button
            type="button"
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center hover:bg-muted"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
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
