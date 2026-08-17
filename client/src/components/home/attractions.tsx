import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { attractions } from "@/lib/mock-data";

export function Attractions() {
  return (
    <section className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-navy">Top attractions</h2>
        <Link
          href="#"
          className="flex items-center text-sm font-semibold text-gold hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {attractions.map((attraction) => (
          <Link key={attraction.id} href="#" className="group flex flex-col gap-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={attraction.image}
                alt={attraction.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              />
            </div>
            <h3 className="line-clamp-1 font-heading text-sm font-semibold text-navy group-hover:underline">
              {attraction.name}
            </h3>
            <p className="text-xs text-muted-foreground">{attraction.location}</p>
            <p className="flex items-center gap-1 text-xs text-foreground">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="font-semibold">{attraction.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({attraction.reviews.toLocaleString()} reviews)
              </span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
