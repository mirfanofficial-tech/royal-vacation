import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { AccountView } from "@/components/account/account-view";

export const metadata: Metadata = { title: "Personal details | Royal Vacation" };

export default function PersonalDetailsPage() {
  return (
    <AccountPage title="Personal details" crumbs={[{ label: "Personal details" }]}>
      <AccountView />
    </AccountPage>
  );
}
