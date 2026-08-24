"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, MapPin, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useHotelsQuery } from "@/lib/hotels";

export function CuratedHotels() {
  const { data: hotels = [], isLoading } = useHotelsQuery();

  if (!isLoading && hotels.length === 0) return null;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <div className="mb-5">
          <h2 className="font-heading text-2xl font-bold text-navy">Our Hotel Collection</h2>
        </div>
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
      <Carousel opts={{ align: "start" }}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-navy">Our Hotel Collection</h2>
            <p className="text-sm text-muted-foreground">
              Curated hotel content, mapped across our booking partners.
            </p>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <CarouselPrevious className="static inset-auto my-0 translate-y-0" />
            <CarouselNext className="static inset-auto my-0 translate-y-0" />
          </div>
        </div>

        <div className="px-1">
          <CarouselContent>
            {hotels.map((hotel) => (
              <CarouselItem key={hotel.id} className="sm:basis-1/2 lg:basis-1/4">
                <Link
                  href={`/search?destination=${encodeURIComponent(
                    [hotel.city, hotel.country].filter(Boolean).join(", ")
                  )}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {hotel.hero_image && (
                      <Image
                        src={hotel.hero_image}
                        alt={hotel.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                    )}
                    {hotel.star_rating != null && (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-navy shadow-sm">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        {hotel.star_rating}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 font-heading text-base font-semibold text-navy">
                      {hotel.name}
                    </p>
                    {(hotel.city || hotel.country) && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">
                          {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                        </span>
                      </p>
                    )}
                    {hotel.amenities.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                        {hotel.amenities.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}
