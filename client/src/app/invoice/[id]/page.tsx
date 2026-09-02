import type { Metadata } from "next";

import { InvoiceView } from "@/components/invoice/invoice-view";

export const metadata: Metadata = {
  title: "Invoice | Royal Vacation",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const token = firstParam(query.t);

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10">
        <InvoiceView bookingId={id} token={token} />
      </div>
    </main>
  );
}
