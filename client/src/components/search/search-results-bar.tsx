"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Users, Search, Loader2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { DestinationAutocomplete } from "@/components/shared/destination-autocomplete";

function GuestStepper({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-4 text-center text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDateOpen, setMobileDateOpen] = useState(false);
  const [desktopDateOpen, setDesktopDateOpen] = useState(false);
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
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 lg:px-24">
        {/* Mobile: one compact line summarizing the search, opens a bottom sheet to edit */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="flex w-full items-center gap-3 rounded-full bg-white px-4 py-3 text-left shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-navy" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {destination || "Where are you going?"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {checkIn ? format(checkIn, "d MMM") : "Add dates"}
                  {checkOut ? ` – ${format(checkOut, "d MMM")}` : ""} &middot; {adults + children} guest
                  {adults + children > 1 ? "s" : ""} &middot; {rooms} room{rooms > 1 ? "s" : ""}
                </p>
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Edit your search</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-5 px-4 pb-6 pt-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-navy" />
                    Destination
                  </label>
                  <DestinationAutocomplete
                    value={destination}
                    onChange={setDestination}
                    onSelect={() => setMobileDateOpen(true)}
                    inputClassName="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus-visible:border-navy"
                  />
                </div>

                <DateRangePicker
                  label="Check-in / Check-out"
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onCheckInChange={setCheckIn}
                  onCheckOutChange={setCheckOut}
                  open={mobileDateOpen}
                  onOpenChange={setMobileDateOpen}
                  triggerClassName="w-full rounded-lg border border-border px-3 py-2.5"
                  numberOfMonths={1}
                />

                <div className="space-y-4 rounded-lg border border-border p-3">
                  <GuestStepper label="Adults" value={adults} onChange={setAdults} min={1} />
                  <GuestStepper label="Children" value={children} onChange={setChildren} min={0} />
                  <GuestStepper label="Rooms" value={rooms} onChange={setRooms} min={1} />
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    handleSearch();
                    setMobileOpen(false);
                  }}
                  disabled={isPending}
                  className="h-11 w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-100 data-[pending=true]:bg-gold data-[pending=true]:text-navy-dark"
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
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop / tablet: full pill-shaped form */}
        <div className="hidden w-full md:grid md:grid-cols-[1.3fr_1fr_1fr_auto] md:gap-0 md:rounded-full md:p-2">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex flex-1 flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <MapPin className="h-3.5 w-3.5 text-gold-light" />
                Destination
              </label>
              <DestinationAutocomplete
                value={destination}
                onChange={setDestination}
                onSelect={() => setDesktopDateOpen(true)}
                inputClassName="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
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
            open={desktopDateOpen}
            onOpenChange={setDesktopDateOpen}
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
              <GuestStepper label="Adults" value={adults} onChange={setAdults} min={1} />
              <GuestStepper label="Children" value={children} onChange={setChildren} min={0} />
              <GuestStepper label="Rooms" value={rooms} onChange={setRooms} min={1} />
            </PopoverContent>
          </Popover>

          <div className="flex items-center px-1 py-1 md:py-0">
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isPending}
              className="h-10 w-full gap-2 rounded-[10px] bg-white px-4 sm:px-6 text-navy hover:bg-white/90 disabled:opacity-100 md:h-10 md:w-auto data-[pending=true]:bg-gold data-[pending=true]:text-navy-dark"
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
