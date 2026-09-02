"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, FileText, MapPin, Moon, Star } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { propertyDetails } from "@/lib/property-detail-mock-data";

const statusStyle: Record<string, string> = {
  confirmed: "bg-rating text-white",
  completed: "bg-navy text-white",
  pending: "bg-gold text-navy-dark",
  cancelled: "bg-destructive text-white",
  no_show: "bg-destructive text-white",
};

function useDerived(b: BookingOut) {
  const cos = propertyDetails[b.property_id];
  return {
    href: `/account/trips/${b.id}`,
    image: b.room_image ?? cos?.heroImage ?? "",
    starRating: cos?.starRating ?? 0,
    rating: cos?.rating ?? null,
    ratingLabel: cos?.ratingLabel ?? "",
    reviews: cos?.reviews ?? 0,
    location: b.location ?? cos?.location ?? "",
    dates: `${format(new Date(b.check_in), "d MMM")} – ${format(new Date(b.check_out), "d MMM yyyy")}`,
    total: `${b.currency} ${Number(b.total_amount).toLocaleString()}`,
    payLabel: b.payment_timing === "pay_later" ? "Card held · free cancellation" : "Paid in full",
  };
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-bold capitalize shadow-sm ${
        statusStyle[status] ?? "bg-muted text-foreground"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function RatingChip({ rating, label, reviews }: { rating: number | null; label: string; reviews: number }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded bg-rating px-1.5 text-xs font-bold text-white">
        {rating.toFixed(1)}
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{reviews.toLocaleString()} reviews</p>
      </div>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} className="h-3 w-3 fill-gold text-gold" />
      ))}
    </span>
  );
}

export function BookingCard({
  booking: b,
  variant,
}: {
  booking: BookingOut;
  variant: "grid" | "list";
}) {
  const d = useDerived(b);

  if (variant === "grid") {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-lg">
        <Link href={d.href} className="relative block aspect-[4/3] w-full overflow-hidden">
          {d.image ? (
            <Image
              src={d.image}
              alt={b.property_name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-navy/5 text-navy">
              <CalendarDays className="h-8 w-8" />
            </span>
          )}
          <span className="absolute left-2 top-2 z-10">
            <StatusBadge status={b.status} />
          </span>
          <span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
            Ref {b.reference}
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <RatingChip rating={d.rating} label={d.ratingLabel} reviews={d.reviews} />
          <h3 className="line-clamp-1 font-heading text-base font-bold text-navy group-hover:underline">
            <Link href={d.href}>{b.property_name}</Link>
          </h3>
          <Stars n={d.starRating} />
          {d.location && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{d.location}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5 text-sm text-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-navy" />
            {d.dates}
            <span className="text-muted-foreground">
              · <Moon className="mb-0.5 inline h-3 w-3" /> {b.nights}
            </span>
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{b.room_name}</p>

          <div className="mt-auto border-t border-border pt-3">
            <p className="text-lg font-bold text-foreground">{d.total}</p>
            <p className="text-xs text-muted-foreground">
              Total · {b.nights} night{b.nights > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-3 transition-shadow hover:shadow-lg sm:flex-row sm:gap-5 sm:p-4">
      <Link
        href={d.href}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg sm:w-64"
      >
        {d.image ? (
          <Image
            src={d.image}
            alt={b.property_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="256px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-navy/5 text-navy">
            <CalendarDays className="h-7 w-7" />
          </span>
        )}
        <span className="absolute left-2 top-2 z-10">
          <StatusBadge status={b.status} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold text-navy group-hover:underline">
              <Link href={d.href}>{b.property_name}</Link>
            </h3>
            <div className="mt-1">
              <Stars n={d.starRating} />
            </div>
            {d.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{d.location}</span>
              </p>
            )}
          </div>
          <RatingChip rating={d.rating} label={d.ratingLabel} reviews={d.reviews} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-navy" />
            {d.dates}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Moon className="h-3.5 w-3.5" />
            {b.nights} night{b.nights > 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{b.room_name}</span>
        </div>

        <p className="text-xs text-muted-foreground">Ref {b.reference}</p>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
          <span className="flex items-center gap-1 text-xs font-medium text-rating">
            {d.payLabel}
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{d.total}</p>
              <p className="text-xs text-muted-foreground">
                Total · {b.nights} night{b.nights > 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href={d.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
            >
              <FileText className="h-3.5 w-3.5" />
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
