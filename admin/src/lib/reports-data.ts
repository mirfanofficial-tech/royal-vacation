// Demo dataset for the Reports module. There is no bookings/payments backend
// yet (see VERVOTECH_INTEGRATION.md Stage D), so every report screen computes
// off this one coherent set of bookings. Swap `reportBookings` for a real
// `/api/v1/admin/reports/*` fetch later — the selectors in `reports.ts` and the
// `ReportView` UI don't change.

export type ReportBookingStatus = "confirmed" | "completed" | "cancelled" | "no_show";
export type ReportChannel = "Direct" | "Booking.com" | "Airbnb" | "Expedia";
export type PaymentMethod = "Checkout.com" | "Stripe" | "Tap" | "PayPal" | "mada";
export type PaymentStatus = "paid" | "pending" | "failed";
export type RefundStatus = "processed" | "pending" | "failed";

export interface ReportPayment {
  id: string;
  date: string;
  method: PaymentMethod;
  gatewayRef: string;
  status: PaymentStatus;
  amount: number;
}

export interface ReportRefund {
  id: string;
  date: string;
  method: PaymentMethod;
  gatewayRef: string;
  reason: string;
  status: RefundStatus;
  amount: number;
}

export interface ReportRoom {
  name: string;
  occupancy: string;
  boardBasis: string;
}

export interface ReportBooking {
  id: string;
  supplierRef: string;
  createdAt: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  hotel: string;
  city: string;
  guestName: string;
  guestEmail: string;
  rooms: ReportRoom[];
  channel: ReportChannel;
  status: ReportBookingStatus;
  currency: "AED";
  /** What the guest paid, incl. taxes & fees. */
  grossAmount: number;
  /** Wholesale cost paid to the supplier (RateHawk). */
  supplierCost: number;
  /** VAT + service fees portion of `grossAmount`. */
  taxesFees: number;
  cancellation?: { date: string; reason: string; penalty: number };
  payments: ReportPayment[];
  refunds: ReportRefund[];
}

/** Net margin Royal Vacation keeps on a booking. */
export function bookingMargin(b: ReportBooking): number {
  return b.grossAmount - b.supplierCost - b.taxesFees;
}

// --- deterministic generator -------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260902);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const round = (n: number, step = 10) => Math.round(n / step) * step;

const HOTELS: { hotel: string; city: string }[] = [
  { hotel: "Grand Marina Residence", city: "Dubai" },
  { hotel: "The Palm Villa Retreat", city: "Dubai" },
  { hotel: "Downtown Executive Suite", city: "Dubai" },
  { hotel: "Marina Yacht Penthouse", city: "Dubai" },
  { hotel: "Corniche Beachfront Studio", city: "Abu Dhabi" },
  { hotel: "Al Fahidi Heritage House", city: "Dubai" },
  { hotel: "Saadiyat Rotana Resort", city: "Abu Dhabi" },
  { hotel: "Sharjah Waterfront Hotel", city: "Sharjah" },
];

const GUESTS: { name: string; email: string }[] = [
  { name: "Emily Carter", email: "emily.carter@example.com" },
  { name: "James Osei", email: "james.osei@example.com" },
  { name: "Sofia Almeida", email: "sofia.almeida@example.com" },
  { name: "Daniel Kim", email: "daniel.kim@example.com" },
  { name: "Priya Sharma", email: "priya.sharma@example.com" },
  { name: "Lucas Moreau", email: "lucas.moreau@example.com" },
  { name: "Aisha Khan", email: "aisha.khan@example.com" },
  { name: "Mohammed Al-Rashid", email: "m.alrashid@example.com" },
  { name: "Elena Petrova", email: "elena.petrova@example.com" },
  { name: "Wei Zhang", email: "wei.zhang@example.com" },
  { name: "Olivia Brown", email: "olivia.brown@example.com" },
  { name: "Noah Wilson", email: "noah.wilson@example.com" },
];

const ROOM_TYPES = ["Deluxe King", "Executive Suite", "Twin Sea View", "Family Room", "Studio Apartment"];
const OCCUPANCY = ["2 adults", "2 adults, 1 child", "1 adult", "2 adults, 2 children"];
const BOARDS = ["Room only", "Bed & breakfast", "Half board"];
const CHANNELS: ReportChannel[] = ["Direct", "Direct", "Booking.com", "Airbnb", "Expedia"];
const METHODS: PaymentMethod[] = ["Checkout.com", "Checkout.com", "Stripe", "Tap", "PayPal", "mada"];
const CANCEL_REASONS = [
  "Guest requested cancellation",
  "Payment authorisation failed",
  "Duplicate booking",
  "Supplier could not confirm",
  "Change of travel plans",
];
const REFUND_REASONS = [
  "Cancellation within free window",
  "Partial refund — late cancellation",
  "Price dispute resolved",
  "Service issue goodwill refund",
  "Overcharge correction",
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setUTCDate(n.getUTCDate() + days);
  return n;
}

function makeBooking(seq: number): ReportBooking {
  const created = new Date(Date.UTC(2026, 4, 1)); // 2026-05-01
  created.setUTCDate(created.getUTCDate() + int(0, 118)); // ~4 months
  const leadDays = int(2, 45);
  const checkIn = addDays(created, leadDays);
  const nights = int(1, 9);
  const checkOut = addDays(checkIn, nights);

  const { hotel, city } = pick(HOTELS);
  const guest = pick(GUESTS);
  const roomCount = rand() < 0.8 ? 1 : 2;
  const rooms: ReportRoom[] = Array.from({ length: roomCount }, () => ({
    name: pick(ROOM_TYPES),
    occupancy: pick(OCCUPANCY),
    boardBasis: pick(BOARDS),
  }));

  const nightly = int(420, 2600);
  const gross = round(nightly * nights * roomCount);
  const taxesFees = round(gross * (0.05 + rand() * 0.03)); // ~5–8%
  const supplierCost = round((gross - taxesFees) * (0.68 + rand() * 0.16)); // 68–84%

  // status mix: mostly completed/confirmed, some cancelled, few no-show
  const roll = rand();
  let status: ReportBookingStatus;
  if (roll < 0.58) status = checkOut < new Date(Date.UTC(2026, 8, 2)) ? "completed" : "confirmed";
  else if (roll < 0.78) status = "confirmed";
  else if (roll < 0.94) status = "cancelled";
  else status = "no_show";

  const id = `RV-${24000 + seq}`;
  const supplierRef = `RATEHAWK-${int(8000000, 8999999)}`;
  const channel = pick(CHANNELS);
  const method = pick(METHODS);

  const payments: ReportPayment[] = [];
  const refunds: ReportBooking["refunds"] = [];
  let cancellation: ReportBooking["cancellation"];

  if (status === "cancelled") {
    // A payment was usually taken, then a penalty kept and the rest refunded.
    const cancelDate = addDays(created, int(1, Math.max(1, leadDays - 1)));
    const reason = pick(CANCEL_REASONS);
    const paidUpfront = rand() < 0.85;
    const penaltyPct = pick([0, 0, 0.15, 0.3, 1]);
    const penalty = round(gross * penaltyPct);
    cancellation = { date: isoDate(cancelDate), reason, penalty };

    if (paidUpfront && reason !== "Payment authorisation failed") {
      payments.push({
        id: `${id}-P1`,
        date: isoDate(addDays(created, int(0, 1))),
        method,
        gatewayRef: `${method.slice(0, 3).toUpperCase()}-${int(100000, 999999)}`,
        status: "paid",
        amount: gross,
      });
      const refundAmount = gross - penalty;
      if (refundAmount > 0) {
        refunds.push({
          id: `${id}-R1`,
          date: isoDate(addDays(cancelDate, int(1, 6))),
          method,
          gatewayRef: `${method.slice(0, 3).toUpperCase()}-RF-${int(100000, 999999)}`,
          reason:
            penaltyPct === 0
              ? "Cancellation within free window"
              : "Partial refund — late cancellation",
          status: rand() < 0.85 ? "processed" : "pending",
          amount: refundAmount,
        });
      }
    } else {
      payments.push({
        id: `${id}-P1`,
        date: isoDate(addDays(created, int(0, 1))),
        method,
        gatewayRef: `${method.slice(0, 3).toUpperCase()}-${int(100000, 999999)}`,
        status: "failed",
        amount: gross,
      });
    }
  } else if (status === "no_show") {
    payments.push({
      id: `${id}-P1`,
      date: isoDate(addDays(created, int(0, 1))),
      method,
      gatewayRef: `${method.slice(0, 3).toUpperCase()}-${int(100000, 999999)}`,
      status: "paid",
      amount: gross,
    });
  } else {
    // confirmed / completed: paid in full, sometimes in two parts (deposit + balance)
    if (rand() < 0.7) {
      payments.push({
        id: `${id}-P1`,
        date: isoDate(addDays(created, int(0, 1))),
        method,
        gatewayRef: `${method.slice(0, 3).toUpperCase()}-${int(100000, 999999)}`,
        status: rand() < 0.92 ? "paid" : "pending",
        amount: gross,
      });
    } else {
      const deposit = round(gross * 0.3);
      payments.push(
        {
          id: `${id}-P1`,
          date: isoDate(addDays(created, int(0, 1))),
          method,
          gatewayRef: `${method.slice(0, 3).toUpperCase()}-${int(100000, 999999)}`,
          status: "paid",
          amount: deposit,
        },
        {
          id: `${id}-P2`,
          date: isoDate(addDays(checkIn, -int(1, 5))),
          method,
          gatewayRef: `${method.slice(0, 3).toUpperCase()}-${int(100000, 999999)}`,
          status: rand() < 0.9 ? "paid" : "pending",
          amount: gross - deposit,
        }
      );
    }
    // occasional goodwill / overcharge refund on an otherwise fine booking
    if (rand() < 0.08) {
      const amount = round(gross * pick([0.05, 0.1, 0.15]));
      refunds.push({
        id: `${id}-R1`,
        date: isoDate(addDays(checkOut, int(1, 10))),
        method,
        gatewayRef: `${method.slice(0, 3).toUpperCase()}-RF-${int(100000, 999999)}`,
        reason: pick(REFUND_REASONS.slice(2)),
        status: "processed",
        amount,
      });
    }
  }

  return {
    id,
    supplierRef,
    createdAt: isoDate(created),
    checkIn: isoDate(checkIn),
    checkOut: isoDate(checkOut),
    nights,
    hotel,
    city,
    guestName: guest.name,
    guestEmail: guest.email,
    rooms,
    channel,
    status,
    currency: "AED",
    grossAmount: gross,
    supplierCost,
    taxesFees,
    cancellation,
    payments,
    refunds,
  };
}

export const reportBookings: ReportBooking[] = Array.from({ length: 52 }, (_, i) =>
  makeBooking(i + 1)
).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// --- real-data conversion ---------------------------------------------------
// Maps the real bookings returned by `/api/v1/admin/bookings` into the report
// shape. The backend stores a single `payment` object per booking (with the
// captured/refunded amounts) rather than separate payment/refund lists, so we
// derive synethic payment/refund rows from it. No reason/penalty is persisted
// for cancellations, so those fields fall back to sensible defaults.

import type { BookingOut } from "@royal-vacation/api-client";

const LIVE_PAYMENT_METHODS: PaymentMethod[] = ["Stripe", "Checkout.com", "Tap"];
const LIVE_REFUND_REASONS = ["Guest requested cancellation", "Service issue refund"];

function liveDate(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function livePaymentRows(b: BookingOut): ReportBooking {
  const method = LIVE_PAYMENT_METHODS[0];
  const payment = b.payment;
  const status: ReportBookingStatus =
    b.status === "confirmed" || b.status === "completed" || b.status === "cancelled" || b.status === "no_show"
      ? b.status
      : b.status === "pending"
        ? "confirmed"
        : "completed";
  const paid = Number(payment?.amount_captured || 0) || Number(b.total_amount || 0);
  const refunded = Number(payment?.amount_refunded || 0);
  const capturedAt = liveDate(payment?.captured_at ?? b.created_at);

  const payments: ReportPayment[] = payment
    ? [
        {
          id: `${b.reference}-P1`,
          date: capturedAt,
          method,
          gatewayRef: `INTENT-${b.reference}`,
          status: payment.status === "failed" ? "failed" : "paid",
          amount: paid,
        },
      ]
    : [];

  const refunds: ReportRefund[] =
    refunded > 0
      ? [
          {
            id: `${b.reference}-R1`,
            date: liveDate(b.cancelled_at ?? b.created_at),
            method,
            gatewayRef: `REFUND-${b.reference}`,
            reason: LIVE_REFUND_REASONS[0],
            status: payment?.status === "refunded" ? "processed" : "pending",
            amount: refunded,
          },
        ]
      : [];

  const cancellation =
    b.status === "cancelled"
      ? {
          date: liveDate(b.cancelled_at ?? b.created_at),
          reason: LIVE_REFUND_REASONS[0],
          penalty: Math.max(0, paid - refunded),
        }
      : undefined;

  const gross = Number(b.total_amount || 0);
  const taxes = Number(b.taxes_fees || 0);

  return {
    id: b.reference,
    supplierRef: `RATEHAWK-${b.reference}`,
    createdAt: liveDate(b.created_at),
    checkIn: b.check_in,
    checkOut: b.check_out,
    nights: b.nights,
    hotel: b.property_name,
    city: b.location ?? "Dubai",
    guestName: [b.guest_first_name, b.guest_last_name].filter(Boolean).join(" ") || b.guest_email,
    guestEmail: b.guest_email,
    rooms: [
      {
        name: b.room_name,
        occupancy: `${b.adults} adults`,
        boardBasis: "Room only",
      },
    ],
    channel: "Direct",
    status,
    currency: (b.currency as ReportBooking["currency"]) ?? "AED",
    grossAmount: gross,
    supplierCost: Math.max(0, gross - taxes),
    taxesFees: taxes,
    cancellation,
    payments,
    refunds,
  };
}

export function realBookingsToReport(rows: BookingOut[]): ReportBooking[] {
  return rows.map(livePaymentRows);
}

export const reportHotels = HOTELS.map((h) => h.hotel);
export const reportChannels: ReportChannel[] = ["Direct", "Booking.com", "Airbnb", "Expedia"];
export const reportPaymentMethods: PaymentMethod[] = [
  "Checkout.com",
  "Stripe",
  "Tap",
  "PayPal",
  "mada",
];
