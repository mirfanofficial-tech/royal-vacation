export const invoiceCompany = {
  name: "Royal Vacation Travels LLC",
  addressLines: ["Office 401, Al Zarooni Building", "Sheikh Zayed Road, Dubai", "United Arab Emirates"],
  phone: "+971 4 123 4567",
  email: "support@royalvacation.ae",
  taxRegistrationNo: "100225344900003",
  supportHours: "Mon - Sun: 24/7",
};

export const paymentMethodLabels: Record<string, string> = {
  card: "Credit / Debit Card (Visa ending 4242)",
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  bank: "Bank Transfer",
};

/** Deterministic, hydration-safe pseudo-id generator (no Date.now()/Math.random()). */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function generateInvoiceNumber(seed: string): string {
  const num = hashString(`invoice-${seed}`) % 100000;
  return `INV-2026-${String(num).padStart(5, "0")}`;
}

export function generateBookingId(seed: string): string {
  const num = hashString(`booking-${seed}`) % 100000;
  return `RV-2026-${String(num).padStart(5, "0")}`;
}

export function generateTransactionId(seed: string, dateStamp: string): string {
  const num = hashString(`txn-${seed}`) % 100000;
  return `TXN-${dateStamp}-${String(num).padStart(5, "0")}`;
}
