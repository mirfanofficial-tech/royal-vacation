import type { Metadata } from "next";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchResultsBar } from "@/components/search/search-results-bar";
import { SearchResultsView } from "@/components/search/search-results-view";
import { NewsletterBanner } from "@/components/search/newsletter-banner";
import { searchProperties } from "@/lib/search-mock-data";
import { getRouteSeo, mergeRouteSeoMetadata } from "@/lib/cms-seo";

const DEFAULT_DESTINATION_FULL = "Dubai, United Arab Emirates";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const destinationParam = firstParam(params.destination);

  if (!destinationParam) {
    const routeSeo = await getRouteSeo("/search");
    return mergeRouteSeoMetadata(routeSeo, {
      title: "Search Stays | Royal Vacation",
      description: `${searchProperties.length} properties found in ${DEFAULT_DESTINATION_FULL}.`,
    });
  }

  const destinationFull = destinationParam;
  const destination = destinationFull.split(",")[0].trim();
  return {
    title: `${destination} Hotels | Royal Vacation`,
    description: `${searchProperties.length} properties found in ${destinationFull}.`,
  };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDate(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const destinationFull = firstParam(params.destination) || DEFAULT_DESTINATION_FULL;
  const destination = destinationFull.split(",")[0].trim();

  const checkIn = parseDate(params.checkIn) ?? new Date(2026, 0, 20);
  const checkOut = parseDate(params.checkOut) ?? new Date(2026, 0, 23);
  const adults = Number(firstParam(params.adults)) || 2;
  const rooms = Number(firstParam(params.rooms)) || 1;
  const propertyType = firstParam(params.propertyType);

  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );
  const nightsLabel = `Prices shown are for ${nights} night${nights > 1 ? "s" : ""} (${format(
    checkIn,
    "d MMM"
  )} – ${format(checkOut, "d MMM")})`;
  const dateRangeLabel = `${format(checkIn, "d")} – ${format(checkOut, "d MMM yyyy")}`;

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <SearchResultsBar
          defaultDestination={destinationFull}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          defaultAdults={adults}
          defaultRooms={rooms}
        />

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-24">
          <SearchResultsView
            destination={destination}
            destinationFull={destinationFull}
            propertyCount={642}
            nightsLabel={nightsLabel}
            dateRangeLabel={dateRangeLabel}
            adults={adults}
            rooms={rooms}
            properties={searchProperties}
            defaultTypeId={propertyType}
          />

          <div className="mt-8">
            <NewsletterBanner />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
