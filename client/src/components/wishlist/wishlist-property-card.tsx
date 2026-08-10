"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Star, MapPin, Heart, Trash2 } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { WishlistProperty } from "@/lib/wishlist-mock-data";

export function WishlistPropertyCard({
  property,
  addedAt,
}: {
  property: WishlistProperty;
  addedAt: number;
}) {
  const { toggleFavorite } = useFavorites();

  return (
    <article className="flex gap-4 rounded-xl border border-border bg-white p-3">
      <Link
        href={`/property/${property.id}`}
        className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-lg sm:w-40"
      >
        <Image
          src={property.image}
          alt={property.name}
          fill
          className="object-cover"
          sizes="160px"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-navy hover:underline">
            <Link href={`/property/${property.id}`}>{property.name}</Link>
          </h3>
          <button
            type="button"
            aria-label="Remove from wishlist"
            onClick={() => toggleFavorite(property.id)}
            className="shrink-0 text-red-500 hover:text-red-600"
          >
            <Heart className="h-4 w-4 fill-red-500" />
          </button>
        </div>

        <span className="flex items-center gap-0.5">
          {Array.from({ length: property.starRating }, (_, i) => (
            <Star key={i} className="h-3 w-3 fill-gold text-gold" />
          ))}
        </span>

        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.location}
        </p>

        <p>
          <span className="text-base font-bold text-foreground">
            {property.currency} {property.price.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground"> / night</span>
        </p>

        {property.freeCancellation && (
          <span className="w-fit rounded-full bg-rating/10 px-2 py-0.5 text-xs font-medium text-rating">
            Free cancellation
          </span>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>Added on {format(addedAt, "d MMM, yyyy")}</span>
          <button
            type="button"
            onClick={() => toggleFavorite(property.id)}
            className="flex items-center gap-1 font-medium text-foreground hover:text-destructive"
          >
            Remove
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
