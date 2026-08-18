"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMapInstance } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, LocateFixed } from "lucide-react";

export type MapPinDetails = {
  image: string;
  badge?: { label: string; tone: "bestseller" | "discount" };
  extraPhotosCount: number;
  name: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  distance: string;
  quote: string;
  amenityTags: string[];
  featuresCount: number;
  freeCancellation: boolean;
  noPrepayment: boolean;
  originalPrice?: number;
  discountPercent?: number;
  currency: string;
  priceValue: number;
  nights: number;
  totalPrice: number;
};

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  price: string;
  details?: MapPinDetails;
};

type LeafletMapProps = {
  pins: MapPin[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  className?: string;
  showZoomControls?: boolean;
};

type LeafletModule = typeof import("leaflet");

function createPriceIcon(L: LeafletModule, price: string, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="rv-map-pin${active ? " rv-map-pin--active" : ""}">${price}</span>`,
    iconSize: [0, 0],
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createHoverCardHtml(id: string, details: MapPinDetails) {
  const stars = "&#9733;".repeat(details.starRating);
  const badgeToneClass =
    details.badge?.tone === "bestseller"
      ? "rv-map-hovercard__badge--bestseller"
      : "rv-map-hovercard__badge--discount";
  const tagsHtml = details.amenityTags
    .slice(0, 2)
    .map((tag) => `<span class="rv-map-hovercard__tag">${escapeHtml(tag)}</span>`)
    .join("");
  const moreFeaturesHtml =
    details.featuresCount > 0
      ? `<span class="rv-map-hovercard__tag-more">+${details.featuresCount} more</span>`
      : "";
  const discountHtml =
    details.originalPrice && details.discountPercent
      ? `
        <div class="rv-map-hovercard__discount">
          <span class="rv-map-hovercard__discount-badge">${details.discountPercent}% OFF</span>
          <span class="rv-map-hovercard__discount-original">${escapeHtml(details.currency)} ${details.originalPrice.toLocaleString()}</span>
        </div>`
      : "";

  return `
    <a href="/property/${encodeURIComponent(id)}" class="rv-map-hovercard">
      <div class="rv-map-hovercard__image" style="background-image:url('${details.image}')">
        ${
          details.badge
            ? `<span class="rv-map-hovercard__badge ${badgeToneClass}">${escapeHtml(details.badge.label)}</span>`
            : ""
        }
        <span class="rv-map-hovercard__photos">+${details.extraPhotosCount} photos</span>
      </div>
      <div class="rv-map-hovercard__body">
        <p class="rv-map-hovercard__title">${escapeHtml(details.name)}</p>
        <p class="rv-map-hovercard__stars">${stars}</p>
        <div class="rv-map-hovercard__rating">
          <span class="rv-map-hovercard__rating-badge">${details.rating.toFixed(1)}</span>
          <span class="rv-map-hovercard__rating-label">${escapeHtml(details.ratingLabel)}</span>
          <span class="rv-map-hovercard__rating-reviews">${details.reviews.toLocaleString()} reviews</span>
        </div>
        <p class="rv-map-hovercard__location">${escapeHtml(details.location)} &middot; ${escapeHtml(details.distance)}</p>
        <p class="rv-map-hovercard__quote">${escapeHtml(details.quote)}</p>
        <div class="rv-map-hovercard__tags">${tagsHtml}${moreFeaturesHtml}</div>
        <div class="rv-map-hovercard__policies">
          ${details.freeCancellation ? `<span class="rv-map-hovercard__policy">&#10003; Free cancellation</span>` : ""}
          ${details.noPrepayment ? `<span class="rv-map-hovercard__policy">&#10003; No prepayment needed</span>` : ""}
        </div>
        ${discountHtml}
        <p class="rv-map-hovercard__price">${escapeHtml(details.currency)} ${details.priceValue.toLocaleString()}<span> / night</span></p>
        <p class="rv-map-hovercard__total">Total for ${details.nights} nights ${escapeHtml(details.currency)} ${details.totalPrice.toLocaleString()}</p>
        <span class="rv-map-hovercard__button">View details</span>
      </div>
    </a>
  `;
}

export function LeafletMap({
  pins,
  activeId,
  onHover,
  onSelect,
  className,
  showZoomControls = true,
}: LeafletMapProps) {
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
        zoomControl: false,
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
        if (pin.details) {
          marker.bindTooltip(createHoverCardHtml(pin.id, pin.details), {
            direction: "top",
            offset: [0, -18],
            opacity: 1,
            interactive: true,
            className: "rv-map-hovercard-wrapper",
          });
        }
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
        {showZoomControls && (
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
        )}
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


