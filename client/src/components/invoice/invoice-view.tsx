"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { InvoiceDocument } from "@/components/invoice/invoice-document";

export function InvoiceView({ bookingId, token }: { bookingId: string; token?: string }) {
  const [booking, setBooking] = useState<BookingOut | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    bookings
      .get(bookingId, token)
      .then((data) => {
        if (!cancelled) setBooking(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "We couldn't load this invoice.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, token]);

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
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <p className="text-sm text-destructive">{error || "Invoice not found."}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={handleDownload}
          disabled={pdfBusy}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
        >
          {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF
        </button>
      </div>

      <div ref={docRef}>
        <InvoiceDocument booking={booking} />
      </div>
    </div>
  );
}
