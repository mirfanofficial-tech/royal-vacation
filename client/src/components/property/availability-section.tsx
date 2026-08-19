"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Flame, Users, Minus, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RoomRateCard } from "@/components/property/room-rate-card";
import type { RoomOption } from "@/lib/property-detail-mock-data";

const roomTypeFilters: { id: RoomOption["roomType"]; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "studios", label: "Studios" },
  { id: "apartments", label: "Apartments" },
];

export function AvailabilitySection({
  rooms,
  currency,
  demandNote,
}: {
  rooms: RoomOption[];
  currency: string;
  demandNote: string;
}) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date(2026, 7, 11));
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(2026, 7, 12));
  const [adults, setAdults] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Set<RoomOption["roomType"]>>(new Set());

  const availableTypes = useMemo(
    () => new Set(rooms.map((room) => room.roomType)),
    [rooms]
  );

  const filteredRooms =
    activeFilters.size === 0 ? rooms : rooms.filter((room) => activeFilters.has(room.roomType));

  const toggleFilter = (type: RoomOption["roomType"]) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <section id="availability" className="scroll-mt-36">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-navy">Availability</h2>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          We Price Match
        </span>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        <Flame className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Property is in high demand</p>
          <p className="text-xs text-amber-700/80">{demandNote}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <DateRangePicker
            label="Select dates"
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            triggerClassName="flex-1 rounded-lg border border-border px-3 py-2"
            valueClassName="text-sm font-medium"
            formatter={(start, end) =>
              start
                ? end
                  ? `${format(start, "EEE, MMM d")} — ${format(end, "EEE, MMM d")}`
                  : format(start, "EEE, MMM d, yyyy")
                : "Add dates"
            }
          />

          <Popover>
            <PopoverTrigger className="flex flex-1 flex-col items-start gap-0.5 rounded-lg border border-border px-3 py-2 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Select occupancy
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Users className="h-3.5 w-3.5 text-navy" />
                {adults} adults &middot; {roomsCount} room{roomsCount > 1 ? "s" : ""}
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
                    onClick={() => setRoomsCount((v) => Math.max(1, v - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm">{roomsCount}</span>
                  <button
                    type="button"
                    onClick={() => setRoomsCount((v) => v + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button className="rounded-lg bg-navy text-white hover:bg-navy-light">
          <Search className="h-4 w-4" data-icon="inline-start" />
          Change search
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        {roomTypeFilters
          .filter((filter) => availableTypes.has(filter.id))
          .map((filter) => (
            <label key={filter.id} className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={activeFilters.has(filter.id)}
                onCheckedChange={() => toggleFilter(filter.id)}
              />
              {filter.label}
            </label>
          ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredRooms.map((room, index) => (
          <RoomRateCard
            key={room.id}
            room={room}
            currency={currency}
            defaultDetailsOpen={index === 0}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between">
        <div className="text-xs text-muted-foreground">
          <p>It only takes 2 minutes</p>
          <p>You won&apos;t be charged yet</p>
        </div>
        <Button className="rounded-lg bg-navy px-6 text-white hover:bg-navy-light">
          I&apos;ll reserve →
        </Button>
      </div>
    </section>
  );
}
