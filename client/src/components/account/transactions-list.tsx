"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ReceiptText } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";

const paymentBadge: Record<string, string> = {
  succeeded: "bg-rating/10 text-rating",
  requires_capture: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-navy/10 text-navy",
  partially_refunded: "bg-navy/10 text-navy",
};

export function TransactionsList() {
  const [rows, setRows] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    bookings
      .list()
      .then(setRows)
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 401
            ? "Sign in to see your transactions."
            : "Couldn't load your transactions.",
        );
        setRows([]);
      });
  }, []);

  if (rows === null) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const withPayment = rows.filter((b) => b.payment);

  if (error || withPayment.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <ReceiptText className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "You have no transactions yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Booking</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withPayment.map((b) => (
              <tr key={b.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(b.created_at), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/account/trips/${b.id}`} className="font-medium text-navy hover:underline">
                    {b.reference}
                  </Link>
                  <span className="block text-xs text-muted-foreground">{b.property_name}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      paymentBadge[b.payment!.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.payment!.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {b.currency} {Number(b.total_amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
