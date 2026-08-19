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
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
      <div className="mb-5">
        <h2 className="font-heading text-2xl font-bold text-navy">{title}</h2>
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
