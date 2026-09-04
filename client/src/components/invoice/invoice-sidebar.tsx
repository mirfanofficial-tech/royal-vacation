import Image from "next/image";
import Link from "next/link";
import { Building2, Bookmark, CheckCircle2, Headset, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoiceCompany } from "@/lib/invoice-mock-data";
import { extraOptions } from "@/lib/checkout-mock-data";

export function InvoiceSidebar({
  bookingId,
  bookedOn,
  currency,
  roomPrice,
  nights,
  selectedExtraIds,
}: {
  bookingId: string;
  bookedOn: string;
  currency: string;
  roomPrice: number;
  nights: number;
  selectedExtraIds: string[];
}) {
  const nightsSubtotal = roomPrice * nights;
  const extrasTotal = extraOptions
    .filter((extra) => selectedExtraIds.includes(extra.id))
    .reduce((sum, extra) => sum + extra.price, 0);
  const subtotal = nightsSubtotal + extrasTotal;
  const taxesAndFees = Math.round(subtotal * 0.15);
  const serviceFee = 2750;
  const promoDiscount = 10000;
  const total = subtotal + taxesAndFees + serviceFee - promoDiscount;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
          <Building2 className="h-4 w-4" />
          Invoice From
        </h2>
        <p className="font-semibold text-foreground">{invoiceCompany.name}</p>
        {invoiceCompany.addressLines.map((line) => (
          <p key={line} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
        <div className="mt-3 flex flex-col gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">Phone: </span>
            <span className="font-medium text-foreground">{invoiceCompany.phone}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            <Link href={`mailto:${invoiceCompany.email}`} className="font-medium text-gold hover:underline">
              {invoiceCompany.email}
            </Link>
          </p>
          <p>
            <span className="text-muted-foreground">Tax Registration No: </span>
            <span className="font-medium text-foreground">{invoiceCompany.taxRegistrationNo}</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
          <Bookmark className="h-4 w-4" />
          Booking Reference
        </h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Booking ID</dt>
            <dd className="font-semibold text-foreground">{bookingId}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Booked On</dt>
            <dd className="font-semibold text-foreground">{bookedOn}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Booked Through</dt>
            <dd className="font-semibold text-foreground">Website (royalvacation.com)</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-navy">Price Summary</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground">
              {currency} {subtotal.toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Taxes &amp; Fees</dt>
            <dd className="font-medium text-foreground">
              {currency} {taxesAndFees.toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Service Fee</dt>
            <dd className="font-medium text-foreground">
              {currency} {serviceFee.toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between text-rating">
            <dt>Discount (ROYAL10)</dt>
            <dd className="font-medium">- {currency} {promoDiscount.toLocaleString()}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-base font-semibold text-foreground">Total Amount</p>
            <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {currency} {total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-rating/10 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rating" />
        <div>
          <p className="text-sm font-semibold text-rating">Paid</p>
          <p className="text-xs text-rating/80">
            This invoice has been paid in full. No outstanding balance.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-navy">
          <Headset className="h-4 w-4" />
          Need Help?
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          If you have any questions about this invoice, please contact our support team.
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <span className="flex items-center gap-2 text-foreground">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {invoiceCompany.phone}
          </span>
          <span className="flex items-center gap-2 text-foreground">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {invoiceCompany.email}
          </span>
          <span className="flex items-center gap-2 text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {invoiceCompany.supportHours}
          </span>
        </div>
      </div>
    </div>
  );
}
