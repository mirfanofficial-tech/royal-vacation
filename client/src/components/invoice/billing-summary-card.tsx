import { FileText } from "lucide-react";
import { format } from "date-fns";
import { extraOptions } from "@/lib/checkout-mock-data";

export function BillingSummaryCard({
  currency,
  roomName,
  roomPrice,
  checkIn,
  checkOut,
  nights,
  selectedExtraIds,
  promoCode,
}: {
  currency: string;
  roomName: string;
  roomPrice: number;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  selectedExtraIds: string[];
  promoCode: string;
}) {
  const selectedExtras = extraOptions.filter((extra) => selectedExtraIds.includes(extra.id));
  const nightsSubtotal = roomPrice * nights;
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  const taxesAndFees = Math.round((nightsSubtotal + extrasTotal) * 0.15);
  const serviceFee = 2750;
  const promoDiscount = 10000;
  const total = nightsSubtotal + extrasTotal + taxesAndFees + serviceFee - promoDiscount;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy">
        <FileText className="h-4 w-4" />
        Billing Summary
      </h2>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Description
        </span>
        <span className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price ({currency})
        </span>
        <span className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Amount ({currency})
        </span>

        <div className="col-span-3 border-t border-border" />

        <div>
          <p className="font-semibold text-foreground">Room Charge ({roomName})</p>
          <p className="text-xs text-muted-foreground">
            {format(checkIn, "d MMM yyyy")} &ndash; {format(checkOut, "d MMM yyyy")} ({nights} Nights)
          </p>
        </div>
        <span className="self-start text-right font-medium text-foreground">
          {roomPrice.toLocaleString()}
        </span>
        <span className="self-start text-right font-semibold text-foreground">
          {nightsSubtotal.toLocaleString()}
        </span>

        {selectedExtras.map((extra) => (
          <div key={extra.id} className="contents">
            <div>
              <p className="font-semibold text-foreground">{extra.title}</p>
              <p className="text-xs text-muted-foreground">{extra.description}</p>
            </div>
            <span className="self-start text-right font-medium text-foreground">
              {extra.price.toLocaleString()}
            </span>
            <span className="self-start text-right font-semibold text-foreground">
              {extra.price.toLocaleString()}
            </span>
          </div>
        ))}

        <div>
          <p className="font-semibold text-foreground">Taxes &amp; Fees</p>
          <p className="text-xs text-muted-foreground">Tourism Dirham Fee, Municipality Fee</p>
        </div>
        <span />
        <span className="self-start text-right font-semibold text-foreground">
          {taxesAndFees.toLocaleString()}
        </span>

        <p className="font-semibold text-foreground">Service Fee</p>
        <span />
        <span className="text-right font-semibold text-foreground">
          {serviceFee.toLocaleString()}
        </span>

        <div className="col-span-3 flex items-center justify-between rounded-lg bg-rating/10 px-3 py-2 text-rating">
          <span className="font-semibold">Promo Code ({promoCode})</span>
          <span className="font-semibold">- {promoDiscount.toLocaleString()}</span>
        </div>

        <div className="col-span-3 border-t border-border" />

        <p className="text-base font-semibold text-foreground">Total Amount</p>
        <span />
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            {currency} {total.toLocaleString()}
          </p>
          <p className="text-xs font-normal text-muted-foreground">Inclusive of all taxes</p>
        </div>
      </div>
    </div>
  );
}
