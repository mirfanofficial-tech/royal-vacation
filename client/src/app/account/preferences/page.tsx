import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { PreferencesForm } from "@/components/account/preferences-form";

export const metadata: Metadata = { title: "Customisation preferences | Royal Vacation" };

export default function PreferencesPage() {
  return (
    <AccountPage
      title="Customisation preferences"
      crumbs={[{ label: "Customisation preferences" }]}
    >
      <PreferencesForm />
    </AccountPage>
  );
}
