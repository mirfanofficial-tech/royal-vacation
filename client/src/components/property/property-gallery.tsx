"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { LeafletMap } from "@/components/search/leaflet-map";
import { PhotoLightbox } from "@/components/property/photo-lightbox";
import type { GuestReview } from "@/lib/property-detail-mock-data";

export function PropertyGallery({
  heroImage,
  heroBadge,
  galleryImages,
  extraPhotosCount,
  name,
  ratingLabel,
  reviews,
  staffScore,
  guestLovedQuote,
  guestReviews,
  location,
  lat,
  lng,
}: {
  heroImage: string;
  heroBadge: string;
  galleryImages: string[];
  extraPhotosCount: number;
  name: string;
  ratingLabel: string;
  reviews: number;
  staffScore: number;
  guestLovedQuote: { text: string; guestName: string; guestCountry: string };
  guestReviews: GuestReview[];
  location: string;
  lat: number;
  lng: number;
}) {
  const topImages = galleryImages.slice(0, 2);
  const allImages = [heroImage, ...galleryImages];
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const quotes = [
    guestLovedQuote,
    ...guestReviews.map((review) => ({
      text: review.text,
      guestName: review.name,
      guestCountry: review.country,
    })),
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const activeQuote = quotes[quoteIndex];

  return (
    <div className="grid grid-cols-1 gap-2 lg:h-[420px] lg:grid-cols-[1.3fr_1fr_0.9fr]">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-[4/3] overflow-hidden rounded-md lg:aspect-auto lg:h-full"
      >
        <Image
          src={heroImage}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 35vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-xs font-bold text-white">
          {heroBadge}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-2 lg:flex lg:h-full lg:flex-col">
        {topImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative aspect-[4/3] overflow-hidden rounded-md lg:aspect-auto lg:flex-1"
          >
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            {index === topImages.length - 1 && (
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 text-xs font-semibold text-white">
                <Images className="h-3.5 w-3.5" />+{extraPhotosCount} photos
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white lg:h-full">
        <div className="flex flex-col gap-2 p-4">
          <p className="text-sm font-semibold text-foreground">{ratingLabel}</p>
          <p className="text-xs text-muted-foreground">{reviews.toLocaleString()} reviews</p>

          <div className="mt-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">Guests who stayed here loved</p>
              {quotes.length > 1 && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous quote"
                    onClick={() => setQuoteIndex((i) => (i - 1 + quotes.length) % quotes.length)}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-navy hover:text-navy"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next quote"
                    onClick={() => setQuoteIndex((i) => (i + 1) % quotes.length)}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-navy hover:text-navy"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs italic text-muted-foreground">
              &ldquo;{activeQuote.text}&rdquo;
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/10 text-[11px] font-bold text-navy">
                  {activeQuote.guestName.charAt(0)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeQuote.guestName} &middot; {activeQuote.guestCountry}
                </span>
              </div>
              {quotes.length > 1 && (
                <div className="flex shrink-0 items-center gap-1">
                  {quotes.map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full ${
                        index === quoteIndex ? "bg-navy" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Staff</span>
            <span className="rounded bg-rating px-2 py-0.5 text-xs font-bold text-white">
              {staffScore.toFixed(1)}
            </span>
          </div>
        </div>

        <div id="location" className="scroll-mt-36 relative min-h-32 flex-1 border-t border-border">
          <LeafletMap
            pins={[{ id: "property", lat, lng, price: "You're here" }]}
            className="h-full w-full"
          />
          <button
            type="button"
            className="absolute bottom-2 right-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-sm hover:bg-muted"
          >
            Show on map
          </button>
          <span className="sr-only">{location}</span>
        </div>
      </div>

      <PhotoLightbox
        images={allImages}
        name={name}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
