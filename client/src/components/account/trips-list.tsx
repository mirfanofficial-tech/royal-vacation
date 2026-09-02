"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, LayoutGrid, List, Loader2 } from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError, bookings } from "@/lib/api";
import { BookingCard } from "@/components/account/booking-card";

const VIEW_KEY = "rv:trips-view";

export function TripsList() {
  const [rows, setRows] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "grid" || v === "list") setView(v);
    } catch {
      /* ignore */
    }
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

  function pick(next: "grid" | "list") {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  }

  if (rows === null) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} booking{rows.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => pick("list")}
            className={`rounded-md p-1.5 transition-colors ${
              view === "list" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => pick("grid")}
            className={`rounded-md p-1.5 transition-colors ${
              view === "grid" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((b) => (
            <BookingCard key={b.id} booking={b} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((b) => (
            <BookingCard key={b.id} booking={b} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
