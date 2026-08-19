"use client";

import { useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import type { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Mapbox3DMapProps = {
  lat: number;
  lng: number;
  name: string;
  className?: string;
};

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

const BUILDING_SOURCE_LAYERS = [
  "building",
  "buildings",
  "building-extrusion",
  "building_polygon",
  "structures",
  "building_parts",
];

function getStyleUrl(): string {
  if (MAPTILER_KEY) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
  }
  return "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
}

function getTerrainUrl(): string | null {
  if (!MAPTILER_KEY) return null;
  return `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`;
}

export function Mapbox3DMap({ lat, lng, name, className }: Mapbox3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: MaplibreMap | null = null;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (disposed || !containerRef.current) return;

      const m = new maplibregl.Map({
        container: containerRef.current,
        center: [lng, lat],
        zoom: 16,
        pitch: 65,
        bearing: -20,
        maxPitch: 85,
        style: getStyleUrl(),
        attributionControl: {},
      });
      map = m;
      mapRef.current = m;

      m.on("error", (e) => {
        console.error("MapLibre error:", e.error?.message ?? e);
      });

      m.on("load", () => {
        if (disposed) return;

        const terrainUrl = getTerrainUrl();
        if (terrainUrl) {
          m.addSource("terrain", {
            type: "raster-dem",
            url: terrainUrl,
            tileSize: 512,
            maxzoom: 14,
          });
          m.setTerrain({ source: "terrain", exaggeration: 1.5 });
          m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
        }

        const style = m.getStyle();
        const vectorKeys = Object.keys(style.sources).filter(
          (k) => style.sources[k].type === "vector"
        );

        for (const key of vectorKeys) {
          const src = style.sources[key] as {
            vector_layers?: Array<{ id: string }>;
          };
          const layerIds = src.vector_layers?.map((l) => l.id) ?? [];
          const match = layerIds.find((id) =>
            BUILDING_SOURCE_LAYERS.includes(id)
          );
          if (match) {
            try {
              m.addLayer({
                id: "3d-buildings",
                source: key,
                "source-layer": match,
                type: "fill-extrusion",
                minzoom: 14,
                paint: {
                  "fill-extrusion-color": [
                    "interpolate",
                    ["linear"],
                    ["coalesce", ["get", "render_height"], ["get", "height"], 0],
                    0,
                    "#dde4f0",
                    50,
                    "#c5d0e6",
                    100,
                    "#9faec4",
                  ],
                  "fill-extrusion-height": [
                    "coalesce",
                    ["get", "render_height"],
                    ["get", "height"],
                    0,
                  ],
                  "fill-extrusion-base": [
                    "coalesce",
                    ["get", "render_min_height"],
                    ["get", "min_height"],
                    0,
                  ],
                  "fill-extrusion-opacity": 0.7,
                },
              });
              break;
            } catch {
              /* source-layer in metadata but not in tiles */
            }
          }
        }

        new maplibregl.Marker({ color: "#c9973c", scale: 1.2 })
          .setLngLat([lng, lat])
          .addTo(m);
      });
    })();

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div ref={containerRef} className="h-full w-full" />
      {!MAPTILER_KEY && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
          Set NEXT_PUBLIC_MAPTILER_KEY in client/.env.local to enable the 3D map with buildings.
        </div>
      )}
      <div className="absolute bottom-3 right-3 z-10 flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 text-xs font-medium text-muted-foreground shadow-sm">
        <Layers className="h-3.5 w-3.5" />
        3D View
      </div>
      {name && (
        <div className="absolute left-3 top-3 z-10 max-w-[70%] truncate rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">
          {name}
        </div>
      )}
    </div>
  );
}
