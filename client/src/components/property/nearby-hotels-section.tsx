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
      <Carousel opts={{ align: "start" }}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-navy">
            Other hotels near {city}
          </h2>
          <div className="hidden items-center gap-2 lg:flex">
            <CarouselPrevious className="static inset-auto my-0 translate-y-0" />
            <CarouselNext className="static inset-auto my-0 translate-y-0" />
          </div>
        </div>

        <div className="px-1">
          <CarouselContent>
            {hotels.map((hotel) => (
              <CarouselItem key={hotel.id} className="sm:basis-1/2 lg:basis-1/4">
                <PropertyCard property={hotel} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}
