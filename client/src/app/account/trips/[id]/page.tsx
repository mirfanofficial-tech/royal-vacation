import type { Metadata } from "next";

import { AccountPage } from "@/components/account/account-page";
import { BookingDetailView } from "@/components/account/booking-detail-view";
import { InvoiceActions } from "@/components/account/invoice-actions";
import { BookingInvoiceProvider } from "@/components/account/booking-invoice-context";

export const metadata: Metadata = { title: "Booking details | Royal Vacation" };

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <BookingInvoiceProvider>
      <AccountPage
        title="Booking details"
        wide
        crumbs={[{ label: "Trips and bookings", href: "/account/trips" }, { label: "Details" }]}
        action={<InvoiceActions />}
      >
        <BookingDetailView bookingId={id} />
      </AccountPage>
    </BookingInvoiceProvider>
  );
}
