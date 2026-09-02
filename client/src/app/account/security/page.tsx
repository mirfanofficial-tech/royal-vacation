import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { SecurityForm } from "@/components/account/security-form";

export const metadata: Metadata = { title: "Security settings | Royal Vacation" };

export default function SecurityPage() {
  return (
    <AccountPage title="Security settings" crumbs={[{ label: "Security settings" }]}>
      <SecurityForm />
    </AccountPage>
  );
}
