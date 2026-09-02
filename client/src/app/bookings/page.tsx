"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";

const statusStyle: Record<string, string> = {
  confirmed: "bg-rating/10 text-rating",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-navy/10 text-navy",
  no_show: "bg-destructive/10 text-destructive",
};

export default function MyBookingsPage() {
  const [rows, setRows] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    bookings
      .list()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 401
            ? "Sign in to see your bookings."
            : "We couldn't load your bookings.",
        );
        setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-navy">My bookings</h1>

        {rows === null && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {rows !== null && error && (
          <p className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            {error}{" "}
            <Link href="/login" className="font-semibold text-navy hover:underline">
              Sign in
            </Link>
          </p>
        )}

        {rows !== null && !error && rows.length === 0 && (
          <p className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            You have no bookings yet.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {rows?.map((b) => (
            <Link
              key={b.id}
              href={`/booking/${b.id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 hover:border-navy/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy">{b.property_name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(b.check_in), "d MMM")} –{" "}
                  {format(new Date(b.check_out), "d MMM yyyy")} · {b.reference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {b.currency} {Number(b.total_amount).toLocaleString()}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                    statusStyle[b.status] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {b.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
