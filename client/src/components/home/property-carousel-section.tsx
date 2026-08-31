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
      <Carousel opts={{ align: "start" }}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-navy">{title}</h2>
          <div className="items-center gap-2 flex">
            <CarouselPrevious className="static inset-auto my-0 translate-y-0" />
            <CarouselNext className="static inset-auto my-0 translate-y-0" />
          </div>
        </div>

        <div className="px-1">
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
        </div>
      </Carousel>
    </section>
  );
}
