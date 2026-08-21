"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertySummary } from "@/components/property/property-summary";
import { PropertyTabs } from "@/components/property/property-tabs";
import { SignInBanner } from "@/components/property/sign-in-banner";
import { AboutSection } from "@/components/property/about-section";
import { TopHighlightsCard } from "@/components/property/top-highlights-card";
import { PopularFacilities } from "@/components/property/popular-facilities";
import { AvailabilitySection } from "@/components/property/availability-section";
import { ReviewsSection } from "@/components/property/reviews-section";
import { ExploreMapSection } from "@/components/property/explore-map-section";
import { NearbyHotelsSection } from "@/components/property/nearby-hotels-section";
import { TrustBadgesBand } from "@/components/property/trust-badges-band";
import { PropertyLoadingSkeleton } from "@/components/property/property-loading-skeleton";
import { featuredProperties, homesGuestsLove } from "@/lib/mock-data";
import type { PropertyDetail } from "@/lib/property-detail-mock-data";

const allNearbyCandidates = [...featuredProperties, ...homesGuestsLove];

// Mirrors the search page's loading pattern: this page reads from static mock
// data with no real backend behind it, so the delay is faked to give the
// loading skeleton below something real to fill. Swap for an actual
// `isLoading` from the fetch once a real property endpoint exists.
const SIMULATED_LOAD_DELAY_MS = 1800;

export function PropertyDetailContent({ property }: { property: PropertyDetail }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const id = window.setTimeout(() => setIsLoading(false), SIMULATED_LOAD_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [property.id]);

  if (isLoading) {
    return <PropertyLoadingSkeleton />;
  }

  const nearbyHotels = allNearbyCandidates
    .filter((candidate) => candidate.id !== property.id && candidate.name !== property.name)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-24">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Stays", href: "/" },
          { label: property.country },
          {
            label: property.city,
            href: `/search?destination=${encodeURIComponent(
              `${property.city}, ${property.country}`
            )}`,
          },
          { label: `${property.name} (${property.badge ?? "Hotel"}) Deals` },
        ]}
      />

      <div className="mt-4">
        <PropertySummary property={property} />
      </div>

      <div className="mt-4">
        <PropertyGallery
          heroImage={property.heroImage}
          heroBadge={property.heroBadge}
          galleryImages={property.galleryImages}
          extraPhotosCount={property.extraPhotosCount}
          name={property.name}
          ratingLabel={property.ratingLabel}
          reviews={property.reviews}
          staffScore={property.staffScore}
          guestLovedQuote={property.guestLovedQuote}
          guestReviews={property.guestReviews}
          location={property.location}
          lat={property.lat}
          lng={property.lng}
        />
      </div>

      <div className="mt-4">
        <PropertyTabs reviewCount={property.reviews} />
      </div>

      <div className="mt-4">
        <SignInBanner propertyName={property.name} />
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <AboutSection property={property} />
        <TopHighlightsCard highlights={property.highlights} />
        <PopularFacilities facilities={property.popularFacilities} />
        <AvailabilitySection
          rooms={property.rooms}
          currency={property.currency}
          demandNote={property.demandNote}
        />
        <ReviewsSection property={property} />
        <ExploreMapSection
          name={property.name}
          location={property.location}
          lat={property.lat}
          lng={property.lng}
          distance={property.distance}
          nearby={property.nearby}
          gettingAround={property.gettingAround}
        />
        <NearbyHotelsSection city={property.city} hotels={nearbyHotels} />
        <TrustBadgesBand />
      </div>
    </div>
  );
}
