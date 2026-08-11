import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PropertyCard } from "@/components/home/property-card";
import type { Property } from "@/lib/mock-data";

export function PropertyCarouselSection({
  title,
  properties,
}: {
  title: string;
  properties: Property[];
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-navy">{title}</h2>
        <Link
          href="/search"
          className="flex items-center text-sm font-semibold text-gold hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Carousel opts={{ align: "start" }} className="px-1">
        <CarouselContent>
          {properties.map((property) => (
            <CarouselItem
              key={property.id}
              className="sm:basis-1/2 lg:basis-1/4"
            >
              <PropertyCard property={property} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden left-2 lg:flex" />
        <CarouselNext className="hidden right-2 lg:flex" />
      </Carousel>
    </section>
  );
}
