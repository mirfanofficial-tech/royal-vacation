"use client";

import { useState } from "react";
import { Download, Loader2, Printer, Share2, XCircle } from "lucide-react";

import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { useBookingInvoice } from "@/components/account/booking-invoice-context";
import { CancelBookingModal } from "@/components/bookings/cancel-booking-modal";

const CANCELLABLE = new Set(["pending", "confirmed"]);

export function InvoiceActions() {
  const { booking, docRef, setBooking } = useBookingInvoice();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [shared, setShared] = useState(false);

  async function handleDownload() {
    if (!docRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadInvoicePdf(docRef.current, `invoice-${booking?.reference ?? "booking"}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleShare() {
    if (!booking || typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${booking.property_name} — Invoice`,
          text: `Invoice for booking ${booking.reference} at ${booking.property_name}.`,
          url,
        });
        return;
      } catch {
        /* user dismissed share sheet */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      {CANCELLABLE.has(booking?.status ?? "") && (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5"
        >
          <XCircle className="h-4 w-4" />
          Cancel booking
        </button>
      )}

      <button
        type="button"
        onClick={handleShare}
        disabled={!booking}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Share2 className="h-4 w-4" />
        {shared ? "Copied" : "Share"}
      </button>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!booking || pdfBusy}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Download
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        disabled={!booking}
        className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-50"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>

      {booking && (
        <CancelBookingModal
          booking={booking}
          token={undefined}
          open={cancelOpen}
          onClose={() => setCancelOpen(false)}
          onCancelled={(result) => {
            setBooking(result.booking);
            setCancelOpen(false);
          }}
        />
      )}
    </>
  );
}
