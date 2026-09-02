"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft } from "lucide-react";

import type { BookingCreateResult } from "@royal-vacation/api-client";
import { ApiError, bookings, requestOtp } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { computeTotals, DEFAULT_PROMO_CODE } from "@/lib/booking-pricing";
import { GuestInfoForm, type GuestInfoValues } from "@/components/checkout/guest-info-form";
import { ExtrasSection } from "@/components/checkout/extras-section";
import { BookingSummaryCard } from "@/components/checkout/booking-summary-card";
import { StepIndicator } from "@/components/checkout/step-indicator";
import { StripePaymentSection } from "@/components/checkout/stripe-payment-section";
import { OtpModal } from "@/components/checkout/otp-modal";

export const LAST_CHECKOUT_KEY = "rv:last-checkout";

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CheckoutFormSections({
  propertyId,
  ratePlanId,
  roomId,
  currency,
  propertyName,
  propertyImage,
  roomImage,
  starRating,
  rating,
  ratingLabel,
  reviews,
  location,
  roomName,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  childAges: initialChildAges,
  rooms,
  nights,
  roomPrice,
  roomTaxesFees,
  maxAdults,
  refundable,
}: {
  propertyId: string;
  ratePlanId: string;
  roomId: string;
  currency: string;
  propertyName: string;
  propertyImage: string;
  roomImage: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  childrenCount: number;
  childAges: number[];
  rooms: number;
  nights: number;
  roomPrice: number;
  roomTaxesFees: number;
  maxAdults: number;
  refundable: boolean;
}) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [guestInfo, setGuestInfo] = useState<GuestInfoValues | null>(null);
  const [guestInfoValid, setGuestInfoValid] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [result, setResult] = useState<BookingCreateResult | null>(null);

  const [otpOpen, setOtpOpen] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const localTotals = useMemo(
    () =>
      computeTotals({
        roomPrice,
        nights,
        rooms,
        selectedExtraIds,
        promoCode: DEFAULT_PROMO_CODE,
      }),
    [roomPrice, nights, rooms, selectedExtraIds],
  );

  const stripePromise = useMemo(
    () => (result?.publishable_key ? loadStripe(result.publishable_key) : null),
    [result?.publishable_key],
  );

  function otpRequestBody() {
    return {
      email: guestInfo!.email,
      first_name: guestInfo!.firstName,
      last_name: guestInfo!.lastName,
      phone: guestInfo!.phone,
      country: guestInfo!.country,
    };
  }

  async function handleContinueToPayment() {
    if (!guestInfo || !guestInfoValid || creating) return;

    // Already signed in with this same email? Skip the OTP.
    const session = getSession();
    if (session?.email && session.email.toLowerCase() === guestInfo.email.toLowerCase()) {
      return createBookingAndAdvance();
    }

    setCreating(true);
    setCreateError("");
    try {
      const r = await requestOtp(otpRequestBody());
      setDevCode(r.dev_code ?? null);
      setOtpOpen(true);
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : "Couldn't send a verification code. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function createBookingAndAdvance() {
    if (!guestInfo || creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await bookings.create({
        property_id: propertyId,
        rate_plan_id: ratePlanId,
        check_in: toYmd(checkIn),
        check_out: toYmd(checkOut),
        adults,
        children: childrenCount,
        child_ages: guestInfo.childAges,
        rooms,
        extra_ids: selectedExtraIds,
        promo_code: DEFAULT_PROMO_CODE,
        rate_snapshot: {
          property_name: propertyName,
          room_id: roomId,
          room_name: roomName,
          room_image: roomImage,
          currency,
          price: roomPrice,
          taxes_fees: roomTaxesFees,
          refundable,
          max_adults: maxAdults,
        },
        guest: {
          first_name: guestInfo.firstName,
          last_name: guestInfo.lastName,
          email: guestInfo.email,
          dial_code: guestInfo.dialCode,
          phone: guestInfo.phone,
          country: guestInfo.country,
          booking_for: guestInfo.bookingFor,
          arrival_time: guestInfo.arrivalTime || null,
          special_requests: guestInfo.specialRequests || null,
        },
      });
      setResult(res);
      try {
        sessionStorage.setItem(
          LAST_CHECKOUT_KEY,
          JSON.stringify({ id: res.booking_id, token: res.access_token }),
        );
      } catch {
        /* private mode — the return page will fall back to the query params */
      }
      setStep(2);
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : "Couldn't start your booking. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  const summaryTotals = result?.totals
    ? {
        nightsSubtotal: Number(result.totals.nights_subtotal),
        extrasTotal: Number(result.totals.extras_total),
        taxesAndFees: Number(result.totals.taxes_fees),
        serviceFee: Number(result.totals.service_fee),
        promoCode: result.totals.promo_code ?? null,
        promoDiscount: Number(result.totals.promo_discount),
        total: Number(result.totals.total_amount),
      }
    : localTotals;

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <StepIndicator currentStep={step} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          {step === 1 && (
            <>
              <GuestInfoForm
                adults={adults}
                childrenCount={childrenCount}
                initialChildAges={initialChildAges}
                onValuesChange={(values, isValid) => {
                  setGuestInfo(values);
                  setGuestInfoValid(isValid);
                }}
              />
              <ExtrasSection currency={currency} onSelectionChange={setSelectedExtraIds} />
              {createError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {createError}
                </p>
              )}
            </>
          )}

          {step !== 1 && result && stripePromise && (
            <>
              <button
                type="button"
                onClick={() => setStep(step === 3 ? 2 : 1)}
                className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 3 ? "Back to payment" : "Back to guest details"}
              </button>
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: result.client_secret, appearance: { theme: "stripe" } }}
              >
                <StripePaymentSection
                  step={step}
                  onContinueToReview={() => setStep(3)}
                  bookingId={result.booking_id}
                  reference={result.reference}
                  accessToken={result.access_token}
                  paymentTiming={result.payment_timing}
                  currency={currency}
                  totalAmount={Number(result.totals.total_amount)}
                  propertyName={propertyName}
                  roomName={roomName}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  nights={nights}
                  adults={adults}
                  rooms={rooms}
                  guestName={
                    guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}`.trim() : ""
                  }
                  guestEmail={guestInfo?.email ?? ""}
                  guestPhone={
                    guestInfo?.phone
                      ? `${guestInfo.dialCode ?? ""}${guestInfo.phone}`.trim()
                      : ""
                  }
                  onPaid={() =>
                    router.push(
                      `/booking/${result.booking_id}?t=${encodeURIComponent(result.access_token)}`,
                    )
                  }
                />
              </Elements>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <BookingSummaryCard
            propertyName={propertyName}
            propertyImage={propertyImage}
            starRating={starRating}
            rating={rating}
            ratingLabel={ratingLabel}
            reviews={reviews}
            location={location}
            currency={currency}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            rooms={rooms}
            nights={nights}
            roomPrice={roomPrice}
            selectedExtraIds={selectedExtraIds}
            promoCode={DEFAULT_PROMO_CODE}
            totals={summaryTotals}
            onConfirm={step === 1 ? handleContinueToPayment : undefined}
            confirmDisabled={!guestInfoValid || creating}
            confirmLabel={creating ? "Starting booking…" : "Continue to payment"}
            confirmHint={
              refundable
                ? "Your card is only charged when the property confirms — complete your details to continue."
                : "Please complete the guest information above to continue."
            }
          />
          {step === 1 && refundable && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Free cancellation · you won&apos;t be charged now.
            </p>
          )}
        </aside>
      </div>

      <OtpModal
        open={otpOpen}
        email={guestInfo?.email ?? ""}
        devCode={devCode}
        onClose={() => setOtpOpen(false)}
        onResend={async () => {
          const r = await requestOtp(otpRequestBody());
          return r.dev_code ?? null;
        }}
        onVerified={() => {
          setOtpOpen(false);
          void createBookingAndAdvance();
        }}
      />
    </div>
  );
}
