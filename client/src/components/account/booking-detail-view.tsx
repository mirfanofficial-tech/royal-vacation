"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { InvoiceDocument } from "@/components/invoice/invoice-document";

const statusStyle: Record<string, string> = {
  confirmed: "bg-rating/10 text-rating",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-navy/10 text-navy",
  no_show: "bg-destructive/10 text-destructive",
};

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<BookingOut | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    bookings
      .get(bookingId)
      .then((b) => !cancelled && setBooking(b))
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 401
            ? "Sign in to view this booking."
            : "We couldn't find this booking.",
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function handleDownload() {
    if (!docRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadInvoicePdf(docRef.current, `invoice-${booking?.reference ?? bookingId}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-destructive">{error || "Booking not found."}</p>
        <Link
          href="/account/trips"
          className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-none flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/account/trips"
          className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All trips
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          disabled={pdfBusy}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-60"
        >
          {pdfBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download invoice (PDF)
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
        <span className="font-heading text-lg font-bold text-navy">{booking.reference}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
            statusStyle[booking.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {booking.status.replace(/_/g, " ")}
        </span>
        <span className="text-sm text-muted-foreground">
          {booking.payment_timing === "pay_later"
            ? "Card held — charged near check-in"
            : "Paid in full"}
        </span>
      </div>

      <div ref={docRef}>
        <InvoiceDocument booking={booking} />
      </div>
    </div>
  );
}
