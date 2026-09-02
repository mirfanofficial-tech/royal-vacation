"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { format } from "date-fns";
import { Flame, Lock, Users, Minus, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RoomRateCard } from "@/components/property/room-rate-card";
import type { RoomOption } from "@/lib/property-detail-mock-data";

function toYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

const roomTypeFilters: { id: RoomOption["roomType"]; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "studios", label: "Studios" },
  { id: "apartments", label: "Apartments" },
];

export function AvailabilitySection({
  propertyId,
  rooms,
  currency,
  demandNote,
}: {
  propertyId: string;
  rooms: RoomOption[];
  currency: string;
  demandNote: string;
}) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date(2026, 7, 11));
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(2026, 7, 12));
  const [adults, setAdults] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [roomsCount, setRoomsCount] = useState(1);

  useEffect(() => {
    setChildAges((prev) => {
      if (prev.length === childCount) return prev;
      const next = prev.slice(0, childCount);
      while (next.length < childCount) next.push(8);
      return next;
    });
  }, [childCount]);
  const [activeFilters, setActiveFilters] = useState<Set<RoomOption["roomType"]>>(new Set());
  const [selection, setSelection] = useState<{
    roomId: string;
    planId: string;
    qty: number;
  } | null>(null);

  const availableTypes = useMemo(
    () => new Set(rooms.map((room) => room.roomType)),
    [rooms]
  );

  const filteredRooms =
    activeFilters.size === 0 ? rooms : rooms.filter((room) => activeFilters.has(room.roomType));

  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : 1;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!selection) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "96px";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [selection]);

  const handleSelect = (roomId: string, planId: string, qty: number) => {
    setSelection((prev) => {
      if (qty > 0) return { roomId, planId, qty };
      return prev && prev.planId === planId ? null : prev;
    });
  };

  const selectedRoom = selection ? rooms.find((r) => r.id === selection.roomId) : undefined;
  const selectedPlan = selectedRoom?.ratePlans.find((p) => p.id === selection?.planId);
  const barTotal =
    selection && selectedPlan ? selectedPlan.price * selection.qty * nights : 0;
  const continueHref =
    selection && checkIn && checkOut
      ? `/checkout/${propertyId}?room=${selection.roomId}&rate=${selection.planId}` +
        `&checkIn=${toYmd(checkIn)}&checkOut=${toYmd(checkOut)}&adults=${adults}&rooms=${selection.qty}` +
        (childCount > 0 ? `&children=${childCount}&childAges=${childAges.join(",")}` : "")
      : null;

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
                {adults} adults{childCount > 0 ? ` · ${childCount} children` : ""} &middot;{" "}
                {roomsCount} room{roomsCount > 1 ? "s" : ""}
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
                <span className="text-sm font-medium">Children</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildCount((v) => Math.max(0, v - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm">{childCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildCount((v) => Math.min(10, v + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {childCount > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {childAges.map((age, i) => (
                    <label key={i} className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Child {i + 1} age
                      <select
                        value={age}
                        onChange={(e) =>
                          setChildAges((prev) =>
                            prev.map((a, idx) => (idx === i ? Number(e.target.value) : a)),
                          )
                        }
                        className="h-8 rounded-lg border border-border bg-white px-2 text-sm text-foreground outline-none focus-visible:border-navy"
                      >
                        {Array.from({ length: 18 }, (_, n) => (
                          <option key={n} value={n}>
                            {n === 0 ? "< 1 year" : `${n} year${n > 1 ? "s" : ""} old`}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              )}
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
            selectedPlanId={selection?.planId ?? null}
            selectedQty={selection?.qty ?? 0}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <p className="mt-5 border-t border-border pt-5 text-xs text-muted-foreground">
        It only takes 2 minutes · you won&apos;t be charged yet
      </p>

      {mounted &&
        selection &&
        selectedRoom &&
        selectedPlan &&
        continueHref &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-[2000] border-t border-border bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Selected Rooms</p>
                <p className="font-heading text-base font-bold text-navy">
                  {selection.qty} Room{selection.qty > 1 ? "s" : ""} selected
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {selection.qty}x {selectedRoom.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Price</p>
                  <p className="text-lg font-bold text-foreground">
                    {currency}{" "}
                    {barTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    for {nights} Night{nights > 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  render={<Link href={continueHref} />}
                  nativeButton={false}
                  className="gap-2 rounded-full bg-navy px-6 py-5 text-sm font-semibold text-white hover:bg-navy-light"
                >
                  <Lock className="h-4 w-4" />
                  Continue Booking
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
