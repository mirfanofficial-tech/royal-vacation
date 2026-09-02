"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

import { useFavorites } from "@/components/providers/favorites-provider";
import { geniusLevels, geniusProperties } from "@/lib/genius-mock-data";
import { useGenius } from "@/components/genius/genius-context";

export function GeniusPropertyGrid() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { view } = useGenius();
  const currentLevel = geniusLevels[view.enrolled ? view.levelIndex : 0]!;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy">
            Your {currentLevel.name} price at these stays
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Discount already applied — no code needed at checkout.
          </p>
        </div>
        <Link
          href="/search"
          className="hidden shrink-0 text-sm font-medium text-navy hover:underline sm:block"
        >
          See all 4,218 stays
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {geniusProperties.map((property) => {
          const favorited = isFavorite(property.id);
          return (
            <article
              key={property.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <span className="absolute left-3 top-3 rounded-md bg-rating px-1.5 py-0.5 text-xs font-bold text-white">
                  {property.rating.toFixed(1)}
                </span>
                <button
                  type="button"
                  aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
                  aria-pressed={favorited}
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm transition-colors hover:bg-white"
                >
                  <Heart className={`h-4 w-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="flex w-fit items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                  <Sparkles className="h-3 w-3" />
                  Genius deal
                </span>
                <h3 className="line-clamp-1 font-heading text-base font-semibold text-navy">
                  {property.name}
                </h3>
                <p className="text-sm text-muted-foreground">{property.location}</p>

                <div className="mt-auto flex items-end justify-between pt-2">
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Genius price</p>
                    <p>
                      <span className="font-bold text-foreground">
                        {property.currency} {property.geniusPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> / night</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-rating">
                    Save {property.savePercent}%
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
