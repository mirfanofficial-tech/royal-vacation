export type PaymentTxnStatus = "paid" | "pending" | "failed" | "refunded";

export type PaymentMethod =
  | "Visa •••• 4242"
  | "Mastercard •••• 8871"
  | "Amex •••• 3109"
  | "Apple Pay"
  | "Bank transfer"
  | "Cash at property";

export interface PaymentTransaction {
  id: string;
  bookingRef: string;
  guest: string;
  guestEmail: string;
  property: string;
  channel: string;
  method: PaymentMethod;
  amount: number;
  fee: number;
  status: PaymentTxnStatus;
  date: string;
}

export type InvoiceStatus = "paid" | "sent" | "draft" | "overdue";

export interface PaymentInvoice {
  id: string;
  number: string;
  guest: string;
  property: string;
  bookingRef: string;
  issuedAt: string;
  dueDate: string;
  total: number;
  tax: number;
  status: InvoiceStatus;
}

export type RefundStatus = "completed" | "processing" | "pending";

export interface PaymentRefund {
  id: string;
  bookingRef: string;
  guest: string;
  property: string;
  reason: string;
  amount: number;
  original: number;
  status: RefundStatus;
  initiatedBy: string;
  date: string;
}

export const paymentTransactions: PaymentTransaction[] = [
  {
    id: "txn_1001",
    bookingRef: "RV-88421",
    guest: "Sara Al Mansouri",
    guestEmail: "sara.am@example.com",
    property: "Raffles Dubai",
    channel: "Website",
    method: "Visa •••• 4242",
    amount: 6840,
    fee: 410,
    status: "paid",
    date: "2026-08-07",
  },
  {
    id: "txn_1002",
    bookingRef: "RV-88420",
    guest: "James Whitmore",
    guestEmail: "j.whitmore@example.com",
    property: "Atlantis The Palm",
    channel: "Amadeus",
    method: "Mastercard •••• 8871",
    amount: 9125,
    fee: 548,
    status: "paid",
    date: "2026-08-07",
  },
  {
    id: "txn_1003",
    bookingRef: "RV-88418",
    guest: "Mariam Khalid",
    guestEmail: "mariam.k@example.com",
    property: "Palazzo Versace",
    channel: "Website",
    method: "Apple Pay",
    amount: 5230,
    fee: 209,
    status: "pending",
    date: "2026-08-06",
  },
  {
    id: "txn_1004",
    bookingRef: "RV-88415",
    guest: "Lucas Meyer",
    guestEmail: "l.meyer@example.com",
    property: "Jumeirah Al Qasr",
    channel: "Expedia",
    method: "Amex •••• 3109",
    amount: 7490,
    fee: 450,
    status: "paid",
    date: "2026-08-06",
  },
  {
    id: "txn_1005",
    bookingRef: "RV-88410",
    guest: "Aisha Rahman",
    guestEmail: "a.rahman@example.com",
    property: "Anantara The Palm",
    channel: "Website",
    method: "Visa •••• 4242",
    amount: 4150,
    fee: 249,
    status: "refunded",
    date: "2026-08-05",
  },
  {
    id: "txn_1006",
    bookingRef: "RV-88408",
    guest: "Daniel Osei",
    guestEmail: "d.osei@example.com",
    property: "St. Regis Dubai",
    channel: "Amadeus",
    method: "Bank transfer",
    amount: 12800,
    fee: 0,
    status: "paid",
    date: "2026-08-05",
  },
  {
    id: "txn_1007",
    bookingRef: "RV-88402",
    guest: "Elena Petrova",
    guestEmail: "e.petrova@example.com",
    property: "Address Boulevard",
    channel: "Booking.com",
    method: "Mastercard •••• 8871",
    amount: 3660,
    fee: 220,
    status: "failed",
    date: "2026-08-04",
  },
  {
    id: "txn_1008",
    bookingRef: "RV-88396",
    guest: "Omar Haddad",
    guestEmail: "o.haddad@example.com",
    property: "Raffles Dubai",
    channel: "Website",
    method: "Cash at property",
    amount: 2980,
    fee: 0,
    status: "paid",
    date: "2026-08-04",
  },
  {
    id: "txn_1009",
    bookingRef: "RV-88390",
    guest: "Charlotte Dubois",
    guestEmail: "c.dubois@example.com",
    property: "Atlantis The Palm",
    channel: "Expedia",
    method: "Amex •••• 3109",
    amount: 8610,
    fee: 517,
    status: "paid",
    date: "2026-08-03",
  },
  {
    id: "txn_1010",
    bookingRef: "RV-88384",
    guest: "Vikram Mehta",
    guestEmail: "v.mehta@example.com",
    property: "Palazzo Versace",
    channel: "Booking.com",
    method: "Visa •••• 4242",
    amount: 4720,
    fee: 283,
    status: "pending",
    date: "2026-08-03",
  },
  {
    id: "txn_1011",
    bookingRef: "RV-88378",
    guest: "Fatima Noor",
    guestEmail: "f.noor@example.com",
    property: "Jumeirah Al Qasr",
    channel: "Website",
    method: "Apple Pay",
    amount: 5500,
    fee: 220,
    status: "paid",
    date: "2026-08-02",
  },
  {
    id: "txn_1012",
    bookingRef: "RV-88371",
    guest: "Tomás Ferreira",
    guestEmail: "t.ferreira@example.com",
    property: "Anantara The Palm",
    channel: "Amadeus",
    method: "Mastercard •••• 8871",
    amount: 3170,
    fee: 190,
    status: "refunded",
    date: "2026-08-02",
  },
];

export const paymentInvoices: PaymentInvoice[] = [
  {
    id: "inv_1",
    number: "INV-2026-0412",
    guest: "Sara Al Mansouri",
    property: "Raffles Dubai",
    bookingRef: "RV-88421",
    issuedAt: "2026-08-07",
    dueDate: "2026-08-21",
    total: 6840,
    tax: 342,
    status: "paid",
  },
  {
    id: "inv_2",
    number: "INV-2026-0411",
    guest: "James Whitmore",
    property: "Atlantis The Palm",
    bookingRef: "RV-88420",
    issuedAt: "2026-08-06",
    dueDate: "2026-08-20",
    total: 9125,
    tax: 456,
    status: "sent",
  },
  {
    id: "inv_3",
    number: "INV-2026-0410",
    guest: "Lucas Meyer",
    property: "Jumeirah Al Qasr",
    bookingRef: "RV-88415",
    issuedAt: "2026-08-05",
    dueDate: "2026-08-19",
    total: 7490,
    tax: 375,
    status: "overdue",
  },
  {
    id: "inv_4",
    number: "INV-2026-0409",
    guest: "Daniel Osei",
    property: "St. Regis Dubai",
    bookingRef: "RV-88408",
    issuedAt: "2026-08-04",
    dueDate: "2026-08-18",
    total: 12800,
    tax: 640,
    status: "paid",
  },
  {
    id: "inv_5",
    number: "INV-2026-0408",
    guest: "Charlotte Dubois",
    property: "Atlantis The Palm",
    bookingRef: "RV-88390",
    issuedAt: "2026-08-02",
    dueDate: "2026-08-16",
    total: 8610,
    tax: 431,
    status: "paid",
  },
  {
    id: "inv_6",
    number: "INV-2026-0407",
    guest: "Vikram Mehta",
    property: "Palazzo Versace",
    bookingRef: "RV-88384",
    issuedAt: "2026-08-01",
    dueDate: "2026-08-15",
    total: 4720,
    tax: 236,
    status: "draft",
  },
  {
    id: "inv_7",
    number: "INV-2026-0406",
    guest: "Fatima Noor",
    property: "Jumeirah Al Qasr",
    bookingRef: "RV-88378",
    issuedAt: "2026-07-30",
    dueDate: "2026-08-13",
    total: 5500,
    tax: 275,
    status: "paid",
  },
  {
    id: "inv_8",
    number: "INV-2026-0405",
    guest: "Elena Petrova",
    property: "Address Boulevard",
    bookingRef: "RV-88402",
    issuedAt: "2026-07-29",
    dueDate: "2026-08-12",
    total: 3660,
    tax: 183,
    status: "sent",
  },
];

export const paymentRefunds: PaymentRefund[] = [
  {
    id: "ref_1",
    bookingRef: "RV-88410",
    guest: "Aisha Rahman",
    property: "Anantara The Palm",
    reason: "Guest cancelled 48h before check-in · policy 50%",
    amount: 2075,
    original: 4150,
    status: "completed",
    initiatedBy: "admin@royalvacation.com",
    date: "2026-08-05",
  },
  {
    id: "ref_2",
    bookingRef: "RV-88371",
    guest: "Tomás Ferreira",
    property: "Anantara The Palm",
    reason: "Duplicate payment charged on card",
    amount: 3170,
    original: 3170,
    status: "completed",
    initiatedBy: "support@royalvacation.com",
    date: "2026-08-03",
  },
  {
    id: "ref_3",
    bookingRef: "RV-88354",
    guest: "Nadia Saleh",
    property: "Address Boulevard",
    reason: "Property overbooked · relocated by hotel",
    amount: 4880,
    original: 4880,
    status: "processing",
    initiatedBy: "admin@royalvacation.com",
    date: "2026-08-06",
  },
  {
    id: "ref_4",
    bookingRef: "RV-88347",
    guest: "Henrik Larsen",
    property: "St. Regis Dubai",
    reason: "Air conditioning fault reported · compensation",
    amount: 1240,
    original: 6210,
    status: "pending",
    initiatedBy: "support@royalvacation.com",
    date: "2026-08-04",
  },
  {
    id: "ref_5",
    bookingRef: "RV-88339",
    guest: "Lina Chen",
    property: "Palazzo Versace",
    reason: "Guest cancelled 24h before check-in · policy 100%",
    amount: 5320,
    original: 5320,
    status: "completed",
    initiatedBy: "admin@royalvacation.com",
    date: "2026-08-01",
  },
  {
    id: "ref_6",
    bookingRef: "RV-88325",
    guest: "Priya Nair",
    property: "Atlantis The Palm",
    reason: "Chargeback dispute won by guest",
    amount: 7400,
    original: 7400,
    status: "processing",
    initiatedBy: "finance@royalvacation.com",
    date: "2026-07-30",
  },
];

export const paymentKpis = {
  processedVolume: 76485,
  processedCount: 12,
  successRate: 91.7,
  gatewayFees: 3292,
  outstandingInvoices: 15360,
};

export function formatAED(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}
