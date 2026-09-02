import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CheckoutFormSections } from "@/components/checkout/checkout-form-sections";
import { getPropertyDetail } from "@/lib/property-detail-mock-data";
import { featuredProperties, homesGuestsLove } from "@/lib/mock-data";

const fallbackProperties = [...featuredProperties, ...homesGuestsLove];

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
  const property = getPropertyDetail(id, fallbackProperties);
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

  const property = getPropertyDetail(id, fallbackProperties);
  if (!property) {
    notFound();
  }

  const room =
    property.rooms.find((r) => r.id === firstParam(query.room)) ?? property.rooms[0];
  const ratePlan =
    room.ratePlans.find((rp) => rp.id === firstParam(query.rate)) ?? room.ratePlans[0];

  const checkIn = parseDate(query.checkIn) ?? new Date(2026, 0, 20);
  const checkOut = parseDate(query.checkOut) ?? new Date(2026, 0, 23);
  const adults = Number(firstParam(query.adults)) || 2;
  const children = Math.max(0, Math.min(10, Number(firstParam(query.children)) || 0));
  const childAges = (firstParam(query.childAges) ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 17)
    .slice(0, children);
  const rooms = Math.max(1, Number(firstParam(query.rooms)) || 1);
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <>
      <CheckoutHeader />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-10">
          <CheckoutFormSections
            propertyId={id}
            ratePlanId={ratePlan.id}
            roomId={room.id}
            currency={property.currency}
            propertyName={property.name}
            propertyImage={property.heroImage}
            roomImage={room.image}
            starRating={property.starRating}
            rating={property.rating}
            ratingLabel={property.ratingLabel}
            reviews={property.reviews}
            location={property.location}
            roomName={room.name}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            childrenCount={children}
            childAges={childAges}
            rooms={rooms}
            nights={nights}
            roomPrice={ratePlan.price}
            roomTaxesFees={ratePlan.taxesFees}
            maxAdults={room.maxGuests}
            refundable={ratePlan.refundable}
          />
        </div>
      </main>
    </>
  );
}
