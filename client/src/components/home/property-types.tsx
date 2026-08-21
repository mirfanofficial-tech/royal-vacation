"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { resolveAssetUrl } from "@/lib/api";
import { usePropertyTypesQuery } from "@/lib/property-types";

export function PropertyTypes() {
  const { data: propertyTypes = [], isLoading } = usePropertyTypesQuery();

  if (!isLoading && propertyTypes.length === 0) return null;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 pt-8 lg:px-24">
        <div className="mb-5">
          <h2 className="font-heading text-2xl font-bold text-navy">Browse by property type</h2>
        </div>
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 pt-8 lg:px-24">
      <Carousel opts={{ align: "start" }}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-navy">Browse by property type</h2>
          <div className="hidden items-center gap-2 lg:flex">
            <CarouselPrevious className="static inset-auto my-0 translate-y-0" />
            <CarouselNext className="static inset-auto my-0 translate-y-0" />
          </div>
        </div>

        <div className="px-1">
          <CarouselContent>
            {propertyTypes.map((type) => (
              <CarouselItem key={type.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/6">
                <Link
                  href={`/search?propertyType=${type.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {type.image_url && (
                      <Image
                        src={resolveAssetUrl(type.image_url)}
                        alt={type.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                      />
                    )}
                  </div>
                  <div className="px-3 py-3 text-center">
                    <p className="text-sm font-semibold text-foreground">{type.name}</p>
                    {type.count_label && (
                      <p className="text-xs text-muted-foreground">{type.count_label}</p>
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
