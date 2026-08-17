"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Users, Search, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/shared/date-range-picker";

const searchSchema = z.object({
  destination: z.string().min(1, "Please enter a destination"),
});

type SearchValues = z.infer<typeof searchSchema>;

export function SearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
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
    params.set("children", String(children));
    params.set("rooms", String(rooms));
    router.push(`/search?${params.toString()}`);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid w-full grid-cols-1 gap-3 rounded-[10px] bg-white p-2 shadow-xl md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-stretch md:gap-0 md:rounded-[10px] md:p-1.5"
    >
      <div className="flex flex-col justify-center gap-0.5 px-4 py-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
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

      <DateRangePicker
        label="Check-in - Check-out"
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        triggerClassName="justify-center border-l border-border px-4 py-2"
        numberOfMonths={2}
      />

      <Popover>
        <PopoverTrigger className="flex flex-col items-start justify-center gap-0.5 border-l border-border px-4 py-2 text-left">
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            Guests &amp; rooms
          </span>
          <span className="text-sm text-muted-foreground">
            {adults} adults &middot; {children} children &middot; {rooms} room
            {rooms > 1 ? "s" : ""}
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

      <div className="flex items-stretch md:items-center">
        <Button
          type="submit"
          className="h-10 w-full gap-2 rounded-[10px] bg-navy px-6 text-white hover:bg-navy-light md:h-10 md:w-auto"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
