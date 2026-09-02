import { format } from "date-fns";

import type { BookingOut } from "@royal-vacation/api-client";
import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceTitleRow } from "@/components/invoice/invoice-title-row";
import { PropertySummaryCard } from "@/components/invoice/property-summary-card";
import { GuestDetailsCard } from "@/components/invoice/guest-details-card";
import { BillingSummaryCard } from "@/components/invoice/billing-summary-card";
import { PaymentInfoCard } from "@/components/invoice/payment-info-card";
import { ThankYouNote } from "@/components/invoice/thank-you-note";
import { InvoiceSidebar } from "@/components/invoice/invoice-sidebar";
import { propertyDetails } from "@/lib/property-detail-mock-data";
import { countryOptions } from "@/lib/checkout-mock-data";
import { generateInvoiceNumber, generateTransactionId } from "@/lib/invoice-mock-data";

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The printable invoice body, rendered from a persisted booking. Shared by the
 * public /invoice page and the account Booking-detail screen. */
export function InvoiceDocument({ booking }: { booking: BookingOut }) {
  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);
  const createdAt = new Date(booking.created_at);
  const paidAt = booking.payment?.captured_at
    ? new Date(booking.payment.captured_at)
    : booking.confirmed_at
      ? new Date(booking.confirmed_at)
      : createdAt;

  const cosmetic = propertyDetails[booking.property_id];
  const roomPrice = booking.nights > 0 ? Number(booking.nights_subtotal) / booking.nights : 0;
  const extraIds = booking.extras.map((e) => e.extra_id);
  const countryLabel =
    countryOptions.find((c) => c.value === booking.guest_country)?.label ??
    booking.guest_country ??
    "—";

  const cardLabel = booking.payment?.card_brand
    ? `${capitalise(booking.payment.card_brand)} ending ${booking.payment.card_last4 ?? "••••"}`
    : "Card payment";
  const paidLabel = booking.payment_timing === "pay_later" ? "Card held on" : "Paid on";

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 print:border-none print:p-0 print:shadow-none">
      <InvoiceHeader />

      <InvoiceTitleRow
        invoiceNumber={generateInvoiceNumber(booking.reference)}
        invoiceDate={format(createdAt, "d MMM yyyy")}
        paidOnLabel={`${paidLabel} ${format(paidAt, "d MMM yyyy")}`}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <PropertySummaryCard
            propertyName={booking.property_name}
            propertyImage={booking.room_image ?? cosmetic?.heroImage ?? ""}
            starRating={cosmetic?.starRating ?? 5}
            rating={cosmetic?.rating ?? 9}
            ratingLabel={cosmetic?.ratingLabel ?? "Wonderful"}
            reviews={cosmetic?.reviews ?? 0}
            location={booking.location ?? cosmetic?.location ?? ""}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={booking.nights}
            adults={booking.adults}
            rooms={booking.rooms}
          />

          <GuestDetailsCard
            guestName={`${booking.guest_first_name} ${booking.guest_last_name ?? ""}`.trim()}
            email={booking.guest_email}
            phone={
              booking.guest_phone
                ? `${booking.guest_dial_code ?? ""} ${booking.guest_phone}`.trim()
                : "-"
            }
            country={countryLabel}
          />

          <BillingSummaryCard
            currency={booking.currency}
            roomName={booking.room_name}
            roomPrice={roomPrice}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={booking.nights}
            selectedExtraIds={extraIds}
            promoCode={booking.promo_code ?? ""}
          />

          <PaymentInfoCard
            paymentMethodLabel={cardLabel}
            paidOn={`${format(paidAt, "d MMM yyyy")}, ${format(paidAt, "HH:mm")}`}
            transactionId={generateTransactionId(booking.reference, format(createdAt, "yyyyMMdd"))}
            amountPaid={Number(booking.total_amount)}
            currency={booking.currency}
          />

          <ThankYouNote />
        </div>

        <InvoiceSidebar
          bookingId={booking.reference}
          bookedOn={format(createdAt, "d MMM yyyy")}
          currency={booking.currency}
          roomPrice={roomPrice}
          nights={booking.nights}
          selectedExtraIds={extraIds}
        />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © 2026 Royal Vacation Travels LLC. All rights reserved.
      </p>
    </div>
  );
}
