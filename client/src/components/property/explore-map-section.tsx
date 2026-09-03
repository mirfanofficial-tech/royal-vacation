"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Map as MapIcon, Satellite, Maximize2, MapPin, X } from "lucide-react";
import { Mapbox3DMap } from "@/components/property/mapbox-3d-map";
import type { NearbyPlace } from "@/lib/property-detail-mock-data";

const viewModes = [
  { id: "3d", label: "3D View", icon: Box },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "satellite", label: "Satellite", icon: Satellite },
] as const;

type ViewMode = (typeof viewModes)[number]["id"];

function ViewModeTabs({
  viewMode,
  onChange,
  className = "",
}: {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
  className?: string;
}) {
  return (
    <div className={`items-center gap-1 rounded-lg border border-border p-1 ${className}`}>
      {viewModes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            viewMode === mode.id ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
          }`}
        >
          <mode.icon className="h-3.5 w-3.5" />
          {mode.label}
        </button>
      ))}
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

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
          <ViewModeTabs viewMode={viewMode} onChange={setViewMode} className="hidden sm:flex" />
          <button
            type="button"
            onClick={() => setExpanded(true)}
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

      {expanded &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[2500] flex flex-col bg-black/70 p-2 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`Map — ${name}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpanded(false);
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-bold text-navy">{name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ViewModeTabs viewMode={viewMode} onChange={setViewMode} className="flex" />
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label="Close map"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:border-navy hover:text-navy"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="relative min-h-0 flex-1">
                <Mapbox3DMap
                  key={`expanded-${viewMode}`}
                  lat={lat}
                  lng={lng}
                  name={name}
                  viewMode={viewMode}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

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
