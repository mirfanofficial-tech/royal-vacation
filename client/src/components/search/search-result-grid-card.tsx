"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, MapPin, MapPinned, Check } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { SearchProperty } from "@/lib/search-mock-data";

export function SearchResultGridCard({
  property,
  onShowOnMap,
}: {
  property: SearchProperty;
  onShowOnMap?: (id: string) => void;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Link href={`/property/${property.id}`} className="absolute inset-0 z-0">
          <Image
            src={property.image}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        </Link>
        {property.badge && (
          <span
            className={`absolute left-2 top-2 z-10 rounded px-2 py-0.5 text-xs font-bold text-white ${
              property.badge.tone === "bestseller" ? "bg-navy" : "bg-gold text-navy-dark"
            }`}
          >
            {property.badge.label}
          </span>
        )}
        <span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
          +{property.extraPhotosCount} photos
        </span>
      </div>
      <button
        type="button"
        aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
        aria-pressed={favorited}
        onClick={() => toggleFavorite(property.id)}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm hover:bg-white"
      >
        <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-heading text-base font-bold text-navy hover:underline">
          <Link href={`/property/${property.id}`}>{property.name}</Link>
        </h3>

        <span className="flex items-center gap-0.5">
          {Array.from({ length: property.starRating }, (_, i) => (
            <Star key={i} className="h-3 w-3 fill-gold text-gold" />
          ))}
        </span>

        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded bg-rating px-1.5 text-xs font-bold text-white">
            {property.rating.toFixed(1)}
          </span>
          <p className="truncate text-xs font-semibold text-foreground">
            {property.ratingLabel}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {property.reviews.toLocaleString()} reviews
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </p>
          {onShowOnMap && (
            <button
              type="button"
              aria-label="Show on map"
              onClick={() => onShowOnMap(property.id)}
              className="shrink-0 text-navy hover:text-gold"
            >
              <MapPinned className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="line-clamp-1 text-sm italic text-muted-foreground">{property.quote}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {property.amenityTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-rating/10 px-2 py-0.5 text-xs font-medium text-rating"
            >
              {tag}
            </span>
          ))}
          {property.features.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              +{property.features.length} more
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs">
          {property.freeCancellation && (
            <span className="flex items-center gap-1 text-rating">
              <Check className="h-3.5 w-3.5" /> Free cancellation
            </span>
          )}
          {property.noPrepayment && (
            <span className="flex items-center gap-1 text-rating">
              <Check className="h-3.5 w-3.5" /> No prepayment needed
            </span>
          )}
        </div>

        <div className="mt-auto border-t border-border pt-3">
          {property.originalPrice && property.discountPercent && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                {property.discountPercent}% OFF
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {property.currency} {property.originalPrice.toLocaleString()}
              </span>
            </div>
          )}
          <p className="mt-0.5 text-lg font-bold text-foreground">
            {property.currency} {property.price.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Total for {property.nights} nights {property.currency}{" "}
            {property.totalPrice.toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}
