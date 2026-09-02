import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { RewardsView } from "@/components/account/rewards-view";

export const metadata: Metadata = { title: "Genius rewards | Royal Vacation" };

export default function RewardsPage() {
  return (
    <AccountPage title="Genius rewards & Wallet" crumbs={[{ label: "Genius rewards" }]}>
      <RewardsView />
    </AccountPage>
  );
}
