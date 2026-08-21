import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { attractions } from "@/lib/mock-data";

export function Attractions() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
      <Carousel opts={{ align: "start" }}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-navy">Top attractions</h2>
          <div className="hidden items-center gap-2 lg:flex">
            <CarouselPrevious className="static inset-auto my-0 translate-y-0" />
            <CarouselNext className="static inset-auto my-0 translate-y-0" />
          </div>
        </div>

        <div className="px-1">
        <CarouselContent>
          {attractions.map((attraction) => {
            const city = attraction.location.split(",")[0].trim();
            const filledStars = Math.round(attraction.rating);

            return (
              <CarouselItem key={attraction.id} className="sm:basis-1/2 lg:basis-1/3">
                <Link
                  href="#"
                  className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
                >
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-navy-dark/25" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 from-0% via-black/25 via-55% to-black/10" />
                  <span className="absolute left-3 top-3 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {city}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="line-clamp-1 font-heading text-base font-bold">
                      {attraction.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < filledStars ? "fill-gold text-gold" : "fill-transparent text-gold"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[11px] text-white/85">
                        ({attraction.reviews.toLocaleString()} Reviews)
                      </span>
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}
