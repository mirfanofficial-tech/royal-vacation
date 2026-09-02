"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { bookings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const SUCCESS_STATES = new Set(["succeeded", "requires_capture", "processing"]);

export function StripePaymentSection({
  step,
  onContinueToReview,
  bookingId,
  reference,
  accessToken,
  paymentTiming,
  currency,
  totalAmount,
  propertyName,
  roomName,
  checkIn,
  checkOut,
  nights,
  adults,
  rooms,
  guestName,
  guestEmail,
  guestPhone,
  onPaid,
}: {
  step: 2 | 3;
  onContinueToReview: () => void;
  bookingId: string;
  reference: string;
  accessToken: string;
  paymentTiming: "pay_now" | "pay_later";
  currency: string;
  totalAmount: number;
  propertyName: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState(false);

  const payLabel =
    paymentTiming === "pay_later"
      ? `Confirm booking · ${currency} ${totalAmount.toLocaleString()} held`
      : `Pay ${currency} ${totalAmount.toLocaleString()}`;

  async function handlePay() {
    if (!stripe || !elements || paying) return;
    setPaying(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/return`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try another card.");
      setPaying(false);
      return;
    }

    if (paymentIntent && SUCCESS_STATES.has(paymentIntent.status)) {
      bookings.sync(bookingId, accessToken).catch(() => undefined);
      onPaid();
      return;
    }

    // Otherwise Stripe is handling a redirect (3-D Secure) via return_url.
    setPaying(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* PaymentElement stays mounted across both sub-steps so entered card
          details survive the review step. */}
      <div className={step === 3 ? "hidden" : "rounded-xl border border-border bg-white p-5"}>
        <h2 className="text-base font-semibold text-navy">Payment details</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {paymentTiming === "pay_later"
            ? "Your card is verified now and only charged when the property confirms your stay."
            : "Your card is charged securely to confirm this booking."}
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                name: guestName || undefined,
                email: guestEmail || undefined,
                phone: guestPhone || undefined,
              },
            },
          }}
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Secured by Stripe
          </span>
          <Button
            onClick={onContinueToReview}
            className="rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            Continue to review
          </Button>
        </div>
      </div>

      {step === 3 && (
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-base font-semibold text-navy">Review &amp; confirm</h2>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Row label="Property" value={propertyName} />
            <Row label="Room" value={roomName} />
            <Row
              label="Stay"
              value={`${format(checkIn, "d MMM")} – ${format(checkOut, "d MMM yyyy")} · ${nights} night${nights > 1 ? "s" : ""}`}
            />
            <Row label="Guests" value={`${adults} adult${adults > 1 ? "s" : ""}, ${rooms} room${rooms > 1 ? "s" : ""}`} />
            <Row label="Lead guest" value={guestName || "—"} />
            <Row label="Email" value={guestEmail || "—"} />
            <Row label="Booking ref" value={reference} />
            <Row
              label={paymentTiming === "pay_later" ? "Amount held" : "Amount payable"}
              value={`${currency} ${totalAmount.toLocaleString()}`}
              strong
            />
          </dl>

          <label className="mt-4 flex items-start gap-2 text-sm text-foreground">
            <Checkbox checked={terms} onCheckedChange={(v) => setTerms(Boolean(v))} className="mt-0.5" />
            <span>
              I agree to the booking conditions, the cancellation policy and the privacy
              statement.
            </span>
          </label>

          {error && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            onClick={handlePay}
            disabled={!stripe || !terms || paying}
            className="mt-4 w-full gap-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-light disabled:opacity-60"
          >
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {paying ? "Processing…" : payLabel}
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Payments are processed securely by Stripe. Test mode.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-semibold text-navy" : "text-foreground"}>{value}</dd>
    </div>
  );
}
