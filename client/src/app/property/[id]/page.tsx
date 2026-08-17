import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertySummary } from "@/components/property/property-summary";
import { PropertyTabs } from "@/components/property/property-tabs";
import { AboutSection } from "@/components/property/about-section";
import { PopularFacilities } from "@/components/property/popular-facilities";
import { RoomsSection } from "@/components/property/rooms-section";
import { ReviewsSection } from "@/components/property/reviews-section";
import { CheckAvailabilityCard } from "@/components/property/check-availability-card";
import { WhyBookMiniCard } from "@/components/property/why-book-mini-card";
import { MiniMapCard } from "@/components/property/mini-map-card";
import { Mapbox3DMap } from "@/components/property/mapbox-3d-map";
import { TopHighlightsCard } from "@/components/property/top-highlights-card";
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
        <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
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
              { label: property.name },
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
            />
          </div>

          <div className="mt-4">
            <PropertyTabs />
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-navy">3D Map View</h2>
                <p className="text-sm text-muted-foreground">
                  Explore {property.name} and its surroundings in 3D
                </p>
              </div>
            </div>
            <div className="relative h-[400px]">
              <Mapbox3DMap
                lat={property.lat}
                lng={property.lng}
                name={property.name}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-8">
              <AboutSection property={property} />
              <PopularFacilities facilities={property.popularFacilities} />
              <RoomsSection rooms={property.rooms} currency={property.currency} propertyId={property.id} />
              <ReviewsSection property={property} />
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <CheckAvailabilityCard demandNote={property.demandNote} />
              <WhyBookMiniCard />
              <MiniMapCard location={property.location} lat={property.lat} lng={property.lng} />
              <TopHighlightsCard highlights={property.highlights} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
