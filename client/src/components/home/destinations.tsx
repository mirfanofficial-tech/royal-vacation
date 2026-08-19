import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { popularDestinations } from "@/lib/mock-data";

export function Destinations() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
      <div className="mb-5">
        <h2 className="font-heading text-2xl font-bold text-navy">
          Popular with travelers from Dubai
        </h2>
      </div>

      <Carousel opts={{ align: "start" }} className="px-1">
        <CarouselContent>
          {popularDestinations.map((destination) => (
            <CarouselItem
              key={destination.id}
              className="basis-1/2 sm:basis-1/3 lg:basis-1/5"
            >
              <Link
                href={`/search?destination=${encodeURIComponent(
                  `${destination.city}, ${destination.country}`
                )}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Image
                  src={destination.image}
                  alt={destination.city}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded bg-gold px-2 py-0.5 text-xs font-bold text-navy-dark">
                  {destination.rank}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="font-heading text-lg font-bold">{destination.city}</p>
                  <p className="text-xs text-white/80">{destination.country}</p>
                  <p className="mt-1 text-xs font-semibold">
                    From {destination.currency} {destination.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden left-2 lg:flex" />
        <CarouselNext className="hidden right-2 lg:flex" />
      </Carousel>
    </section>
  );
}
