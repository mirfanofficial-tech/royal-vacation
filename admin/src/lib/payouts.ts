export type PayoutStatus = "scheduled" | "processing" | "paid" | "failed";

export interface PayoutRecord {
  id: string;
  scheduled: string;
  source: string;
  description: string;
  method: string;
  status: PayoutStatus;
  amount: number;
}

export const payoutRecords: PayoutRecord[] = [
  { id: "po_01", scheduled: "2026-08-09", source: "Checkout.com", description: "Weekly settlement · 11–17 Aug bookings", method: "ADCB ·· 4412", status: "scheduled", amount: 64100 },
  { id: "po_02", scheduled: "2026-08-09", source: "Stripe", description: "Weekly settlement · card payments", method: "ADCB ·· 4412", status: "scheduled", amount: 38900 },
  { id: "po_03", scheduled: "2026-08-08", source: "Tap", description: "MENA card settlements", method: "ENBD ·· 7780", status: "processing", amount: 15200 },
  { id: "po_04", scheduled: "2026-08-05", source: "Checkout.com", description: "Weekly settlement · 04–10 Aug", method: "ADCB ·· 4412", status: "paid", amount: 58750 },
  { id: "po_05", scheduled: "2026-08-04", source: "Kikoto", description: "Ferry commissions · July", method: "ENBD ·· 7780", status: "paid", amount: 4210 },
  { id: "po_06", scheduled: "2026-08-03", source: "PayPal", description: "Wallet settlements", method: "PayPal business", status: "paid", amount: 8650 },
  { id: "po_07", scheduled: "2026-08-01", source: "Amadeus", description: "Flight commissions · July", method: "ENBD ·· 7780", status: "failed", amount: 11800 },
  { id: "po_08", scheduled: "2026-07-30", source: "Stripe", description: "Weekly settlement · card payments", method: "ADCB ·· 4412", status: "paid", amount: 40200 },
];

export interface ModuleCommission {
  module: string;
  category: string;
  gross: number;
  commissionRate: number;
  commission: number;
  due: string;
}

export const moduleCommissions: ModuleCommission[] = [
  { module: "Kikoto", category: "Ferries", gross: 84200, commissionRate: 5, commission: 4210, due: "2026-08-12" },
  { module: "Amadeus", category: "Flights", gross: 118000, commissionRate: 10, commission: 11800, due: "2026-08-01" },
  { module: "Viator", category: "Tours & Activities", gross: 56300, commissionRate: 15, commission: 8445, due: "2026-08-18" },
  { module: "Welcome Pickups", category: "Transfers", gross: 31800, commissionRate: 18, commission: 5724, due: "2026-08-22" },
];

export const payoutKpis = {
  paidOut: 128560,
  paidOutDelta: 11.8,
  nextPayout: 103000,
  nextPayoutDate: "2026-08-09",
  pending: 15200,
  failed: 11800,
};

export const formatPayout = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
