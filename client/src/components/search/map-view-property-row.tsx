"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, MapPin, Check, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { SearchProperty } from "@/lib/search-mock-data";

export function MapViewPropertyRow({
  property,
  highlighted,
  onHover,
}: {
  property: SearchProperty;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <article
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`flex gap-4 rounded-xl border p-3 transition-colors ${
        highlighted ? "border-navy bg-navy/5" : "border-border bg-white"
      }`}
    >
      <Link
        href={`/property/${property.id}`}
        className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg"
      >
        <Image src={property.image} alt={property.name} fill className="object-cover" sizes="112px" />
        {property.badge && (
          <span
            className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${
              property.badge.tone === "bestseller" ? "bg-navy" : "bg-gold text-navy-dark"
            }`}
          >
            {property.badge.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading text-base font-bold text-navy hover:underline">
              <Link href={`/property/${property.id}`}>{property.name}</Link>
            </h3>
            <span className="mt-0.5 flex items-center gap-0.5">
              {Array.from({ length: property.starRating }, (_, i) => (
                <Star key={i} className="h-3 w-3 fill-gold text-gold" />
              ))}
            </span>
          </div>
          <button
            type="button"
            aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
            aria-pressed={favorited}
            onClick={() => toggleFavorite(property.id)}
            className="shrink-0 text-muted-foreground hover:text-navy"
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 min-w-5 items-center justify-center rounded bg-navy px-1 text-[11px] font-bold text-white">
              {property.rating.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-foreground">{property.ratingLabel}</span>
            <span className="text-[11px] text-muted-foreground">
              {property.reviews.toLocaleString()} reviews
            </span>
          </div>
          <p className="shrink-0 text-right">
            <span className="text-sm font-bold text-foreground">
              {property.currency} {property.price.toLocaleString()}
            </span>
            <span className="block text-[11px] text-muted-foreground">/ night</span>
          </p>
        </div>

        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {property.location} &middot; {property.distance}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-rating">
          {property.freeCancellation && (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" /> Free cancellation
            </span>
          )}
          {property.amenityTags.some((tag) => /breakfast/i.test(tag)) && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Coffee className="h-3 w-3" /> Breakfast included
            </span>
          )}
        </div>

        <div className="mt-auto flex justify-end pt-1">
          <Button
            render={<Link href={`/property/${property.id}`} />}
            nativeButton={false}
            size="sm"
            className="rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}
