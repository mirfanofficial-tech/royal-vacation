import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { BookingDetailView } from "@/components/account/booking-detail-view";

export const metadata: Metadata = { title: "Booking details | Royal Vacation" };

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AccountPage
      title="Booking details"
      wide
      crumbs={[{ label: "Trips and bookings", href: "/account/trips" }, { label: "Details" }]}
    >
      <BookingDetailView bookingId={id} />
    </AccountPage>
  );
}
