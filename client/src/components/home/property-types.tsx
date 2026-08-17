"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { resolveAssetUrl } from "@/lib/api";
import { usePropertyTypesQuery } from "@/lib/property-types";

export function PropertyTypes() {
  const { data: propertyTypes = [], isLoading } = usePropertyTypesQuery();

  if (!isLoading && propertyTypes.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-navy">Browse by property type</h2>
        <Link
          href="/search"
          className="flex items-center text-sm font-semibold text-gold hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {propertyTypes.map((type) => (
            <Link
              key={type.id}
              href={`/search?propertyType=${type.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
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
          ))}
        </div>
      )}
    </section>
  );
}
