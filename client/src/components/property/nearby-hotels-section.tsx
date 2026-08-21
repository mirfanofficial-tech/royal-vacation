import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PropertyCard } from "@/components/home/property-card";
import type { Property } from "@/lib/mock-data";

export function NearbyHotelsSection({ city, hotels }: { city: string; hotels: Property[] }) {
  if (hotels.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-heading text-xl font-bold text-navy">
          Other hotels near {city}
        </h2>
      </div>

      <Carousel opts={{ align: "start" }} className="px-1">
        <CarouselContent>
          {hotels.map((hotel) => (
            <CarouselItem key={hotel.id} className="sm:basis-1/2 lg:basis-1/4">
              <PropertyCard property={hotel} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden left-2 lg:flex" />
        <CarouselNext className="hidden right-2 lg:flex" />
      </Carousel>
    </section>
  );
}
