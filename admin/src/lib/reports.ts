// Report registry + pure selectors over the demo booking set. Each report is a
// config (title, columns, which filters it supports) plus a `run(filters)` that
// returns summary tiles + table rows (+ an optional chart series). Swapping to a
// real backend later means turning `run` into a fetch — the columns, filters and
// `ReportView` stay the same.

import type { ReportSeriesPoint } from "@/lib/finance";
import {
  bookingMargin,
  reportBookings,
  reportChannels,
  reportHotels,
  reportPaymentMethods,
  type ReportBooking,
} from "@/lib/reports-data";
export type RangeId =
  | "this-month"
  | "last-30-days"
  | "this-quarter"
  | "this-year"
  | "all";

export const rangeOptions: { id: RangeId; label: string }[] = [
  { id: "this-month", label: "This month" },
  { id: "last-30-days", label: "Last 30 days" },
  { id: "this-quarter", label: "This quarter" },
  { id: "this-year", label: "This year" },
  { id: "all", label: "All time" },
];

// Fixed "now" for the demo dataset (matches the seed window).
const TODAY = new Date("2026-09-02T00:00:00Z");

function rangeStart(id: RangeId): Date | null {
  const d = new Date(TODAY);
  switch (id) {
    case "this-month":
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    case "last-30-days":
      return new Date(d.getTime() - 30 * 864e5);
    case "this-quarter": {
      const q = Math.floor(d.getUTCMonth() / 3) * 3;
      return new Date(Date.UTC(d.getUTCFullYear(), q, 1));
    }
    case "this-year":
      return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    case "all":
      return null;
  }
}

function inRange(iso: string, id: RangeId): boolean {
  const start = rangeStart(id);
  if (!start) return true;
  const t = new Date(iso + "T00:00:00Z").getTime();
  return t >= start.getTime() && t <= TODAY.getTime();
}

export type ColumnFormat = "text" | "currency" | "date" | "status" | "number";

export interface ReportColumn {
  key: string;
  header: string;
  format?: ColumnFormat;
  align?: "left" | "right";
}

export type FilterKey = "range" | "hotel" | "status" | "channel" | "method";

export interface ReportRow {
  [key: string]: string | number | undefined;
  /** Optional row target — the detail page for a booking. */
  _href?: string;
}

export interface ReportResult {
  summary: { label: string; value: string }[];
  rows: ReportRow[];
  series?: ReportSeriesPoint[];
}

export interface ReportFilters {
  range: RangeId;
  hotel: string; // "all" | hotel name
  status: string; // "all" | status
  channel: string; // "all" | channel
  method: string; // "all" | payment method
}

export interface ReportDef {
  key: string;
  title: string;
  description: string;
  group: "Bookings" | "Finance";
  filters: FilterKey[];
  columns: ReportColumn[];
  run: (filters: ReportFilters, bookings: ReportBooking[]) => ReportResult;
}

// --- Filter options ----------------------------------------------------------
// The report filter dropdowns are populated dynamically from the rows actually
// being shown, so they always match the data (real bookings when the backend is
// up, the demo set as the fallback). Report-specific status lists are fixed per
// report type because status semantics differ (booking vs payment vs refund).

const STATUS_OPTIONS: Record<string, string[]> = {
  bookings: ["confirmed", "completed", "cancelled", "no_show"],
  payments: ["paid", "pending", "failed"],
  refunds: ["processed", "pending", "failed"],
};

const uniqSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

export function reportStatusOptions(reportKey: string): string[] {
  return STATUS_OPTIONS[reportKey] ?? [];
}

function collectHotels(source: ReportBooking[]): string[] {
  return uniqSorted(source.map((b) => b.hotel).filter(Boolean));
}
function collectChannels(source: ReportBooking[]): string[] {
  return uniqSorted(source.map((b) => b.channel));
}
function collectMethods(source: ReportBooking[]): string[] {
  return uniqSorted(source.flatMap((b) => [...b.payments.map((p) => p.method), ...b.refunds.map((r) => r.method)]));
}

/** Filter options for a report, derived from `source` (with demo fallbacks). */
export function optionsFor(
  reportKey: string,
  source: ReportBooking[]
): { hotels: string[]; channels: string[]; methods: string[]; statuses: string[] } {
  const hotels = collectHotels(source);
  const channels = collectChannels(source);
  const methods = collectMethods(source);
  const statuses = reportStatusOptions(reportKey);
  return {
    hotels: hotels.length ? hotels : reportHotels,
    channels: channels.length ? channels : reportChannels,
    methods: methods.length ? methods : reportPaymentMethods,
    statuses,
  };
}

const aed = (n: number) => `AED ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string) =>
  new Date(key + "-01T00:00:00Z").toLocaleDateString("en-US", { month: "short", year: "2-digit" });

function matchesCommon(b: ReportBooking, f: ReportFilters): boolean {
  if (f.hotel !== "all" && b.hotel !== f.hotel) return false;
  if (f.channel !== "all" && b.channel !== f.channel) return false;
  return true;
}

// --- selectors -------------------------------------------------------------

function selectBookings(f: ReportFilters, source: ReportBooking[]): ReportResult {
  const rows = source.filter(
    (b) =>
      inRange(b.createdAt, f.range) &&
      matchesCommon(b, f) &&
      (f.status === "all" || b.status === f.status)
  );
  return {
    summary: [
      { label: "Bookings", value: String(rows.length) },
      { label: "Gross value", value: aed(sum(rows.map((b) => b.grossAmount))) },
      { label: "Net margin", value: aed(sum(rows.map(bookingMargin))) },
      { label: "Cancelled", value: String(rows.filter((b) => b.status === "cancelled").length) },
    ],
    rows: rows.map((b) => ({
      _href: `/reports/bookings/${b.id}`,
      id: b.id,
      createdAt: b.createdAt,
      guest: b.guestName,
      hotel: b.hotel,
      stay: `${b.checkIn} → ${b.checkOut}`,
      nights: b.nights,
      channel: b.channel,
      status: b.status,
      gross: b.grossAmount,
      margin: bookingMargin(b),
    })),
  };
}

function selectCancellations(f: ReportFilters, source: ReportBooking[]): ReportResult {
  const rows = source.filter(
    (b) =>
      b.status === "cancelled" &&
      b.cancellation != null &&
      inRange(b.cancellation.date, f.range) &&
      matchesCommon(b, f)
  );
  const refundedOf = (b: ReportBooking) => sum(b.refunds.map((r) => r.amount));
  return {
    summary: [
      { label: "Cancellations", value: String(rows.length) },
      { label: "Gross value lost", value: aed(sum(rows.map((b) => b.grossAmount))) },
      { label: "Penalties kept", value: aed(sum(rows.map((b) => b.cancellation?.penalty ?? 0))) },
      { label: "Refunded", value: aed(sum(rows.map(refundedOf))) },
    ],
    rows: rows.map((b) => ({
      _href: `/reports/bookings/${b.id}`,
      id: b.id,
      cancelledOn: b.cancellation!.date,
      guest: b.guestName,
      hotel: b.hotel,
      reason: b.cancellation!.reason,
      gross: b.grossAmount,
      penalty: b.cancellation!.penalty,
      refunded: refundedOf(b),
    })),
  };
}

function selectPayments(f: ReportFilters, source: ReportBooking[]): ReportResult {
  const flat = source.flatMap((b) =>
    b.payments
      .filter(
        (p) =>
          inRange(p.date, f.range) &&
          matchesCommon(b, f) &&
          (f.method === "all" || p.method === f.method) &&
          (f.status === "all" || p.status === f.status)
      )
      .map((p) => ({ b, p }))
  );
  const byStatus = (s: string) => flat.filter(({ p }) => p.status === s);
  return {
    summary: [
      { label: "Payments", value: String(flat.length) },
      { label: "Captured", value: aed(sum(byStatus("paid").map(({ p }) => p.amount))) },
      { label: "Pending", value: aed(sum(byStatus("pending").map(({ p }) => p.amount))) },
      { label: "Failed", value: String(byStatus("failed").length) },
    ],
    rows: flat.map(({ b, p }) => ({
      _href: `/reports/bookings/${b.id}`,
      date: p.date,
      booking: b.id,
      guest: b.guestName,
      method: p.method,
      gatewayRef: p.gatewayRef,
      status: p.status,
      amount: p.amount,
    })),
  };
}

function selectRefunds(f: ReportFilters, source: ReportBooking[]): ReportResult {
  const flat = source.flatMap((b) =>
    b.refunds
      .filter(
        (r) =>
          inRange(r.date, f.range) &&
          matchesCommon(b, f) &&
          (f.method === "all" || r.method === f.method) &&
          (f.status === "all" || r.status === f.status)
      )
      .map((r) => ({ b, r }))
  );
  const byStatus = (s: string) => flat.filter(({ r }) => r.status === s);
  return {
    summary: [
      { label: "Refunds", value: String(flat.length) },
      { label: "Processed", value: aed(sum(byStatus("processed").map(({ r }) => r.amount))) },
      { label: "Pending", value: aed(sum(byStatus("pending").map(({ r }) => r.amount))) },
      { label: "Failed", value: String(byStatus("failed").length) },
    ],
    rows: flat.map(({ b, r }) => ({
      _href: `/reports/bookings/${b.id}`,
      date: r.date,
      booking: b.id,
      guest: b.guestName,
      method: r.method,
      reason: r.reason,
      gatewayRef: r.gatewayRef,
      status: r.status,
      amount: r.amount,
    })),
  };
}

function selectRevenue(f: ReportFilters, source: ReportBooking[]): ReportResult {
  // Revenue recognised on bookings that weren't cancelled.
  const base = source.filter(
    (b) => b.status !== "cancelled" && inRange(b.createdAt, f.range) && matchesCommon(b, f)
  );
  const processedRefundsByMonth = new Map<string, number>();
  for (const b of source) {
    for (const r of b.refunds) {
      if (r.status !== "processed") continue;
      if (!inRange(r.date, f.range)) continue;
      if (f.hotel !== "all" && b.hotel !== f.hotel) continue;
      processedRefundsByMonth.set(
        monthKey(r.date),
        (processedRefundsByMonth.get(monthKey(r.date)) ?? 0) + r.amount
      );
    }
  }

  const months = new Map<string, ReportBooking[]>();
  for (const b of base) {
    const k = monthKey(b.createdAt);
    const list = months.get(k);
    if (list) list.push(b);
    else months.set(k, [b]);
  }
  const keys = [...months.keys()].sort();

  const rows: ReportRow[] = keys.map((k) => {
    const list = months.get(k)!;
    const gross = sum(list.map((b) => b.grossAmount));
    const supplier = sum(list.map((b) => b.supplierCost));
    const taxes = sum(list.map((b) => b.taxesFees));
    const refunds = processedRefundsByMonth.get(k) ?? 0;
    const margin = gross - supplier - taxes - refunds;
    return {
      month: monthLabel(k),
      bookings: list.length,
      gross,
      supplierCost: supplier,
      taxesFees: taxes,
      refunds,
      margin,
      marginPct: gross > 0 ? `${((margin / gross) * 100).toFixed(1)}%` : "—",
    };
  });

  const gGross = sum(rows.map((r) => Number(r.gross)));
  const gSupplier = sum(rows.map((r) => Number(r.supplierCost)));
  const gTaxes = sum(rows.map((r) => Number(r.taxesFees)));
  const gMargin = sum(rows.map((r) => Number(r.margin)));

  return {
    summary: [
      { label: "Gross revenue", value: aed(gGross) },
      { label: "Supplier cost", value: aed(gSupplier) },
      { label: "Taxes & fees", value: aed(gTaxes) },
      { label: "Net margin", value: aed(gMargin) },
    ],
    rows,
    series: keys.map((k, i) => ({ label: String(rows[i].month), value: Number(rows[i].margin) })),
  };
}

// --- registry ------------------------------------------------------------

export const reportRegistry: Record<string, ReportDef> = {
  bookings: {
    key: "bookings",
    title: "Booking Report",
    description: "Every booking made on the platform, with gross value and net margin.",
    group: "Bookings",
    filters: ["range", "hotel", "status", "channel"],
    columns: [
      { key: "id", header: "Booking" },
      { key: "createdAt", header: "Booked", format: "date" },
      { key: "guest", header: "Guest" },
      { key: "hotel", header: "Hotel" },
      { key: "stay", header: "Stay" },
      { key: "nights", header: "Nights", format: "number", align: "right" },
      { key: "channel", header: "Channel" },
      { key: "status", header: "Status", format: "status" },
      { key: "gross", header: "Gross", format: "currency", align: "right" },
      { key: "margin", header: "Margin", format: "currency", align: "right" },
    ],
    run: selectBookings,
  },
  cancellations: {
    key: "cancellations",
    title: "Cancellation Report",
    description: "Cancelled bookings with the penalty kept and the amount refunded.",
    group: "Bookings",
    filters: ["range", "hotel", "channel"],
    columns: [
      { key: "id", header: "Booking" },
      { key: "cancelledOn", header: "Cancelled", format: "date" },
      { key: "guest", header: "Guest" },
      { key: "hotel", header: "Hotel" },
      { key: "reason", header: "Reason" },
      { key: "gross", header: "Gross", format: "currency", align: "right" },
      { key: "penalty", header: "Penalty kept", format: "currency", align: "right" },
      { key: "refunded", header: "Refunded", format: "currency", align: "right" },
    ],
    run: selectCancellations,
  },
  payments: {
    key: "payments",
    title: "Payment Report",
    description: "Payments captured through the payment gateways.",
    group: "Finance",
    filters: ["range", "hotel", "method", "status"],
    columns: [
      { key: "date", header: "Date", format: "date" },
      { key: "booking", header: "Booking" },
      { key: "guest", header: "Guest" },
      { key: "method", header: "Gateway" },
      { key: "gatewayRef", header: "Reference" },
      { key: "status", header: "Status", format: "status" },
      { key: "amount", header: "Amount", format: "currency", align: "right" },
    ],
    run: selectPayments,
  },
  revenue: {
    key: "revenue",
    title: "Revenue Report",
    description: "Gross revenue, supplier cost, taxes and net margin by month.",
    group: "Finance",
    filters: ["range", "hotel"],
    columns: [
      { key: "month", header: "Month" },
      { key: "bookings", header: "Bookings", format: "number", align: "right" },
      { key: "gross", header: "Gross", format: "currency", align: "right" },
      { key: "supplierCost", header: "Supplier cost", format: "currency", align: "right" },
      { key: "taxesFees", header: "Taxes & fees", format: "currency", align: "right" },
      { key: "refunds", header: "Refunds", format: "currency", align: "right" },
      { key: "margin", header: "Net margin", format: "currency", align: "right" },
      { key: "marginPct", header: "Margin %", align: "right" },
    ],
    run: selectRevenue,
  },
  refunds: {
    key: "refunds",
    title: "Refund Report",
    description: "Refunds issued to guests, with reason, gateway and status.",
    group: "Finance",
    filters: ["range", "hotel", "method", "status"],
    columns: [
      { key: "date", header: "Date", format: "date" },
      { key: "booking", header: "Booking" },
      { key: "guest", header: "Guest" },
      { key: "method", header: "Gateway" },
      { key: "reason", header: "Reason" },
      { key: "gatewayRef", header: "Reference" },
      { key: "status", header: "Status", format: "status" },
      { key: "amount", header: "Amount", format: "currency", align: "right" },
    ],
    run: selectRefunds,
  },
};

export const reportList = Object.values(reportRegistry);

export function getBooking(id: string): ReportBooking | undefined {
  return reportBookings.find((b) => b.id === id);
}

// --- CSV export --------------------------------------------------------------

function csvCell(value: string | number | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(columns: ReportColumn[], rows: ReportRow[]): string {
  const head = columns.map((c) => csvCell(c.header)).join(",");
  const body = rows
    .map((r) => columns.map((c) => csvCell(r[c.key])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
