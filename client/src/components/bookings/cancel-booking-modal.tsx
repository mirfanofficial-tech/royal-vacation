"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { CheckCircle2, Loader2, TriangleAlert, X } from "lucide-react";

import type { BookingCancelOut, BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";

const REASONS = [
  "My travel plans have changed",
  "Found a better deal elsewhere",
  "I made a mistake with my booking",
  "Sick or unexpected circumstances",
  "Other reason",
];

function money(currency: string, value: number | string) {
  return `${currency} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function CancelBookingModal({
  booking,
  token,
  open,
  onClose,
  onCancelled,
}: {
  booking: BookingOut;
  token?: string;
  open: boolean;
  onClose: () => void;
  onCancelled: (result: BookingCancelOut) => void;
}) {
  const [entered, setEntered] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BookingCancelOut | null>(null);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      setResult(null);
      setError("");
      setSubmitting(false);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  const freeCancellation = booking.payment_timing === "pay_later";

  async function confirm() {
    setSubmitting(true);
    setError("");
    try {
      const res = await bookings.cancel(booking.id, { reason }, token);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "We couldn't cancel the booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function closeWithResult() {
    if (result) onCancelled(result);
    onClose();
  }

  const stayLine = `${format(new Date(booking.check_in), "d MMM yyyy")} → ${format(
    new Date(booking.check_out),
    "d MMM yyyy",
  )}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cancel booking"
      className={`fixed inset-0 z-[2500] flex items-end justify-center overflow-y-auto bg-navy-dark/60 p-0 backdrop-blur-sm transition-opacity duration-300 ease-out sm:items-center sm:p-8 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (!submitting && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-full w-full max-w-[540px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:rounded-2xl ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-navy">Cancel your booking</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-navy hover:text-navy disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------- Success ---------- */}
        {result ? (
          <div className="px-6 py-8">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rating/10">
                <CheckCircle2 className="h-8 w-8 text-rating" />
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold text-navy">Booking cancelled</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {result.booking.property_name} · {result.booking.reference}
              </p>

              <div className="mt-6 w-full rounded-xl border border-border bg-muted/30 p-4 text-sm">
                {result.held_to_pay ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Cancellation fee</span>
                    <span className="font-semibold text-foreground">Free — nothing charged</span>
                  </div>
                ) : Number(result.refund_amount) > 0 ? (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Refund</span>
                      <span className="font-semibold text-rating">
                        {money(result.refund_currency, result.refund_amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between gap-4">
                      <span className="text-muted-foreground">Cancellation fee</span>
                      <span className="font-semibold text-foreground">
                        {money(result.refund_currency, result.kept_amount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Refund</span>
                    <span className="font-semibold text-foreground">No refund</span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                {result.held_to_pay
                  ? "Your card hold has been released."
                  : Number(result.refund_amount) > 0
                    ? "Refunds are returned to the original payment method. It may take a few days to appear."
                    : "Your booking has been cancelled."}
              </p>

              <button
                type="button"
                onClick={closeWithResult}
                className="mt-6 w-full rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ---------- Confirm ---------- */
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-semibold text-navy">{booking.property_name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {booking.room_name} · {stayLine} · {booking.nights} night
                {booking.nights > 1 ? "s" : ""}
              </p>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm">
                {freeCancellation ? (
                  <>
                    <p className="font-semibold text-amber-800">
                      Free cancellation — nothing charged
                    </p>
                    <p className="mt-1 text-amber-700/90">
                      Your card was only authorised, not charged. Cancelling releases the hold and
                      you won't pay anything.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-amber-800">
                      This booking may be non-refundable
                    </p>
                    <p className="mt-1 text-amber-700/90">
                      The exact refund amount is confirmed when you cancel. Any refund is returned
                      to your original payment method.
                    </p>
                  </>
                )}
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold text-foreground">
              Why are you cancelling?
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-normal text-foreground outline-none focus-visible:border-navy disabled:opacity-50"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={confirm}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Cancelling…" : "Cancel my booking"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
