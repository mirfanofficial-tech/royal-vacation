"use client";

import { useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Mapbox3DMapProps = {
  lat: number;
  lng: number;
  name: string;
  className?: string;
};

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const HAS_MAPBOX_TOKEN =
  !!MAPBOX_TOKEN && !MAPBOX_TOKEN.includes("YOUR_MAPBOX_TOKEN");

export function Mapbox3DMap({ lat, lng, name, className }: Mapbox3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: MapboxMap | null = null;

    (async () => {
      if (!HAS_MAPBOX_TOKEN) return;

      const mapboxgl = (await import("mapbox-gl")).default;
      if (disposed || !containerRef.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      const instance = new mapboxgl.Map({
        container: containerRef.current,
        center: [lng, lat],
        zoom: 15.5,
        pitch: 60,
        bearing: -20,
        style: "mapbox://styles/mapbox/streets-v12",
        antialias: true,
        attributionControl: true,
      });
      map = instance;
      mapRef.current = map;

      instance.on("load", () => {
        if (disposed || !mapRef.current) return;
        mapRef.current.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.terrain-rgb",
          tileSize: 512,
          maxzoom: 14,
        });
        mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        mapRef.current.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["coalesce", ["get", "height"], 0],
            "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
            "fill-extrusion-opacity": 0.6,
          },
        });

        new mapboxgl.Marker({ color: "#c9973c" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
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
      {!HAS_MAPBOX_TOKEN && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
          Set NEXT_PUBLIC_MAPBOX_TOKEN in client/.env.local to enable the 3D map.
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
