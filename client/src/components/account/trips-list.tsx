"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarDays, Loader2, MapPin, Moon, Users, XCircle } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";
import { CancelBookingModal } from "@/components/bookings/cancel-booking-modal";
import { propertyDetails } from "@/lib/property-detail-mock-data";

type FilterKey = "all" | "upcoming" | "completed" | "cancelled";
type SortKey = "recent" | "checkin" | "amount";

const statusPill: Record<string, string> = {
  confirmed: "bg-rating text-white",
  completed: "bg-navy text-white",
  pending: "bg-amber-500 text-white",
  cancelled: "bg-destructive text-white",
  no_show: "bg-destructive text-white",
};
const CANCELLABLE = new Set(["pending", "confirmed"]);

function money(currency: string, n: number) {
  return `${currency} ${n.toLocaleString()}`;
}

function TripRow({ b, onCancel }: { b: BookingOut; onCancel: (b: BookingOut) => void }) {
  const cos = propertyDetails[b.property_id];
  const image = b.room_image ?? cos?.heroImage ?? "";
  const location = b.location ?? cos?.location ?? "";
  const href = `/account/trips/${b.id}`;
  const dates = `${format(new Date(b.check_in), "d MMM")} – ${format(
    new Date(b.check_out),
    "d MMM yyyy",
  )}`;

  return (
    <li className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-6">
      {/* Property */}
      <div className="flex shrink-0 gap-3 sm:w-48 sm:flex-col sm:gap-2.5">
        <Link
          href={href}
          className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg sm:w-full"
        >
          {image ? (
            <Image src={image} alt={b.property_name} fill className="object-cover" sizes="192px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-navy/5 text-navy">
              <CalendarDays className="h-6 w-6" />
            </span>
          )}
        </Link>
        <div className="min-w-0">
          <Link
            href={href}
            className="line-clamp-2 font-heading text-sm font-bold text-navy hover:underline"
          >
            {b.property_name}
          </Link>
          {location && (
            <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">Ref {b.reference}</p>
        </div>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold capitalize ${
              statusPill[b.status] ?? "bg-muted text-foreground"
            }`}
          >
            {b.status.replace(/_/g, " ")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            Booked {format(new Date(b.created_at), "d MMMM yyyy")}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-navy" />
            {dates}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Moon className="h-3.5 w-3.5" />
            {b.nights} night{b.nights > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""} · {b.rooms} room
            {b.rooms > 1 ? "s" : ""}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">{b.room_name}</p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="text-lg font-bold text-foreground">
              {money(b.currency, Number(b.total_amount))}
            </p>
            <p className="text-xs text-muted-foreground">
              Total · {b.payment_timing === "pay_later" ? "card held" : "paid"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {CANCELLABLE.has(b.status) && (
              <button
                type="button"
                onClick={() => onCancel(b)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}
            <Link
              href={href}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export function TripsList() {
  const [rows, setRows] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [cancelTarget, setCancelTarget] = useState<BookingOut | null>(null);

  useEffect(() => {
    bookings
      .list()
      .then(setRows)
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 401
            ? "Sign in to see your trips."
            : "We couldn't load your trips.",
        );
        setRows([]);
      });
  }, []);

  const stats = useMemo(() => {
    const list = rows ?? [];
    const upcoming = list.filter((b) => b.status === "confirmed" || b.status === "pending").length;
    const completed = list.filter((b) => b.status === "completed").length;
    const spent = list
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + Number(b.total_amount || 0), 0);
    return { total: list.length, upcoming, completed, spent, currency: list[0]?.currency ?? "AED" };
  }, [rows]);

  const visible = useMemo(() => {
    let list = [...(rows ?? [])];
    if (filter === "upcoming")
      list = list.filter((b) => b.status === "confirmed" || b.status === "pending");
    else if (filter === "completed") list = list.filter((b) => b.status === "completed");
    else if (filter === "cancelled") list = list.filter((b) => b.status === "cancelled");

    if (sort === "amount") list.sort((a, b) => Number(b.total_amount) - Number(a.total_amount));
    else if (sort === "checkin")
      list.sort((a, b) => +new Date(a.check_in) - +new Date(b.check_in));
    else list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return list;
  }, [rows, filter, sort]);

  if (rows === null) {
    return (
      <div className="flex justify-center rounded-2xl border border-border bg-white py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
          <CalendarDays className="h-7 w-7" />
        </span>
        <h3 className="mt-3 font-heading text-lg font-bold text-navy">
          {error ? "Nothing to show" : "No trips booked yet"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error || "Once you book a stay it will appear here with all its details."}
        </p>
        <Link
          href="/search"
          className="mt-5 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Start planning a trip
        </Link>
      </div>
    );
  }

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `All trips · ${stats.total}` },
    { key: "upcoming", label: `Upcoming · ${stats.upcoming}` },
    { key: "completed", label: `Completed · ${stats.completed}` },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      {/* Summary bar */}
      <div className="border-b border-border bg-muted/40 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-navy text-2xl font-bold text-white">
              {stats.total}
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-navy">Your trips</p>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed · {stats.upcoming} upcoming
              </p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-4 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            {[
              { label: "Upcoming", value: String(stats.upcoming) },
              { label: "Completed", value: String(stats.completed) },
              { label: "Total spent", value: money(stats.currency, stats.spent) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 font-bold text-navy">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter / sort bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "border-navy bg-navy text-white"
                  : "border-border text-foreground hover:border-navy hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none focus-visible:border-navy"
          >
            <option value="recent">Most recent</option>
            <option value="checkin">Check-in date</option>
            <option value="amount">Amount</option>
          </select>
        </label>
      </div>

      {/* List */}
      <div className="px-5 sm:px-6">
        {visible.length > 0 ? (
          <ul className="divide-y divide-border">
            {visible.map((b) => (
              <TripRow key={b.id} b={b} onCancel={setCancelTarget} />
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No trips match this filter.
          </div>
        )}
      </div>

      <CancelBookingModal
        booking={cancelTarget!}
        token={undefined}
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onCancelled={(result) => {
          setRows((prev) =>
            prev ? prev.map((r) => (r.id === result.booking.id ? result.booking : r)) : prev,
          );
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
