import { extraOptions } from "@/lib/checkout-mock-data";

// Mirrors the backend (app/services/booking.py). The server is authoritative —
// this is for the summary card + review recap; the create-booking response's
// `totals` is what's actually charged.
export const SERVICE_FEE = 2750;
const TAX_RATE = 0.15;
const PROMO_CODES: Record<string, number> = { ROYAL10: 10000 };

export interface BookingTotals {
  nightsSubtotal: number;
  extrasTotal: number;
  taxesAndFees: number;
  serviceFee: number;
  promoCode: string | null;
  promoDiscount: number;
  total: number;
}

export function computeTotals({
  roomPrice,
  nights,
  rooms = 1,
  selectedExtraIds,
  promoCode,
}: {
  roomPrice: number;
  nights: number;
  rooms?: number;
  selectedExtraIds: string[];
  promoCode?: string | null;
}): BookingTotals {
  const nightsSubtotal = roomPrice * nights * Math.max(1, rooms);
  const extrasTotal = extraOptions
    .filter((extra) => selectedExtraIds.includes(extra.id))
    .reduce((sum, extra) => sum + extra.price, 0);
  const taxesAndFees = Math.round((nightsSubtotal + extrasTotal) * TAX_RATE);
  const serviceFee = SERVICE_FEE;

  const code = (promoCode ?? "").trim().toUpperCase() || null;
  const promoDiscount = code ? (PROMO_CODES[code] ?? 0) : 0;
  const matchedCode = promoDiscount > 0 ? code : null;

  const total = Math.max(
    0,
    nightsSubtotal + extrasTotal + taxesAndFees + serviceFee - promoDiscount,
  );

  return {
    nightsSubtotal,
    extrasTotal,
    taxesAndFees,
    serviceFee,
    promoCode: matchedCode,
    promoDiscount,
    total,
  };
}

/** The promo code the checkout applies by default (matches the summary card UI). */
export const DEFAULT_PROMO_CODE = "ROYAL10";
