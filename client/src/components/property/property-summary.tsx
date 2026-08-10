"use client";

import { Star, MapPin, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { PropertyDetail } from "@/lib/property-detail-mock-data";

export function PropertySummary({ property }: { property: PropertyDetail }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            {property.name}
          </h1>
          {property.badge && (
            <span className="rounded bg-rating px-2 py-0.5 text-xs font-bold text-white">
              {property.badge}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <span className="flex items-center gap-0.5">
            {Array.from({ length: property.starRating }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="rounded bg-rating px-1.5 py-0.5 text-xs font-bold text-white">
              {property.rating.toFixed(1)} {property.ratingLabel}
            </span>
            <span className="text-muted-foreground">
              {property.reviews.toLocaleString()} reviews
            </span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.location} &middot; {property.distance}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            aria-pressed={favorited}
            onClick={() => toggleFavorite(property.id)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
            {favorited ? "Saved" : "Save"}
          </button>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p>
            <span className="text-xl font-bold text-foreground">
              {property.currency} {property.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground"> / night</span>
          </p>
          <Button
            render={<a href="#availability" />}
            nativeButton={false}
            className="rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            See availability
          </Button>
        </div>
      </div>
    </div>
  );
}
