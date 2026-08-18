"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, Search, Loader2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/shared/date-range-picker";

export function SearchResultsBar({
  defaultDestination = "Dubai, United Arab Emirates",
  defaultCheckIn,
  defaultCheckOut,
  defaultAdults = 2,
  defaultRooms = 1,
}: {
  defaultDestination?: string;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
  defaultAdults?: number;
  defaultRooms?: number;
}) {
  const [destination, setDestination] = useState(defaultDestination);
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    defaultCheckIn ?? new Date(2026, 0, 20)
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    defaultCheckOut ?? new Date(2026, 0, 23)
  );
  const [adults, setAdults] = useState(defaultAdults);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(defaultRooms);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("adults", String(adults));
    params.set("rooms", String(rooms));

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-[1400px] px-10 py-4 lg:px-24">
        <div className="grid w-full grid-cols-1 gap-3 rounded-2xl p-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:gap-0 md:rounded-full md:p-2">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex flex-1 flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <MapPin className="h-3.5 w-3.5 text-gold-light" />
                Destination
              </label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search for destination, property or city"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
              />
            </div>
            {destination && (
              <button
                type="button"
                aria-label="Clear destination"
                onClick={() => setDestination("")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <DateRangePicker
            label="Check-in / Check-out"
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            triggerClassName="border-l border-white/20 px-4 py-2"
            labelClassName="text-white"
            valueClassName="text-white/80"
            numberOfMonths={2}
          />

          <Popover>
            <PopoverTrigger className="flex flex-col items-start gap-1 border-l border-white/20 px-4 py-2 text-left">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Users className="h-3.5 w-3.5 text-gold-light" />
                Guests &amp; Rooms
              </span>
              <span className="text-sm text-white/80">
                {adults} adult{adults > 1 ? "s" : ""} &middot; {children} child
                {children === 1 ? "" : "ren"} &middot; {rooms} room{rooms > 1 ? "s" : ""}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4" align="start">
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
                <span className="text-sm font-medium">Children</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren((v) => Math.max(0, v - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren((v) => v + 1)}
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

          <div className="flex items-center px-1 py-1 md:py-0">
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isPending}
              className="h-10 w-full gap-2 rounded-[10px] bg-white px-6 text-navy hover:bg-white/90 disabled:opacity-100 md:h-10 md:w-auto data-[pending=true]:bg-gold data-[pending=true]:text-navy-dark"
              data-pending={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
