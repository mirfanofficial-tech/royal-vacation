"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { MapPin, CalendarIcon, Users, Search, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const searchSchema = z.object({
  destination: z.string().min(1, "Please enter a destination"),
});

type SearchValues = z.infer<typeof searchSchema>;

export function SearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { destination: "" },
  });

  const onSubmit = handleSubmit((values) => {
    const params = new URLSearchParams({ destination: values.destination });
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("adults", String(adults));
    params.set("rooms", String(rooms));
    router.push(`/search?${params.toString()}`);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid w-full grid-cols-1 gap-3 rounded-2xl bg-white p-3 shadow-xl md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:gap-0 md:divide-x md:divide-border md:rounded-full md:p-2"
    >
      <div className="flex flex-col gap-1 px-4 py-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MapPin className="h-3.5 w-3.5 text-navy" />
          Where are you going?
        </label>
        <Input
          {...register("destination")}
          placeholder="Search for destination, property or city"
          autoComplete="off"
          className="h-auto border-none p-0 text-sm shadow-none focus-visible:ring-0"
        />
        {errors.destination && (
          <span className="text-xs text-destructive">{errors.destination.message}</span>
        )}
      </div>

      <Popover>
        <PopoverTrigger className="flex flex-col items-start gap-1 px-4 py-2 text-left">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CalendarIcon className="h-3.5 w-3.5 text-navy" />
            Check-in
          </span>
          <span className="text-sm text-muted-foreground">
            {checkIn ? format(checkIn, "MMM d, yyyy") : "Add dates"}
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
            {checkOut ? format(checkOut, "MMM d, yyyy") : "Add dates"}
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
            Guests &amp; rooms
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
        <Button
          type="submit"
          className="h-12 w-full gap-2 rounded-full bg-navy px-6 text-white hover:bg-navy-light md:w-auto"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
