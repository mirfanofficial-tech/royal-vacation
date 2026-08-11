"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  label = "Dates",
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  triggerClassName,
  valueClassName,
  formatter,
  numberOfMonths = 1,
}: {
  label?: string;
  checkIn?: Date;
  checkOut?: Date;
  onCheckInChange: (date?: Date) => void;
  onCheckOutChange: (date?: Date) => void;
  triggerClassName?: string;
  valueClassName?: string;
  formatter?: (checkIn?: Date, checkOut?: Date) => string;
  numberOfMonths?: number;
}) {
  const display = formatter
    ? formatter(checkIn, checkOut)
    : checkIn
      ? checkOut
        ? `${format(checkIn, "MMM d")} \u2013 ${format(checkOut, "MMM d, yyyy")}`
        : format(checkIn, "MMM d, yyyy")
      : "Add dates";

  const selected = checkIn ? { from: checkIn, to: checkOut } : undefined;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex flex-col items-start gap-1 text-left",
          triggerClassName
        )}
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className={cn("text-sm text-muted-foreground", valueClassName)}>
          {display}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths}
          selected={selected}
          onSelect={(range) => {
            onCheckInChange(range?.from);
            onCheckOutChange(range?.to);
          }}
          disabled={{ before: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}
