"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Users, Minus, Plus, BadgeCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "@/components/shared/date-range-picker";

export function CheckAvailabilityCard({ demandNote }: { demandNote: string }) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date(2026, 5, 10));
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(2026, 5, 14));
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  return (
    <div id="availability" className="scroll-mt-36 rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy">Check availability</h3>

      <div className="grid grid-cols-1 gap-2">
        <DateRangePicker
          label="Dates"
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
          triggerClassName="rounded-lg border border-border px-3 py-2"
          valueClassName="text-xs"
          formatter={(start, end) =>
            start
              ? end
                ? `${format(start, "EEE, MMM d")} \u2013 ${format(end, "EEE, MMM d, yyyy")}`
                : format(start, "EEE, MMM d, yyyy")
              : "Add dates"
          }
        />
      </div>

      <Popover>
        <PopoverTrigger className="mt-2 flex w-full flex-col items-start gap-1 rounded-lg border border-border px-3 py-2 text-left">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Users className="h-3.5 w-3.5 text-navy" />
            Guests &amp; Rooms
          </span>
          <span className="text-xs text-muted-foreground">
            {adults} adults &middot; {rooms} room{rooms > 1 ? "s" : ""}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Adults</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults((v) => Math.max(1, v - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults((v) => v + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rooms</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRooms((v) => Math.max(1, v - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm">{rooms}</span>
              <button
                type="button"
                onClick={() => setRooms((v) => v + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button className="mt-3 w-full rounded-lg bg-gold text-navy-dark hover:bg-gold-light">
        Check availability
      </Button>

      <div className="mt-3 flex items-start gap-2 rounded-lg bg-rating/10 p-2.5 text-xs text-rating">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">No booking fees</p>
          <p className="text-rating/80">You&apos;ll pay the property in their local currency</p>
        </div>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
        <Flame className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Property is in high demand!</p>
          <p className="text-amber-700/80">{demandNote}</p>
        </div>
      </div>
    </div>
  );
}
