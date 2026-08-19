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
      <div className="mb-5">
        <h2 className="font-heading text-2xl font-bold text-navy">Top attractions</h2>
      </div>

      <Carousel opts={{ align: "start" }} className="px-1">
        <CarouselContent>
          {attractions.map((attraction) => (
            <CarouselItem key={attraction.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/6">
              <Link href="#" className="group flex flex-col gap-2">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden left-2 lg:flex" />
        <CarouselNext className="hidden right-2 lg:flex" />
      </Carousel>
    </section>
  );
}
