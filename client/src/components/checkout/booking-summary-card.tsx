import Image from "next/image";
import { format } from "date-fns";
import {
  Star,
  MapPin,
  Info,
  Tag,
  ShieldCheck,
  RotateCcw,
  Lock as LockIcon,
  Headset,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeTotals, type BookingTotals } from "@/lib/booking-pricing";

const trustBadges = [
  { id: "cancellation", icon: RotateCcw, title: "Free Cancellation", description: "Up to 24 hours before check-in" },
  { id: "secure", icon: LockIcon, title: "Secure Payment", description: "Encrypted & safe" },
  { id: "support", icon: Headset, title: "24/7 Support", description: "We are here to help" },
];

export function BookingSummaryCard({
  propertyName,
  propertyImage,
  starRating,
  rating,
  ratingLabel,
  reviews,
  location,
  currency,
  checkIn,
  checkOut,
  adults,
  rooms,
  nights,
  roomPrice,
  selectedExtraIds,
  promoCode = null,
  totals: totalsProp,
  onConfirm,
  confirmDisabled,
  confirmLabel = "Review & Confirm Booking",
  confirmHint = "Please complete the guest information above to continue.",
}: {
  propertyName: string;
  propertyImage: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  currency: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  rooms: number;
  nights: number;
  roomPrice: number;
  selectedExtraIds: string[];
  promoCode?: string | null;
  /** Server-authoritative totals once the booking is created; falls back to a local estimate. */
  totals?: BookingTotals;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmHint?: string;
}) {
  const totals =
    totalsProp ?? computeTotals({ roomPrice, nights, selectedExtraIds, promoCode });
  const {
    nightsSubtotal,
    extrasTotal,
    taxesAndFees,
    serviceFee,
    promoDiscount,
    total,
  } = totals;

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-white p-5">
      <div>
        <div className="flex gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <Image src={propertyImage} alt={propertyName} fill className="object-cover" sizes="80px" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-bold text-navy">{propertyName}</h3>
            <span className="mt-0.5 flex items-center gap-0.5">
              {Array.from({ length: starRating }, (_, i) => (
                <Star key={i} className="h-3 w-3 fill-gold text-gold" />
              ))}
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="flex h-5 min-w-5 items-center justify-center rounded bg-navy px-1 text-[11px] font-bold text-white">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-foreground">{ratingLabel}</span>
              <span className="text-[11px] text-muted-foreground">
                {reviews.toLocaleString()} reviews
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
        <div>
          <p className="text-muted-foreground">Check-in</p>
          <p className="font-semibold text-foreground">{format(checkIn, "EEE, d MMM yyyy")}</p>
          <p className="text-muted-foreground">3:00 PM</p>
        </div>
        <div>
          <p className="text-muted-foreground">Check-out</p>
          <p className="font-semibold text-foreground">{format(checkOut, "EEE, d MMM yyyy")}</p>
          <p className="text-muted-foreground">12:00 PM</p>
        </div>
        <div>
          <p className="text-muted-foreground">Guests &amp; Rooms</p>
          <p className="font-semibold text-foreground">
            {adults} Adult{adults > 1 ? "s" : ""}, {rooms} Room{rooms > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{nights} Night{nights > 1 ? "s" : ""} Stay</span>
          <span className="font-medium text-foreground">
            {currency} {nightsSubtotal.toLocaleString()}
          </span>
        </div>
        {extrasTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Extras</span>
            <span className="font-medium text-foreground">
              {currency} {extrasTotal.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground">
            Taxes &amp; Fees
            <Info className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">
            {currency} {taxesAndFees.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground">
            Service Fee
            <Info className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">
            {currency} {serviceFee.toLocaleString()}
          </span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-rating/10 px-3 py-2 text-rating">
            <span className="flex items-center gap-1.5 font-semibold">
              <Tag className="h-3.5 w-3.5" />
              Promo Code Applied
            </span>
            <span className="font-semibold">- {currency} {promoDiscount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">Total Amount</span>
          <span className="text-xl font-bold text-foreground">
            {currency} {total.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-rating/10 p-3 text-rating">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Best Price Guarantee</p>
          <p className="text-xs text-rating/80">Found a better price? We&apos;ll match it.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
        {trustBadges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-start gap-1.5">
            <badge.icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">{badge.title}</p>
            <p className="text-[11px] text-muted-foreground">{badge.description}</p>
          </div>
        ))}
      </div>

      {onConfirm && (
        <>
          <Button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="w-full gap-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-light disabled:opacity-60"
          >
            {confirmLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
          {confirmDisabled && (
            <p className="-mt-3 text-center text-xs text-destructive">{confirmHint}</p>
          )}
        </>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <LockIcon className="h-3.5 w-3.5" />
        Your payment information is secure and encrypted
      </p>
    </div>
  );
}
