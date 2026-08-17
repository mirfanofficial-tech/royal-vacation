"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X, Maximize2, ArrowRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { MapViewPropertyRow } from "@/components/search/map-view-property-row";
import { LeafletMap } from "@/components/search/leaflet-map";
import { decorativeMapPins, type SearchProperty } from "@/lib/search-mock-data";

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price (low to high)" },
  { value: "price-high", label: "Price (high to low)" },
  { value: "rating", label: "Guest rating" },
];

export function MapViewDialog({
  open,
  onOpenChange,
  properties,
  propertyCount,
  highlightedId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: SearchProperty[];
  propertyCount: number;
  highlightedId: string | null;
}) {
  const [followMap, setFollowMap] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const activeId = hoveredId ?? highlightedId;

  const mapPins = [
    ...decorativeMapPins.map((pin) => ({
      id: pin.id,
      lat: pin.lat,
      lng: pin.lng,
      price: pin.price,
    })),
    ...properties.map((property) => ({
      id: property.id,
      lat: property.lat,
      lng: property.lng,
      price: `${property.currency} ${property.price.toLocaleString()}`,
    })),
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <DialogPrimitive.Close
          aria-label="Close map view"
          className="fixed right-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <DialogPrimitive.Popup
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden rounded-none bg-white shadow-2xl duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95 lg:transition-[grid-template-columns] lg:duration-300 ${
            panelOpen ? "lg:grid-cols-[260px_440px_1fr]" : "lg:grid-cols-[0px_0px_1fr]"
          } lg:grid lg:grid-rows-1`}
        >
          <DialogPrimitive.Title className="sr-only">Map view of search results</DialogPrimitive.Title>

          <div
            className={`hidden min-w-0 flex-col overflow-y-auto border-border lg:flex lg:w-[260px] lg:border-b-0 lg:border-r ${
              panelOpen ? "" : "lg:hidden"
            }`}
          >
            <div className="p-4">
              <FilterSidebar />
            </div>
          </div>

          <div
            className={`flex min-w-0 flex-col overflow-y-auto border-border lg:min-h-0 lg:w-[440px] lg:border-b-0 lg:border-r ${
              panelOpen ? "" : "lg:hidden"
            }`}
          >
            <div className="max-h-[40vh] shrink-0 overflow-y-auto p-4 lg:max-h-none lg:shrink lg:overflow-visible">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-navy">
                  {propertyCount.toLocaleString()} properties
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Sort by:</span>
                  <Select defaultValue="recommended">
                    <SelectTrigger className="h-8 min-w-[130px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {properties.map((property) => (
                  <MapViewPropertyRow
                    key={property.id}
                    property={property}
                    highlighted={activeId === property.id}
                    onHover={setHoveredId}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative order-first min-h-0 flex-1 lg:order-none">
            <LeafletMap
              pins={mapPins}
              activeId={activeId}
              onHover={setHoveredId}
              className="absolute inset-0"
            />

            <button
              type="button"
              aria-label={panelOpen ? "Hide filters and property list" : "Show filters and property list"}
              onClick={() => setPanelOpen((v) => !v)}
              className="absolute left-0 top-1/2 z-20 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border bg-white text-muted-foreground shadow-md hover:bg-muted hover:text-navy lg:flex"
            >
              {panelOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>

            <label
              htmlFor="follow-map-dialog"
              className="absolute left-4 top-4 z-20 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-foreground shadow-md"
            >
              <Checkbox
                id="follow-map-dialog"
                checked={followMap}
                onCheckedChange={(checked) => setFollowMap(checked === true)}
              />
              Search as I move the map
            </label>

            <DialogPrimitive.Close className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-navy-light">
              <X className="h-3.5 w-3.5" />
              Close map
            </DialogPrimitive.Close>

            <button
              type="button"
              aria-label="Fullscreen"
              className="absolute right-4 top-16 z-20 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white shadow-sm hover:bg-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              className="absolute bottom-4 left-4 z-20 hidden items-center gap-1 rounded-lg bg-white/95 px-3 py-2 text-xs text-muted-foreground shadow-sm hover:text-navy lg:flex"
            >
              Something wrong with the map?
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
