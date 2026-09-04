"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatAED, type PaymentInvoice } from "@/lib/payments";
import { usePaymentsData } from "@/lib/payments-hooks";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusBadge: Record<PaymentInvoice["status"], string> = {
  paid: "bg-rating/10 text-rating",
  sent: "bg-amber-600/10 text-amber-600",
  draft: "bg-muted text-muted-foreground",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabel: Record<PaymentInvoice["status"], string> = {
  paid: "Paid",
  sent: "Sent",
  draft: "Draft",
  overdue: "Overdue",
};

const aed = (n: number) => `AED ${formatAED(n)}`;

function InvoiceSheet({ invoice }: { invoice: PaymentInvoice }) {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-border bg-white p-8 print:max-w-full print:border-0 print:rounded-none print:p-0">
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-navy">Royal Vacation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vacation stays · Dubai, United Arab Emirates
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-navy">{invoice.number}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Issued {invoice.issuedAt} · Due {invoice.dueDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-6">
        <div className="text-sm">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Billed to</p>
          <p className="mt-2 font-medium text-navy">{invoice.guest}</p>
        </div>
        <div className="text-sm text-right">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Booking</p>
          <p className="mt-2 font-mono text-xs text-navy">{invoice.bookingRef}</p>
          <p className="mt-1 text-muted-foreground">{invoice.property}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Description</th>
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3">
                <p className="font-medium text-navy">
                  {invoice.property} · {invoice.bookingRef}
                </p>
                <p className="text-xs text-muted-foreground">
                  Accommodation booked {invoice.issuedAt}
                </p>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{aed(invoice.total)}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-2.5 text-right text-muted-foreground">Subtotal</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{aed(invoice.total)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-right text-muted-foreground">VAT (included)</td>
              <td className="px-4 py-2.5 text-right tabular-nums">- {aed(invoice.tax)}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-3 text-right font-semibold text-navy">Total due</td>
              <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-navy">
                {aed(invoice.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span>
          Status:{" "}
          <Badge
            className={cn("rounded-full", statusBadge[invoice.status])}
          >
            {statusLabel[invoice.status]}
          </Badge>
        </span>
        <span className="text-xs text-muted-foreground">
          Royal Vacation FZ-LLC · TRN 100003456789 · {invoice.number}
        </span>
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const { invoices, isLoading } = usePaymentsData();

  const invoice = invoices.find((inv) => inv.id === params.id);

  if (isLoading && invoices.length === 0) {
    return (
      <PermissionGuard module="payments">
        <div className="flex flex-col items-center justify-center gap-3 p-20">
          <p className="text-sm text-muted-foreground">Loading invoice…</p>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard module="payments">
      <div className="space-y-6 p-6 lg:p-8 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/payments/invoices" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Invoices
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer data-icon="inline-start" />
            Print invoice
          </Button>
        </div>

        {!invoice ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Invoice <span className="font-medium">{params.id}</span> not found.
          </div>
        ) : (
          <InvoiceSheet invoice={invoice} />
        )}
      </div>
    </PermissionGuard>
  );
}