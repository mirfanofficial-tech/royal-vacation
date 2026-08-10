export type ReportGranularity = "monthly" | "weekly" | "daily";
export type FinanceTxnStatus = "paid" | "pending" | "refunded";

export interface ReportSeriesPoint {
  label: string;
  value: number;
}

export interface ReportRange {
  id: string;
  label: string;
  revenue: number;
  bookings: number;
  refunds: number;
  adr: number;
  deltaRevenue: number;
  deltaBookings: number;
  deltaRefunds: number;
  series: ReportSeriesPoint[];
}

const dailyJulyToAug: number[] = [
  16500, 17400, 15800, 18200, 19900, 21400, 22300, 20800, 19600, 23100, 24200,
  22800, 21400, 20500, 23800, 25600, 24700, 26100, 27300, 28800, 27600, 25400,
  26900, 28300, 29100, 27800, 26200, 30100, 31500, 27600,
];

function makeDailySeries(): ReportSeriesPoint[] {
  const start = new Date("2026-07-09T00:00:00Z");
  return dailyJulyToAug.map((value, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return { label: d.toISOString().slice(5, 10), value };
  });
}

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const monthlyValues = [148200, 165400, 187900, 172300, 201850, 228600, 254300, 198750];
const monthlyBookings = [42, 48, 56, 50, 61, 68, 77, 59];

export const financeRanges: ReportRange[] = [
  {
    id: "this-year",
    label: "This year",
    revenue: 1557300,
    bookings: 461,
    refunds: 38100,
    adr: 1642,
    deltaRevenue: 12.4,
    deltaBookings: 9.2,
    deltaRefunds: -4.6,
    series: monthLabels.map((label, i) => ({
      label,
      value: monthlyValues[i],
    })),
  },
  {
    id: "this-quarter",
    label: "This quarter",
    revenue: 681650,
    bookings: 204,
    refunds: 14200,
    adr: 1718,
    deltaRevenue: 8.7,
    deltaBookings: 6.1,
    deltaRefunds: -2.9,
    series: [
      { label: "Jun", value: 228600 },
      { label: "Jul", value: 254300 },
      { label: "Aug", value: 198750 },
    ],
  },
  {
    id: "last-30-days",
    label: "Last 30 days",
    revenue: 724650,
    bookings: 217,
    refunds: 14180,
    adr: 1691,
    deltaRevenue: 9.4,
    deltaBookings: 7.8,
    deltaRefunds: -3.2,
    series: makeDailySeries(),
  },
  {
    id: "this-month",
    label: "This month",
    revenue: 198750,
    bookings: 59,
    refunds: 4810,
    adr: 1746,
    deltaRevenue: 11.2,
    deltaBookings: 8.4,
    deltaRefunds: -5.1,
    series: [
      { label: "08/01", value: 18400 },
      { label: "08/02", value: 21600 },
      { label: "08/03", value: 24750 },
      { label: "08/04", value: 22900 },
      { label: "08/05", value: 28300 },
      { label: "08/06", value: 31500 },
      { label: "08/07", value: 27600 },
    ],
  },
];

export const financeMonthlyBookings = monthLabels.map((label, i) => ({
  label,
  value: monthlyBookings[i],
}));

export interface FinanceChannel {
  name: string;
  color: string;
  share: number;
  amount: number;
}

export const financeChannels: FinanceChannel[] = [
  { name: "Direct website", color: "#14284b", share: 38, amount: 591774 },
  { name: "Booking.com", color: "#1f3a63", share: 27, amount: 420471 },
  { name: "Airbnb", color: "#c9973c", share: 16, amount: 249168 },
  { name: "Partner modules", color: "#1b6e4b", share: 10, amount: 155730 },
  { name: "Expedia", color: "#e6c878", share: 9, amount: 140157 },
];

export interface FinancePaymentMethod {
  name: string;
  color: string;
  share: number;
  amount: number;
  count: number;
}

export const financePaymentMethods: FinancePaymentMethod[] = [
  { name: "Checkout.com", color: "#14284b", share: 44, amount: 685212, count: 236 },
  { name: "Stripe", color: "#1f3a63", share: 26, amount: 404898, count: 158 },
  { name: "Tap", color: "#c9973c", share: 12, amount: 186876, count: 71 },
  { name: "PayPal", color: "#1b6e4b", share: 9, amount: 140157, count: 52 },
  { name: "mada", color: "#e6c878", share: 6, amount: 93438, count: 38 },
  { name: "Cash", color: "#94a3b8", share: 3, amount: 46719, count: 21 },
];

export interface FinancePropertyRow {
  name: string;
  location: string;
  bookings: number;
  revenue: number;
  share: number;
}

export const financePropertyRows: FinancePropertyRow[] = [
  { name: "The Palm Villa Retreat", location: "Palm Jumeirah, Dubai", bookings: 64, revenue: 268800, share: 17.3 },
  { name: "Marina Yacht Penthouse", location: "Dubai Marina, Dubai", bookings: 37, revenue: 251600, share: 16.2 },
  { name: "Downtown Executive Suite", location: "Downtown Dubai", bookings: 210, revenue: 205800, share: 13.2 },
  { name: "Grand Marina Residence", location: "Dubai Marina, Dubai", bookings: 128, revenue: 185600, share: 11.9 },
  { name: "Corniche Beachfront Studio", location: "Abu Dhabi Corniche", bookings: 92, revenue: 69920, share: 4.5 },
];

export interface FinanceTaxFee {
  label: string;
  amount: number;
  note: string;
}

export const financeTaxFees: FinanceTaxFee[] = [
  { label: "VAT 5% collected", amount: 9940, note: "Payable to FTA by the 28th" },
  { label: "Service fees", amount: 11260, note: "Booking & concierge handling" },
  { label: "Cleaning fees", amount: 6850, note: "Post-stay turnover" },
  { label: "Partner commissions", amount: 14520, note: "Owed to module providers" },
];

export interface FinanceGatewayBalance {
  name: string;
  balance: number;
  pending: number;
}

export const financeGatewayBalances: FinanceGatewayBalance[] = [
  { name: "Checkout.com", balance: 94250, pending: 18400 },
  { name: "Stripe", balance: 61200, pending: 9700 },
  { name: "Tap", balance: 21480, pending: 0 },
  { name: "PayPal", balance: 12350, pending: 2600 },
];

export interface FinanceTransaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  method: string;
  channel: string;
  status: FinanceTxnStatus;
  amount: number;
}

export const financeTransactions: FinanceTransaction[] = [
  { id: "txn_01", date: "2026-08-07", reference: "TXN-8142", description: "Emily Carter · Grand Marina Residence", method: "Checkout.com", channel: "Direct", status: "paid", amount: 5800 },
  { id: "txn_02", date: "2026-08-07", reference: "TXN-8141", description: "Lucas Moreau · Grand Marina Residence", method: "Stripe", channel: "Direct", status: "paid", amount: 5800 },
  { id: "txn_03", date: "2026-08-06", reference: "TXN-8140", description: "Sofia Almeida · Downtown Executive Suite", method: "Checkout.com", channel: "Booking.com", status: "paid", amount: 2940 },
  { id: "txn_04", date: "2026-08-05", reference: "TXN-8139", description: "Daniel Kim · Marina Yacht Penthouse", method: "Tap", channel: "Direct", status: "pending", amount: 27200 },
  { id: "txn_05", date: "2026-08-04", reference: "TXN-8138", description: "James Osei · The Palm Villa Retreat", method: "Checkout.com", channel: "Direct", status: "paid", amount: 29400 },
  { id: "txn_06", date: "2026-08-03", reference: "TXN-8137", description: "Priya Sharma · Corniche Beachfront Studio", method: "PayPal", channel: "Booking.com", status: "refunded", amount: 3800 },
  { id: "txn_07", date: "2026-08-02", reference: "TXN-8136", description: "Ferry · Dubai to Musandam · 2 pax", method: "mada", channel: "Module", status: "paid", amount: 640 },
  { id: "txn_08", date: "2026-08-01", reference: "TXN-8135", description: "Flight · DXB to AMS · 1 pax", method: "Stripe", channel: "Module", status: "paid", amount: 2150 },
  { id: "txn_09", date: "2026-07-31", reference: "TXN-8134", description: "Aisha Khan · Downtown Executive Suite", method: "Checkout.com", channel: "Direct", status: "paid", amount: 2940 },
  { id: "txn_10", date: "2026-07-30", reference: "TXN-8133", description: "Mohammed Al-Rashid · The Palm Villa Retreat", method: "Checkout.com", channel: "Airbnb", status: "paid", amount: 12600 },
  { id: "txn_11", date: "2026-07-29", reference: "TXN-8132", description: "Elena Petrova · Grand Marina Residence", method: "Stripe", channel: "Booking.com", status: "paid", amount: 5800 },
  { id: "txn_12", date: "2026-07-28", reference: "TXN-8131", description: "Wei Zhang · Marina Yacht Penthouse", method: "Tap", channel: "Direct", status: "paid", amount: 20400 },
];

export const formatAED = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
