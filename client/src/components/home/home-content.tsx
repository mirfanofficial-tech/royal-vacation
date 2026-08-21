"use client";

import { useEffect, useState } from "react";
import { PropertyTypes } from "@/components/home/property-types";
import { PropertyCarouselSection } from "@/components/home/property-carousel-section";
import { Attractions } from "@/components/home/attractions";
import { GeniusBanner } from "@/components/home/genius-banner";
import { Destinations } from "@/components/home/destinations";
import { Blogs } from "@/components/home/blogs";
import { HomeLoadingSkeleton } from "@/components/home/home-loading-skeleton";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";
import { featuredProperties, homesGuestsLove } from "@/lib/mock-data";

// Mirrors the search page's loading pattern: this section fetches from static
// mock data with no real backend behind it, so the delay is faked to give the
// loading skeleton below something real to fill. Swap for an actual `isLoading`
// once the home sections are backed by real endpoints.
const SIMULATED_LOAD_DELAY_MS = 1800;

export function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setIsLoading(false), SIMULATED_LOAD_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (isLoading) {
    return <HomeLoadingSkeleton />;
  }

  return (
    <>
      <PropertyTypes />
      <PropertyCarouselSection title="Featured Properties" properties={featuredProperties} />
      <PropertyCarouselSection title="Homes guests love" properties={homesGuestsLove} />
      <Attractions />
      <GeniusBanner />
      <Destinations />
      <Blogs />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <TrustBadgesRow variant="plain" />
      </div>
    </>
  );
}
