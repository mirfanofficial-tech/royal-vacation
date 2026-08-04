"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MapPin, CalendarIcon, Users, Search, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [rooms, setRooms] = useState(defaultRooms);

  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-[1400px] px-6 py-4 lg:px-10">
        <div className="grid w-full grid-cols-1 gap-3 rounded-2xl bg-white p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto] md:gap-0 md:divide-x md:divide-border md:rounded-full md:p-2">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex flex-1 flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MapPin className="h-3.5 w-3.5 text-navy" />
                Destination
              </label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search for destination, property or city"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            {destination && (
              <button
                type="button"
                aria-label="Clear destination"
                onClick={() => setDestination("")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger className="flex flex-col items-start gap-1 px-4 py-2 text-left">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CalendarIcon className="h-3.5 w-3.5 text-navy" />
                Check-in
              </span>
              <span className="text-sm text-muted-foreground">
                {checkIn ? format(checkIn, "EEE, d MMM yyyy") : "Add dates"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="flex flex-col items-start gap-1 px-4 py-2 text-left">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CalendarIcon className="h-3.5 w-3.5 text-navy" />
                Check-out
              </span>
              <span className="text-sm text-muted-foreground">
                {checkOut ? format(checkOut, "EEE, d MMM yyyy") : "Add dates"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={{ before: checkIn ?? new Date() }}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="flex flex-col items-start gap-1 px-4 py-2 text-left">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Users className="h-3.5 w-3.5 text-navy" />
                Guests &amp; Rooms
              </span>
              <span className="text-sm text-muted-foreground">
                {adults} adults &middot; {rooms} room{rooms > 1 ? "s" : ""}
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
            <Button className="h-12 w-full gap-2 rounded-full bg-gold px-6 text-navy-dark hover:bg-gold-light md:w-auto">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
