import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { EmailPreferencesForm } from "@/components/account/email-preferences-form";

export const metadata: Metadata = { title: "Email preferences | Royal Vacation" };

export default function EmailPreferencesPage() {
  return (
    <AccountPage title="Email preferences" crumbs={[{ label: "Email preferences" }]}>
      <EmailPreferencesForm />
    </AccountPage>
  );
}
