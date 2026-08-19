import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { StepIndicator } from "@/components/checkout/step-indicator";
import { CheckoutFormSections } from "@/components/checkout/checkout-form-sections";
import { propertyDetails } from "@/lib/property-detail-mock-data";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDate(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = propertyDetails[id];
  if (!property) return {};
  return { title: `Checkout - ${property.name} | Royal Vacation` };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const property = propertyDetails[id];
  if (!property) {
    notFound();
  }

  const room =
    property.rooms.find((r) => r.id === firstParam(query.room)) ?? property.rooms[0];

  const checkIn = parseDate(query.checkIn) ?? new Date(2026, 0, 20);
  const checkOut = parseDate(query.checkOut) ?? new Date(2026, 0, 23);
  const adults = Number(firstParam(query.adults)) || 2;
  const rooms = Number(firstParam(query.rooms)) || 1;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <>
      <CheckoutHeader />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-10">
          <div className="mb-6">
            <StepIndicator currentStep={1} />
          </div>

          <CheckoutFormSections
            propertyId={id}
            roomId={room.id}
            currency={property.currency}
            propertyName={property.name}
            propertyImage={property.heroImage}
            starRating={property.starRating}
            rating={property.rating}
            ratingLabel={property.ratingLabel}
            reviews={property.reviews}
            location={property.location}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            rooms={rooms}
            nights={nights}
            roomPrice={room.ratePlans[0].price}
          />
        </div>
      </main>
    </>
  );
}
