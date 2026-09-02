"use client";

import { useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import type { Map as MaplibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapViewMode = "3d" | "map" | "satellite";

type Mapbox3DMapProps = {
  lat: number;
  lng: number;
  name: string;
  viewMode?: MapViewMode;
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

const MODE_LABEL: Record<MapViewMode, string> = {
  "3d": "3D View",
  map: "Map",
  satellite: "Satellite",
};

/** Key-free satellite basemap (Esri World Imagery raster tiles). */
const ESRI_SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri-imagery", type: "raster", source: "esri-imagery" }],
};

function styleForMode(mode: MapViewMode): string | StyleSpecification {
  if (mode === "satellite") {
    return MAPTILER_KEY
      ? `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`
      : ESRI_SATELLITE_STYLE;
  }
  // 3d + flat map share the same street basemap.
  return MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
}

function add3dBuildings(m: MaplibreMap) {
  if (m.getLayer("3d-buildings")) return;
  const style = m.getStyle();
  const vectorKeys = Object.keys(style.sources).filter(
    (k) => style.sources[k].type === "vector",
  );
  for (const key of vectorKeys) {
    const src = style.sources[key] as { vector_layers?: Array<{ id: string }> };
    const layerIds = src.vector_layers?.map((l) => l.id) ?? [];
    const match = layerIds.find((id) => BUILDING_SOURCE_LAYERS.includes(id));
    if (!match) continue;
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
      return;
    } catch {
      /* source-layer in metadata but not in the tiles */
    }
  }
}

function applyView(m: MaplibreMap, mode: MapViewMode) {
  if (mode === "3d") {
    m.easeTo({ pitch: 65, bearing: -20, duration: 500 });
    if (MAPTILER_KEY && !m.getSource("terrain")) {
      m.addSource("terrain", {
        type: "raster-dem",
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
        tileSize: 512,
        maxzoom: 14,
      });
      m.setTerrain({ source: "terrain", exaggeration: 1.5 });
    }
    add3dBuildings(m);
  } else {
    try {
      m.setTerrain(null);
    } catch {
      /* no terrain set */
    }
    m.easeTo({ pitch: 0, bearing: 0, duration: 500 });
  }
}

export function Mapbox3DMap({ lat, lng, name, viewMode = "3d", className }: Mapbox3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const modeRef = useRef<MapViewMode>(viewMode);
  modeRef.current = viewMode;

  // Create the map once (recreate only if the coordinates change).
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
        pitch: modeRef.current === "3d" ? 65 : 0,
        bearing: modeRef.current === "3d" ? -20 : 0,
        maxPitch: 85,
        style: styleForMode(modeRef.current),
        attributionControl: {},
      });
      map = m;
      mapRef.current = m;

      m.on("error", (e) => console.error("MapLibre error:", e.error?.message ?? e));
      m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

      m.on("load", () => {
        if (disposed) return;
        applyView(m, modeRef.current);
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

      {!MAPTILER_KEY && viewMode === "3d" && (
        <div className="absolute right-3 top-3 z-10 max-w-[60%] rounded-md bg-white/95 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm">
          Add NEXT_PUBLIC_MAPTILER_KEY for photorealistic buildings & terrain.
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-10 flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 text-xs font-medium text-muted-foreground shadow-sm">
        <Layers className="h-3.5 w-3.5" />
        {MODE_LABEL[viewMode]}
      </div>

      {name && (
        <div className="absolute left-3 top-3 z-10 max-w-[70%] truncate rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">
          {name}
        </div>
      )}
    </div>
  );
}
