"use client";

import { Star, MapPin, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { PropertyDetail } from "@/lib/property-detail-mock-data";

export function PropertySummary({ property }: { property: PropertyDetail }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-0.5">
            {Array.from({ length: property.starRating }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </span>
          {property.badge && (
            <span className="rounded border border-border px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {property.badge}
            </span>
          )}
        </div>

        <h1 className="mt-1.5 font-heading text-2xl font-bold text-navy sm:text-3xl">
          {property.name}
        </h1>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.location}
          <a href="#location" className="font-semibold text-emerald-600 hover:underline">
            Great location - show map
          </a>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="text-right">
          <span className="text-xl font-bold text-foreground">
            {property.currency} {property.price.toLocaleString()}
          </span>
          <span className="block text-xs text-muted-foreground">per night · excl. taxes</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={favorited}
            onClick={() => toggleFavorite(property.id)}
            aria-label={favorited ? "Remove from saved" : "Save"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-navy hover:text-navy"
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-navy hover:text-navy"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <Button
            render={<a href="#availability" />}
            nativeButton={false}
            className="rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            Reserve
          </Button>
        </div>
      </div>
    </div>
  );
}
