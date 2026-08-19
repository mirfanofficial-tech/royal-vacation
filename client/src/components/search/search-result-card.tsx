"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, MapPin, MapPinned, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { SearchProperty } from "@/lib/search-mock-data";

export function SearchResultCard({
  property,
  onShowOnMap,
}: {
  property: SearchProperty;
  onShowOnMap?: (id: string) => void;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);
  const images = [property.image, ...property.thumbnails];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <article className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-3 sm:flex-row sm:gap-5 sm:p-4">
      <div className="relative w-full shrink-0 sm:w-64">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          {/* Mobile: swipeable slider through every photo, thumbnail row hidden below.
              Each slide sizes itself via aspect-[4/3] (matching the Destinations carousel's
              pattern) rather than inheriting height from the Carousel's fixed internals —
              CarouselContent's viewport wrapper has no explicit height, so percentage-height
              children collapse to zero. */}
          <div className="sm:hidden">
            <Carousel setApi={setApi}>
              <CarouselContent className="ml-0">
                {images.map((src, index) => (
                  <CarouselItem key={index} className="pl-0">
                    <Link href={`/property/${property.id}`} className="relative block aspect-[4/3] w-full">
                      <Image
                        src={src}
                        alt={property.name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === current ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop / tablet: static main image, thumbnails shown separately below */}
          <Link href={`/property/${property.id}`} className="absolute inset-0 z-0 hidden sm:block">
            <Image
              src={property.image}
              alt={property.name}
              fill
              className="object-cover"
              sizes="256px"
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

        <div className="mt-2 hidden grid-cols-3 gap-1.5 sm:grid">
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
            <h3 className="font-heading text-lg font-bold text-navy hover:underline">
              <Link href={`/property/${property.id}`}>{property.name}</Link>
            </h3>
            <span className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: property.starRating }, (_, i) => (
                <Star key={i} className="h-3 w-3 fill-gold text-gold" />
              ))}
            </span>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.location} &middot; {property.distance}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
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
            {onShowOnMap && (
              <button
                type="button"
                onClick={() => onShowOnMap(property.id)}
                className="flex items-center gap-1 text-xs font-semibold text-navy hover:underline"
              >
                <MapPinned className="h-3.5 w-3.5" />
                Show on map
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {property.amenityTags.map((tag) => (
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

        <blockquote className="border-l-2 border-navy/30 pl-3 text-sm italic text-muted-foreground">
          &ldquo;{property.quote}&rdquo;
        </blockquote>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
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
                  <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
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
              className="hidden rounded-lg bg-navy text-white hover:bg-navy-light sm:inline-flex sm:w-auto"
            >
              See availability
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
