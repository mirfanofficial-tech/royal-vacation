"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PropertyGallery({
  heroImage,
  heroBadge,
  galleryImages,
  extraPhotosCount,
  name,
}: {
  heroImage: string;
  heroBadge: string;
  galleryImages: string[];
  extraPhotosCount: number;
  name: string;
}) {
  const allImages = [heroImage, ...galleryImages];
  const [heroIndex, setHeroIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:aspect-auto sm:h-full">
        <Image
          src={allImages[heroIndex]}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 640px) 55vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded bg-navy px-2 py-0.5 text-xs font-bold text-white">
          {heroBadge}
        </span>
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => setHeroIndex((i) => (i - 1 + allImages.length) % allImages.length)}
          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => setHeroIndex((i) => (i + 1) % allImages.length)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {galleryImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setHeroIndex(index + 1)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 640px) 20vw, 50vw"
            />
            {index === galleryImages.length - 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                +{extraPhotosCount} Photos
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
