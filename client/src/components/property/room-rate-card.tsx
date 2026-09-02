"use client";

import { useState } from "react";
import Image from "next/image";
import { Bed, Home, Maximize, Eye, Users, ChevronDown, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoomOption } from "@/lib/property-detail-mock-data";

export function RoomRateCard({
  room,
  currency,
  defaultDetailsOpen = false,
  selectedPlanId,
  selectedQty,
  onSelect,
}: {
  room: RoomOption;
  currency: string;
  defaultDetailsOpen?: boolean;
  /** The rate plan currently selected across the whole availability list, if any. */
  selectedPlanId: string | null;
  selectedQty: number;
  onSelect: (roomId: string, planId: string, qty: number) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(defaultDetailsOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md sm:w-28">
          <Image src={room.image} alt={room.name} fill className="object-cover" sizes="112px" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-bold text-navy">{room.name}</h3>
            {room.availabilityNote && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                {room.availabilityNote}
              </span>
            )}
            {room.floorNote && (
              <span className="rounded bg-navy/5 px-1.5 py-0.5 text-[11px] font-semibold text-navy">
                {room.floorNote}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {room.beds}
            </span>
            <span className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              {room.roomsCount} room{room.roomsCount > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {room.size}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {room.view}
            </span>
            {room.tags.map((tag) => (
              <span key={tag} className="text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex shrink-0 items-center gap-1 self-start text-xs font-semibold text-gold hover:underline sm:self-center"
        >
          Room details
          <ChevronDown className={`h-3 w-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {detailsOpen && (
        <div className="border-b border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
            IN THIS ROOM
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {room.amenities.map((amenity) => (
              <li key={amenity} className="flex items-start gap-1.5 text-xs text-foreground">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="hidden grid-cols-[1fr_1.1fr_1.6fr_140px] gap-3 bg-muted/40 px-4 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground lg:grid">
        <span>GUESTS</span>
        <span>TODAY&apos;S PRICE</span>
        <span>YOUR CHOICES</span>
        <span className="text-right">SELECT AMOUNT</span>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {room.ratePlans.map((plan) => (
          <div
            key={plan.id}
            className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1fr_1.1fr_1.6fr_140px] lg:items-center"
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: plan.adults }, (_, i) => (
                <Users className="h-4 w-4 text-muted-foreground" key={i} />
              ))}
            </div>

            <div>
              {plan.originalPrice && (
                <span className="block text-xs text-muted-foreground line-through">
                  {currency} {plan.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-lg font-bold text-foreground">
                {currency} {plan.price.toLocaleString()}
              </span>
              <span className="block text-xs text-muted-foreground">
                +{currency} {plan.taxesFees.toLocaleString()} taxes and fees
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {plan.discountPercent && (
                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {plan.discountPercent}% off
                  </span>
                )}
                {plan.loyaltyDiscount && (
                  <span className="rounded bg-navy px-1.5 py-0.5 text-[11px] font-bold text-white">
                    Loyalty
                  </span>
                )}
              </div>
            </div>

            <ul className="flex flex-col gap-1 text-xs text-foreground">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {perk}
                </li>
              ))}
              <li className="flex items-start gap-1.5">
                <Check
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    plan.refundable ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                />
                {plan.cancellation}
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {plan.payNote}
              </li>
              {plan.loyaltyDiscount && (
                <li className="flex items-start gap-1.5 text-muted-foreground">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                  {plan.discountPercent}% Loyalty discount applied to the price before taxes and
                  charges
                </li>
              )}
            </ul>

            {(() => {
              const isSelected = selectedPlanId === plan.id;
              const qty = isSelected ? selectedQty : 0;
              return (
                <div className="flex flex-col items-stretch gap-2 lg:justify-self-end">
                  <select
                    value={qty}
                    onChange={(event) =>
                      onSelect(room.id, plan.id, Number(event.target.value))
                    }
                    aria-label={`Number of ${room.name} rooms`}
                    className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm font-medium text-foreground lg:w-24"
                  >
                    {Array.from({ length: 6 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onSelect(room.id, plan.id, isSelected ? 0 : 1)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-center text-sm font-semibold lg:w-24",
                      isSelected
                        ? "border border-navy bg-navy/5 text-navy"
                        : "bg-navy text-white hover:bg-navy-light",
                    )}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
