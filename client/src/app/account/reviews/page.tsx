import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { ReviewsView } from "@/components/account/reviews-view";

export const metadata: Metadata = { title: "Reviews | Royal Vacation" };

export default function ReviewsPage() {
  return (
    <AccountPage title="Reviews" wide crumbs={[{ label: "Reviews" }]}>
      <ReviewsView />
    </AccountPage>
  );
}
