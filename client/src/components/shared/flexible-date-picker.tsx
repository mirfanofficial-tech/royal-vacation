"use client";

import { useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const FLEX_OFFSETS = [0, 1, 2, 3, 7] as const;
export type FlexOffset = (typeof FLEX_OFFSETS)[number];

const TRIP_LENGTHS = [
  { key: "weekend", label: "A weekend" },
  { key: "week", label: "A week" },
  { key: "month", label: "A month" },
  { key: "other", label: "Other" },
] as const;
type TripLength = (typeof TRIP_LENGTHS)[number]["key"];

const MAX_FLEXIBLE_MONTHS = 3;
const MONTH_OPTIONS_COUNT = 12;

function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

function monthOptions(): { key: string; date: Date }[] {
  const start = startOfMonth(new Date());
  return Array.from({ length: MONTH_OPTIONS_COUNT }, (_, i) => {
    const date = addMonths(start, i);
    return { key: monthKey(date), date };
  });
}

/** Turns a trip length + the earliest picked month into a concrete range —
 * there's no real flexible-search backend behind this yet, so this just
 * picks a representative range to drive the existing checkIn/checkOut
 * contract the rest of the app expects. */
export function computeFlexibleRange(
  tripLength: TripLength,
  monthKeys: string[]
): { from: Date; to: Date } | undefined {
  if (monthKeys.length === 0) return undefined;
  const [firstKey] = [...monthKeys].sort();
  const [y, m] = firstKey.split("-").map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const today = new Date();
  const base = monthStart < today ? today : monthStart;

  if (tripLength === "weekend") {
    const d = new Date(base);
    while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
    return { from: d, to: addDays(d, 2) };
  }
  if (tripLength === "week") {
    const d = new Date(base);
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    return { from: d, to: addDays(d, 7) };
  }
  if (tripLength === "month") {
    return { from: monthStart, to: endOfMonth(monthStart) };
  }
  return { from: base, to: addDays(base, 3) };
}

export function flexibleSummary(tripLength: TripLength | null, monthKeys: string[]): string | null {
  if (!tripLength || monthKeys.length === 0) return null;
  const label = TRIP_LENGTHS.find((t) => t.key === tripLength)?.label ?? "Flexible";
  const months = [...monthKeys]
    .sort()
    .map((k) => format(new Date(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, 1), "MMM yyyy"))
    .join(", ");
  return `${label} · ${months}`;
}

export function FlexibleDatePicker({
  checkIn,
  checkOut,
  onSelectRange,
  flexOffset,
  onFlexOffsetChange,
  onFlexibleConfirm,
  numberOfMonths,
  calendarClassName,
}: {
  checkIn?: Date;
  checkOut?: Date;
  onSelectRange: (range: { from?: Date; to?: Date }) => void;
  flexOffset: FlexOffset;
  onFlexOffsetChange: (offset: FlexOffset) => void;
  onFlexibleConfirm: (tripLength: TripLength, monthKeys: string[]) => void;
  numberOfMonths: number;
  calendarClassName?: string;
}) {
  const [tab, setTab] = useState<"calendar" | "flexible">("calendar");
  const [tripLength, setTripLength] = useState<TripLength | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const months = useMemo(monthOptions, []);

  function toggleMonth(key: string) {
    setSelectedMonths((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_FLEXIBLE_MONTHS) return prev;
      return [...prev, key];
    });
  }

  const canConfirmFlexible = tripLength !== null && selectedMonths.length > 0;

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-border px-3">
        {(
          [
            { key: "calendar" as const, label: "Calendar" },
            { key: "flexible" as const, label: "I'm flexible" },
          ]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-3 py-2.5 text-sm font-medium transition-colors",
              tab === t.key ? "text-navy" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-navy" />
            )}
          </button>
        ))}
      </div>

      {tab === "calendar" ? (
        <div>
          <div className="flex justify-center">
            <Calendar
              mode="range"
              numberOfMonths={numberOfMonths}
              className={calendarClassName}
              selected={checkIn ? { from: checkIn, to: checkOut } : undefined}
              onSelect={(range) => onSelectRange({ from: range?.from, to: range?.to })}
              disabled={{ before: new Date() }}
            />
          </div>
          <div className="border-t border-border px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Flexible date options</p>
            <div className="flex flex-wrap gap-2">
              {FLEX_OFFSETS.map((offset) => (
                <button
                  key={offset}
                  type="button"
                  onClick={() => onFlexOffsetChange(offset)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    flexOffset === offset
                      ? "border-navy bg-navy text-white"
                      : "border-border text-foreground hover:border-navy/40"
                  )}
                >
                  {offset === 0 ? "Exact dates" : `± ${offset} day${offset > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-3.5">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">How long do you want to stay?</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRIP_LENGTHS.map((t) => (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                      tripLength === t.key ? "border-navy" : "border-border"
                    )}
                  >
                    {tripLength === t.key && <span className="h-2 w-2 rounded-full bg-navy" />}
                  </span>
                  <input
                    type="radio"
                    name="trip-length"
                    value={t.key}
                    checked={tripLength === t.key}
                    onChange={() => setTripLength(t.key)}
                    className="sr-only"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">When do you want to go?</p>
            <p className="mb-2 text-xs text-muted-foreground">Select up to {MAX_FLEXIBLE_MONTHS} months</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {months.map(({ key, date }) => {
                const selected = selectedMonths.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleMonth(key)}
                    className={cn(
                      "flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
                      selected
                        ? "border-navy bg-navy/5 text-navy"
                        : "border-border text-foreground hover:border-navy/40"
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(date, "MMM")}</span>
                    <span className="text-muted-foreground">{format(date, "yyyy")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setTab("calendar")}
              className="text-sm font-medium text-navy hover:underline"
            >
              Select days and months
            </button>
            <Button
              type="button"
              disabled={!canConfirmFlexible}
              onClick={() => tripLength && onFlexibleConfirm(tripLength, selectedMonths)}
              className="bg-navy text-white hover:bg-navy-light"
            >
              Select dates
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
