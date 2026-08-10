"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MapPinned } from "lucide-react";
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
        {onShowOnMap && (
          <button
            type="button"
            onClick={() => onShowOnMap(property.id)}
            className="absolute inset-x-0 bottom-3 z-10 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          >
            <MapPinned className="h-3.5 w-3.5" />
            Show on map
          </button>
        )}
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
        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded bg-rating px-1.5 text-xs font-bold text-white">
            {property.rating.toFixed(1)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold text-foreground">
              {property.ratingLabel}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {property.reviews} reviews
            </p>
          </div>
        </div>

        <h3 className="line-clamp-1 font-heading text-base font-semibold text-navy hover:underline">
          <Link href={`/property/${property.id}`}>{property.name}</Link>
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          {property.amenityTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-rating/10 px-2 py-0.5 text-xs font-medium text-rating"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-2 text-sm">
          <span className="text-muted-foreground">From </span>
          <span className="font-bold text-foreground">
            {property.currency} {property.price.toLocaleString()}
          </span>
          <span className="text-muted-foreground"> / night</span>
        </div>
      </div>
    </article>
  );
}
