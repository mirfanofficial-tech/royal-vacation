"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-media-query";
import {
  FlexibleDatePicker,
  computeFlexibleRange,
  flexibleSummary,
  type FlexOffset,
} from "@/components/shared/flexible-date-picker";

export function DateRangePicker({
  label = "Dates",
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  triggerClassName,
  valueClassName,
  labelClassName,
  formatter,
  numberOfMonths = 1,
  open,
  onOpenChange,
}: {
  label?: string;
  checkIn?: Date;
  checkOut?: Date;
  onCheckInChange: (date?: Date) => void;
  onCheckOutChange: (date?: Date) => void;
  triggerClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  formatter?: (checkIn?: Date, checkOut?: Date) => string;
  numberOfMonths?: number;
  /** Lets a parent open this popover programmatically — e.g. auto-opening
   * dates right after a destination is picked. Uncontrolled if omitted. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [flexOffset, setFlexOffset] = useState<FlexOffset>(0);
  const [flexLabel, setFlexLabel] = useState<string | null>(null);
  const isMobile = useIsMobile();
  // A stacked 2-month calendar is comfortably tall on desktop but runs off
  // a phone screen — cap to 1 month and a viewport-relative width there.
  const effectiveMonths = isMobile ? 1 : numberOfMonths;

  const exactDisplay = formatter
    ? formatter(checkIn, checkOut)
    : checkIn
      ? checkOut
        ? `${format(checkIn, "MMM d")} – ${format(checkOut, "MMM d, yyyy")}${
            flexOffset > 0 ? ` (±${flexOffset}d)` : ""
          }`
        : format(checkIn, "MMM d, yyyy")
      : "Check-in Date – Check-out Date";

  const display = flexLabel ?? exactDisplay;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className={cn(
          "flex flex-col items-start gap-1 text-left",
          triggerClassName
        )}
      >
        <span
          className={cn(
            "text-[13px] font-semibold text-foreground",
            labelClassName
          )}
        >
          {label}
        </span>
        <span className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", valueClassName)}>
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {display}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "max-h-[80vh] overflow-y-auto overflow-x-hidden p-0",
          isMobile
            ? "w-[min(92vw,20rem)]"
            : "w-[min(90vw,36rem)]"
        )}
        align={isMobile ? "center" : "start"}
      >
        <FlexibleDatePicker
          checkIn={checkIn}
          checkOut={checkOut}
          numberOfMonths={effectiveMonths}
          calendarClassName={isMobile ? "[--cell-size:--spacing(8)]" : undefined}
          flexOffset={flexOffset}
          onFlexOffsetChange={setFlexOffset}
          onSelectRange={(range) => {
            setFlexLabel(null);
            onCheckInChange(range.from);
            onCheckOutChange(range.to);
          }}
          onFlexibleConfirm={(tripLength, monthKeys) => {
            const range = computeFlexibleRange(tripLength, monthKeys);
            onCheckInChange(range?.from);
            onCheckOutChange(range?.to);
            setFlexOffset(0);
            setFlexLabel(flexibleSummary(tripLength, monthKeys));
            onOpenChange?.(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
