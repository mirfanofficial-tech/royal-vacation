"use client";

import { useState } from "react";
import { Box, Map as MapIcon, Satellite, Maximize2, MapPin } from "lucide-react";
import { Mapbox3DMap } from "@/components/property/mapbox-3d-map";
import type { NearbyPlace } from "@/lib/property-detail-mock-data";

const viewModes = [
  { id: "3d", label: "3D View", icon: Box },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "satellite", label: "Satellite", icon: Satellite },
] as const;

export function ExploreMapSection({
  name,
  location,
  lat,
  lng,
  distance,
  nearby,
  gettingAround,
}: {
  name: string;
  location: string;
  lat: number;
  lng: number;
  distance: string;
  nearby: NearbyPlace[];
  gettingAround: NearbyPlace[];
}) {
  const [viewMode, setViewMode] = useState<(typeof viewModes)[number]["id"]>("3d");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy">Explore the area in 3D</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {location} &mdash; {distance}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-1 rounded-lg border border-border p-1 sm:flex">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode.id
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:text-navy"
                }`}
              >
                <mode.icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-navy hover:text-navy"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Expand map
          </button>
        </div>
      </div>

      <div className="relative h-[380px]">
        {/* Remount on tab change — a fresh maplibre instance with the right
            style/camera is far more reliable than live setStyle swapping. */}
        <Mapbox3DMap
          key={viewMode}
          lat={lat}
          lng={lng}
          name={name}
          viewMode={viewMode}
          className="h-full w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy">What&apos;s nearby</h3>
          <ul className="flex flex-col gap-2">
            {nearby.map((place) => (
              <li key={place.label} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{place.label}</span>
                <span className="text-muted-foreground">{place.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy">Getting around</h3>
          <ul className="flex flex-col gap-2">
            {gettingAround.map((place) => (
              <li key={place.label} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{place.label}</span>
                <span className="text-muted-foreground">{place.distance}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
