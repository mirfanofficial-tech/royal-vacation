import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, subDays } from "date-fns";
import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceTitleRow } from "@/components/invoice/invoice-title-row";
import { PropertySummaryCard } from "@/components/invoice/property-summary-card";
import { GuestDetailsCard } from "@/components/invoice/guest-details-card";
import { BillingSummaryCard } from "@/components/invoice/billing-summary-card";
import { PaymentInfoCard } from "@/components/invoice/payment-info-card";
import { ThankYouNote } from "@/components/invoice/thank-you-note";
import { InvoiceSidebar } from "@/components/invoice/invoice-sidebar";
import { propertyDetails } from "@/lib/property-detail-mock-data";
import { countryOptions, extraOptions } from "@/lib/checkout-mock-data";
import {
  paymentMethodLabels,
  generateInvoiceNumber,
  generateBookingId,
  generateTransactionId,
} from "@/lib/invoice-mock-data";

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
  return { title: `Invoice - ${property.name} | Royal Vacation` };
}

export default async function InvoicePage({
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

  const room = property.rooms.find((r) => r.id === firstParam(query.room)) ?? property.rooms[0];

  const checkIn = parseDate(query.checkIn) ?? new Date(2026, 0, 20);
  const checkOut = parseDate(query.checkOut) ?? new Date(2026, 0, 23);
  const adults = Number(firstParam(query.adults)) || 2;
  const rooms = Number(firstParam(query.rooms)) || 1;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  const selectedExtraIds = firstParam(query.extras)?.split(",").filter(Boolean) ?? [];

  const firstName = firstParam(query.firstName) || "Guest";
  const lastName = firstParam(query.lastName) || "";
  const email = firstParam(query.email) || "guest@email.com";
  const dialCode = firstParam(query.dialCode) || "+92";
  const phone = firstParam(query.phone) || "";
  const countryCode = firstParam(query.country) || "PK";
  const paymentMethod = firstParam(query.paymentMethod) || "card";

  const countryLabel = countryOptions.find((c) => c.value === countryCode)?.label ?? countryCode;
  const paymentMethodLabel = paymentMethodLabels[paymentMethod] ?? "Credit / Debit Card";

  const seed = `${id}-${room.id}-${checkIn.toISOString()}`;
  const invoiceNumber = generateInvoiceNumber(seed);
  const bookingId = generateBookingId(seed);
  const transactionId = generateTransactionId(seed, format(checkIn, "yyyyMMdd"));
  const bookedOn = subDays(checkIn, 10);

  const nightsSubtotal = room.price * nights;
  const extrasTotal = extraOptions
    .filter((extra) => selectedExtraIds.includes(extra.id))
    .reduce((sum, extra) => sum + extra.price, 0);
  const taxesAndFees = Math.round((nightsSubtotal + extrasTotal) * 0.15);
  const serviceFee = 2750;
  const promoDiscount = 10000;
  const total = nightsSubtotal + extrasTotal + taxesAndFees + serviceFee - promoDiscount;

  return (
    <>
      <main className="flex-1 bg-muted/40 print:bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-10">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 print:border-none print:p-0 print:shadow-none">
            <InvoiceHeader />

            <InvoiceTitleRow
              invoiceNumber={invoiceNumber}
              invoiceDate={format(checkIn, "d MMM yyyy")}
              paidOnLabel={`Paid on ${format(checkIn, "d MMM yyyy")}`}
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-5">
                <PropertySummaryCard
                  propertyName={property.name}
                  propertyImage={property.heroImage}
                  starRating={property.starRating}
                  rating={property.rating}
                  ratingLabel={property.ratingLabel}
                  reviews={property.reviews}
                  location={property.location}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  nights={nights}
                  adults={adults}
                  rooms={rooms}
                />

                <GuestDetailsCard
                  guestName={`${firstName} ${lastName}`.trim()}
                  email={email}
                  phone={phone ? `${dialCode} ${phone}` : "-"}
                  country={countryLabel}
                />

                <BillingSummaryCard
                  currency={property.currency}
                  roomName={room.name}
                  roomPrice={room.price}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  nights={nights}
                  selectedExtraIds={selectedExtraIds}
                  promoCode="ROYAL10"
                />

                <PaymentInfoCard
                  paymentMethodLabel={paymentMethodLabel}
                  paidOn={`${format(checkIn, "d MMM yyyy")}, 10:24 AM`}
                  transactionId={transactionId}
                  amountPaid={total}
                  currency={property.currency}
                />

                <ThankYouNote />
              </div>

              <InvoiceSidebar
                bookingId={bookingId}
                bookedOn={format(bookedOn, "d MMM yyyy")}
                currency={property.currency}
                roomPrice={room.price}
                nights={nights}
                selectedExtraIds={selectedExtraIds}
              />
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              © 2026 Royal Vacation Travels LLC. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
