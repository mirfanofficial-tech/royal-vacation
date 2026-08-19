import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
import { TrustBadgesBand } from "@/components/property/trust-badges-band";
import { propertyDetails, getPropertyDetail } from "@/lib/property-detail-mock-data";
import { featuredProperties, homesGuestsLove } from "@/lib/mock-data";
import { getRouteSeo, mergeRouteSeoMetadata } from "@/lib/cms-seo";

const fallbackProperties = [...featuredProperties, ...homesGuestsLove];

export function generateStaticParams() {
  const ids = [...Object.keys(propertyDetails), ...fallbackProperties.map((p) => p.id)];
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = getPropertyDetail(id, fallbackProperties);
  if (!property) {
    const routeSeo = await getRouteSeo("/property");
    return mergeRouteSeoMetadata(routeSeo, {});
  }
  return {
    title: `${property.name} | Royal Vacation`,
    description: property.aboutShort,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = getPropertyDetail(id, fallbackProperties);

  if (!property) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
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
            <PropertyTabs reviewCount={property.reviews} />
          </div>

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
            <TrustBadgesBand />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
