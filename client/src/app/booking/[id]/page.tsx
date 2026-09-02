"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Clock, FileText, Home, Loader2 } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";
import { CheckoutHeader } from "@/components/checkout/checkout-header";

const PENDING_PAYMENT = new Set(["processing", "requires_action", "requires_confirmation"]);

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const token = useSearchParams().get("t") ?? undefined;

  const [booking, setBooking] = useState<BookingOut | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const polls = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function load(useSync: boolean) {
      try {
        const data = useSync
          ? await bookings.sync(params.id, token)
          : await bookings.get(params.id, token);
        if (cancelled) return;
        setBooking(data);
        setError("");
        // Keep polling briefly while the payment settles.
        if (
          data.status === "pending" ||
          (data.payment && PENDING_PAYMENT.has(data.payment.status))
        ) {
          if (polls.current < 5) {
            polls.current += 1;
            setTimeout(() => load(true), 2000);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "We couldn't load this booking.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(false);
    return () => {
      cancelled = true;
    };
  }, [params.id, token]);

  return (
    <>
      <CheckoutHeader />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {loading && (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
              >
                Back to home
              </Link>
            </div>
          )}

          {!loading && booking && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
              {booking.status === "confirmed" ? (
                <div className="flex flex-col items-center text-center">
                  <CheckCircle2 className="h-12 w-12 text-rating" />
                  <h1 className="mt-3 font-heading text-2xl font-bold text-navy">
                    Booking confirmed
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A confirmation has been sent to {booking.guest_email}.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <Clock className="h-12 w-12 text-amber-500" />
                  <h1 className="mt-3 font-heading text-2xl font-bold text-navy">
                    Finishing your payment…
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This usually takes a few seconds. You can safely refresh this page.
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <Line label="Booking reference" value={booking.reference} strong />
                <Line label="Property" value={booking.property_name} />
                <Line label="Room" value={booking.room_name} />
                <Line
                  label="Stay"
                  value={`${format(new Date(booking.check_in), "d MMM yyyy")} → ${format(
                    new Date(booking.check_out),
                    "d MMM yyyy",
                  )} · ${booking.nights} night${booking.nights > 1 ? "s" : ""}`}
                />
                <Line
                  label="Guests"
                  value={
                    `${booking.adults} adult${booking.adults > 1 ? "s" : ""}` +
                    (booking.children > 0
                      ? `, ${booking.children} child${booking.children > 1 ? "ren" : ""}` +
                        (booking.child_ages.length
                          ? ` (age ${booking.child_ages.join(", ")})`
                          : "")
                      : "") +
                    `, ${booking.rooms} room${booking.rooms > 1 ? "s" : ""}`
                  }
                />
                {booking.arrival_time && (
                  <Line label="Estimated arrival" value={booking.arrival_time} />
                )}
                {booking.special_requests && (
                  <Line label="Special requests" value={booking.special_requests} />
                )}
                <Line
                  label={booking.payment_timing === "pay_later" ? "Amount held" : "Amount paid"}
                  value={`${booking.currency} ${Number(booking.total_amount).toLocaleString()}`}
                  strong
                />
              </div>

              {booking.payment_timing === "pay_later" && (
                <p className="mt-3 rounded-lg bg-navy/5 px-3 py-2 text-xs text-navy">
                  Your card is held, not charged. {booking.currency}{" "}
                  {Number(booking.total_amount).toLocaleString()} will be taken closer to
                  check-in, and you can still cancel for free per the rate policy.
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/invoice/${booking.id}?t=${encodeURIComponent(token ?? "")}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
                >
                  <FileText className="h-4 w-4" />
                  View invoice
                </Link>
                <Link
                  href="/"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <Home className="h-4 w-4" />
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-navy" : "text-foreground"}>{value}</span>
    </div>
  );
}
