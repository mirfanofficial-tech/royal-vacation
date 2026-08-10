"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Heart,
  Star,
  MapPin,
  MapPinned,
  Check,
  Waves,
  Flower2,
  Bus,
  Users,
  Baby,
  Dumbbell,
  UtensilsCrossed,
  Clock,
  Palmtree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { SearchProperty } from "@/lib/search-mock-data";

const featureIconRules: [RegExp, ComponentType<{ className?: string }>][] = [
  [/beach|palm/i, Palmtree],
  [/pool|water/i, Waves],
  [/spa|wellness/i, Flower2],
  [/shuttle|airport/i, Bus],
  [/family|room/i, Users],
  [/kid/i, Baby],
  [/fitness|gym/i, Dumbbell],
  [/restaurant/i, UtensilsCrossed],
  [/desk|hour/i, Clock],
];

function featureIcon(label: string) {
  return featureIconRules.find(([pattern]) => pattern.test(label))?.[1] ?? Check;
}

export function SearchResultCard({
  property,
  onShowOnMap,
}: {
  property: SearchProperty;
  onShowOnMap?: (id: string) => void;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <article className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-3 sm:flex-row sm:gap-5 sm:p-4">
      <div className="relative w-full shrink-0 sm:w-64">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Link href={`/property/${property.id}`} className="absolute inset-0 z-0">
            <Image
              src={property.image}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 256px, 100vw"
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
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm hover:bg-white"
        >
          <Heart className={`h-3.5 w-3.5 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {property.thumbnails.map((thumb, index) => (
            <div key={thumb} className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image src={thumb} alt="" fill className="object-cover" sizes="80px" />
              {index === property.thumbnails.length - 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-semibold text-white">
                  +{property.extraPhotosCount} photos
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-navy hover:underline">
                <Link href={`/property/${property.id}`}>{property.name}</Link>
              </h3>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: property.starRating }, (_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                ))}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.location} &middot; {property.distance}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="text-right leading-tight">
              <p className="text-xs font-semibold text-foreground">{property.ratingLabel}</p>
              <p className="text-[11px] text-muted-foreground">
                {property.reviews.toLocaleString()} reviews
              </p>
            </div>
            <span className="flex h-7 min-w-7 items-center justify-center rounded bg-rating px-1.5 text-sm font-bold text-white">
              {property.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.amenityTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-rating/10 px-2 py-0.5 text-xs font-medium text-rating"
            >
              {tag}
            </span>
          ))}
        </div>

        <blockquote className="border-l-2 border-navy/30 pl-3 text-sm italic text-muted-foreground">
          &ldquo;{property.quote}&rdquo;
        </blockquote>

        <ul className="flex flex-col gap-1 text-sm text-foreground">
          {property.features.map((feature) => {
            const Icon = featureIcon(feature);
            return (
              <li key={feature} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{feature}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
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

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="text-right">
              {property.originalPrice && property.discountPercent && (
                <div className="flex items-center justify-end gap-2">
                  <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {property.discountPercent}% OFF
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {property.currency} {property.originalPrice.toLocaleString()}
                  </span>
                </div>
              )}
              <p className="mt-0.5">
                <span className="text-lg font-bold text-foreground">
                  {property.currency} {property.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground"> / night</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Total for {property.nights} nights {property.currency}{" "}
                {property.totalPrice.toLocaleString()}
              </p>
            </div>
            <Button
              render={<Link href={`/property/${property.id}`} />}
              nativeButton={false}
              className="w-full rounded-lg bg-navy text-white hover:bg-navy-light sm:w-auto"
            >
              See availability
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
