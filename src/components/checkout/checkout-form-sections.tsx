"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GuestInfoForm, type GuestInfoValues } from "@/components/checkout/guest-info-form";
import { PaymentMethodForm } from "@/components/checkout/payment-method-form";
import { ExtrasSection } from "@/components/checkout/extras-section";
import { BookingSummaryCard } from "@/components/checkout/booking-summary-card";

export function CheckoutFormSections({
  propertyId,
  roomId,
  currency,
  propertyName,
  propertyImage,
  starRating,
  rating,
  ratingLabel,
  reviews,
  location,
  checkIn,
  checkOut,
  adults,
  rooms,
  nights,
  roomPrice,
}: {
  propertyId: string;
  roomId: string;
  currency: string;
  propertyName: string;
  propertyImage: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  rooms: number;
  nights: number;
  roomPrice: number;
}) {
  const router = useRouter();
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [guestInfo, setGuestInfo] = useState<GuestInfoValues | null>(null);
  const [guestInfoValid, setGuestInfoValid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleConfirm = () => {
    if (!guestInfo || !guestInfoValid) return;

    const params = new URLSearchParams({
      room: roomId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: String(adults),
      rooms: String(rooms),
      firstName: guestInfo.firstName,
      lastName: guestInfo.lastName,
      email: guestInfo.email,
      dialCode: guestInfo.dialCode,
      phone: guestInfo.phone,
      country: guestInfo.country,
      paymentMethod,
    });
    if (selectedExtraIds.length > 0) {
      params.set("extras", selectedExtraIds.join(","));
    }

    router.push(`/invoice/${propertyId}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-5">
        <GuestInfoForm
          onValuesChange={(values, isValid) => {
            setGuestInfo(values);
            setGuestInfoValid(isValid);
          }}
        />
        <PaymentMethodForm onMethodChange={setPaymentMethod} />
        <ExtrasSection currency={currency} onSelectionChange={setSelectedExtraIds} />
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
          onConfirm={handleConfirm}
          confirmDisabled={!guestInfoValid}
        />
      </aside>
    </div>
  );
}
