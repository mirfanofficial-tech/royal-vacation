import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "My Account | Royal Vacation",
  description: "Manage your Royal Vacation profile, rewards and bookings.",
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <AccountDashboard />
      <Footer />
    </>
  );
}
