"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { Property } from "@/lib/mock-data";

export function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-lg">
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
        <span className="absolute top-3 left-3 z-10 rounded-md bg-navy-dark/80 px-1.5 py-0.5 text-xs font-bold text-white">
          {property.rating.toFixed(1)}
        </span>
        <button
          type="button"
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={favorited}
          onClick={() => toggleFavorite(property.id)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm transition-colors hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              favorited ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-6 items-center justify-center rounded bg-rating px-1.5 text-xs font-bold text-white">
            {property.rating.toFixed(1)}
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-foreground">{property.ratingLabel}</p>
            <p className="text-[11px] text-muted-foreground">{property.reviews} reviews</p>
          </div>
        </div>

        <h3 className="line-clamp-1 font-heading text-base font-semibold text-navy hover:underline">
          <Link href={`/property/${property.id}`}>{property.name}</Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">{property.location}</p>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-navy hover:underline"
          >
            <MapPin className="h-3 w-3" />
            Show on map
          </button>
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
