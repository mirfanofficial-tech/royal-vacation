"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price (low to high)" },
  { value: "price-high", label: "Price (high to low)" },
  { value: "rating", label: "Guest rating" },
  { value: "stars", label: "Star rating" },
];

export function SortSelect({ triggerClassName }: { triggerClassName?: string }) {
  return (
    <Select defaultValue="recommended">
      <SelectTrigger className={triggerClassName ?? "h-9 min-w-[160px] rounded-lg bg-white"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
