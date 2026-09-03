import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PropertyDetailContent } from "@/components/property/property-detail-content";
import { PropertyLoadingSkeleton } from "@/components/property/property-loading-skeleton";
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
      <main className="flex-1 bg-white">
        <Suspense fallback={<PropertyLoadingSkeleton />}>
          <PropertyDetailContent property={property} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
