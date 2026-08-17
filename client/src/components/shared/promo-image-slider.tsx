"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

export type PromoSlide = {
  src: string;
  alt: string;
};

export function PromoImageSlider({
  slides,
  interval = 5000,
  className,
}: {
  slides: PromoSlide[];
  interval?: number;
  className?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi || slides.length < 2) return;
    const id = setInterval(() => emblaApi.scrollNext(), interval);
    return () => clearInterval(id);
  }, [emblaApi, interval, slides.length]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.src}
              className="relative h-full w-full shrink-0 grow-0 basis-full"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="480px"
              />
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
