"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMapInstance } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, LocateFixed } from "lucide-react";

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  price: string;
};

type LeafletMapProps = {
  pins: MapPin[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  className?: string;
};

type LeafletModule = typeof import("leaflet");

function createPriceIcon(L: LeafletModule, price: string, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="rv-map-pin${active ? " rv-map-pin--active" : ""}">${price}</span>`,
    iconSize: [0, 0],
  });
}

export function LeafletMap({ pins, activeId, onHover, onSelect, className }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const markersRef = useRef<Record<string, ReturnType<LeafletModule["marker"]>>>({});
  const handlersRef = useRef({ onHover, onSelect });
  handlersRef.current = { onHover, onSelect };

  useEffect(() => {
    let disposed = false;
    let map: LeafletMapInstance | null = null;
    let observer: ResizeObserver | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      const container = containerRef.current;
      if (disposed || !container) return;

      leafletRef.current = L;
      const instance = L.map(container, {
        center: [25.2048, 55.2708],
        zoom: 12,
        scrollWheelZoom: false,
      });
      map = instance;
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markers: ReturnType<typeof L.marker>[] = [];

      pins.forEach((pin) => {
        const marker = L.marker([pin.lat, pin.lng], {
          icon: createPriceIcon(L, pin.price, activeId === pin.id),
          zIndexOffset: activeId === pin.id ? 1000 : 0,
        });
        marker.on("mouseover", () => handlersRef.current.onHover?.(pin.id));
        marker.on("mouseout", () => handlersRef.current.onHover?.(null));
        marker.on("click", () => handlersRef.current.onSelect?.(pin.id));
        marker.addTo(instance);
        markersRef.current[pin.id] = marker;
        markers.push(marker);
      });

      if (markers.length > 1) {
        instance.fitBounds(L.latLngBounds(markers.map((m) => m.getLatLng())), { padding: [40, 40] });
      } else if (markers.length === 1) {
        instance.setView(markers[0].getLatLng(), 14);
      }

      const invalidate = () => {
        if (mapRef.current && !disposed) {
          mapRef.current.invalidateSize();
        }
      };

      observer = new ResizeObserver(invalidate);
      observer.observe(container);
      window.setTimeout(invalidate, 0);
      window.setTimeout(invalidate, 350);
    })();

    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    pins.forEach((pin) => {
      const marker = markersRef.current[pin.id];
      if (!marker) return;
      marker.setIcon(createPriceIcon(L, pin.price, activeId === pin.id));
      marker.setZIndexOffset(activeId === pin.id ? 1000 : 0);
    });
  }, [pins, activeId]);

  return (
    <div className={className ?? "relative h-full w-full"}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute bottom-3 right-3 z-[500] flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-8 w-8 items-center justify-center hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="h-px bg-border" />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-8 w-8 items-center justify-center hover:bg-muted"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          aria-label="Locate me"
          onClick={() => mapRef.current?.locate({ setView: true })}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white shadow-sm hover:bg-muted"
        >
          <LocateFixed className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


