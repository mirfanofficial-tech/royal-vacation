import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { TripsList } from "@/components/account/trips-list";

export const metadata: Metadata = { title: "Trips and bookings | Royal Vacation" };

export default function TripsPage() {
  return (
    <AccountPage title="Trips and bookings" wide crumbs={[{ label: "Trips and bookings" }]}>
      <TripsList />
    </AccountPage>
  );
}
