"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ApiError, bookings } from "@/lib/api";
import { useBookingInvoice } from "@/components/account/booking-invoice-context";
import { InvoiceDocument } from "@/components/invoice/invoice-document";

function BookingDetailBody({ bookingId }: { bookingId: string }) {
  const { setBooking, docRef } = useBookingInvoice();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    bookings
      .get(bookingId)
      .then((b) => {
        if (cancelled) return;
        setBooking(b);
      })
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
  }, [bookingId, setBooking]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-destructive">{error}</p>
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
    <div ref={docRef} className="print:border-none print:p-0 print:shadow-none">
      <InvoiceDocumentView />
    </div>
  );
}

function InvoiceDocumentView() {
  const { booking } = useBookingInvoice();
  if (!booking) return null;
  return <InvoiceDocument booking={booking} />;
}

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  return <BookingDetailBody bookingId={bookingId} />;
}
