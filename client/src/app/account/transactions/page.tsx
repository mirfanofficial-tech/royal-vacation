import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { TransactionsList } from "@/components/account/transactions-list";

export const metadata: Metadata = { title: "Transactions | Royal Vacation" };

export default function TransactionsPage() {
  return (
    <AccountPage title="Transactions" crumbs={[{ label: "Transactions" }]}>
      <TransactionsList />
    </AccountPage>
  );
}
