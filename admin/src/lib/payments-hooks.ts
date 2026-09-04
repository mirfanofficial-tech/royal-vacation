"use client";

import { useMemo } from "react";
import type { BookingOut } from "@royal-vacation/api-client";

import { useAdminBookings } from "@/lib/bookings";
import {
  paymentInvoices,
  paymentRefunds,
  paymentTransactions,
  type PaymentInvoice,
  type PaymentRefund,
  type PaymentTransaction,
  type PaymentTxnStatus,
} from "@/lib/payments";

// Derived, real-data models. The backend exposes one `payment` object per
// booking (captured/refunded amounts + status) rather than separate payment,
// invoice and refund records, so we synthesise the payments-module rows from
// the real bookings and fall back to the demo data when the API is unavailable.

function livePaymentTxn(b: BookingOut): PaymentTransaction | null {
  const amount = Number(b.payment?.amount_captured || 0) || Number(b.total_amount || 0);
  if (amount <= 0 && !b.payment) return null;

  const rawStatus = b.payment?.status ?? "requires_payment_method";
  let status: PaymentTxnStatus;
  if (rawStatus === "failed") status = "failed";
  else if (rawStatus === "refunded" || rawStatus === "partially_refunded") status = "refunded";
  else if (Number(b.payment?.amount_captured || 0) > 0) status = "paid";
  else status = "pending";

  const last4 = b.payment?.card_last4 ? `•••• ${b.payment.card_last4}` : "";
  const brand = b.payment?.card_brand || "Card";
  const method =
    (last4 ? `${capitalize(brand)} ${last4}` : `Stripe ${capitalize(brand)}`) as
      | "Visa •••• 4242"
      | "Mastercard •••• 8871"
      | "Amex •••• 3109"
      | "Apple Pay"
      | "Bank transfer"
      | "Cash at property";

  return {
    id: `${b.reference}-TXN`,
    bookingRef: b.reference,
    guest: guestName(b),
    guestEmail: b.guest_email,
    property: b.property_name,
    channel: "Online",
    method,
    amount,
    fee: Math.round(amount * 0.02),
    status,
    date: (b.payment?.captured_at ?? b.created_at).slice(0, 10),
  };
}

function liveInvoice(b: BookingOut): PaymentInvoice {
  const total = Number(b.total_amount || 0);
  const tax = Number(b.taxes_fees || 0);
  const issuedAt = b.created_at.slice(0, 10);
  const paid = Number(b.payment?.amount_captured || 0) > 0;
  return {
    id: `${b.reference}-INV`,
    number: `INV-${b.reference}`,
    guest: guestName(b),
    property: b.property_name,
    bookingRef: b.reference,
    issuedAt,
    dueDate: issuedAt,
    total,
    tax,
    status: b.status === "cancelled" ? "draft" : paid ? "paid" : "sent",
  };
}

function liveRefund(b: BookingOut): PaymentRefund | null {
  const refunded = Number(b.payment?.amount_refunded || 0);
  if (refunded <= 0) return null;
  return {
    id: `${b.reference}-RF`,
    bookingRef: b.reference,
    guest: guestName(b),
    property: b.property_name,
    reason: b.status === "cancelled" ? "Guest requested cancellation" : "Refund issued on booking",
    amount: refunded,
    original: Number(b.total_amount || 0),
    status:
      b.payment?.status === "refunded" || b.payment?.status === "partially_refunded"
        ? "completed"
        : "pending",
    initiatedBy: "admin@royalvacation.com",
    date: (b.cancelled_at ?? b.created_at).slice(0, 10),
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function guestName(b: BookingOut): string {
  return [b.guest_first_name, b.guest_last_name].filter(Boolean).join(" ") || b.guest_email;
}

export function usePaymentsData() {
  const { bookings, isLoading, error } = useAdminBookings({ limit: 200 });
  const hasLive = bookings && bookings.length > 0;

  const data = useMemo(() => {
    if (hasLive) {
      const transactions = bookings
        .map(livePaymentTxn)
        .filter((t): t is PaymentTransaction => t !== null);
      const invoices = bookings.map(liveInvoice);
      const refunds = bookings.map(liveRefund).filter((r): r is PaymentRefund => r !== null);
      return { transactions, invoices, refunds, isReal: true };
    }
    if (error) {
      return {
        transactions: paymentTransactions,
        invoices: paymentInvoices,
        refunds: paymentRefunds,
        isReal: false,
      };
    }
    return { transactions: [], invoices: [], refunds: [], isReal: false };
  }, [bookings, hasLive, error]);

  const kpis = useMemo(() => {
    if (data.isReal) {
      const volume = data.transactions.reduce((s, t) => s + t.amount, 0);
      const success = data.transactions.filter((t) => t.status === "paid").length;
      const fees = data.transactions.reduce((s, t) => s + t.fee, 0);
      const outstanding = data.invoices
        .filter((i) => i.status !== "paid")
        .reduce((s, i) => s + i.total, 0);
      return {
        processedVolume: volume,
        processedCount: data.transactions.length,
        successRate: data.transactions.length
          ? (success / data.transactions.length) * 100
          : 0,
        gatewayFees: fees,
        outstandingInvoices: outstanding,
      };
    }
    return null;
  }, [data]);

  return { ...data, isLoading, error, kpis };
}
