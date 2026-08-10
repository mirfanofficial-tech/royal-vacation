"use client";

import { useState } from "react";
import Link from "next/link";
import { Coffee, Car, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { extraOptions, type ExtraOption } from "@/lib/checkout-mock-data";

const extraIcons: Record<ExtraOption["icon"], typeof Coffee> = {
  breakfast: Coffee,
  pickup: Car,
  insurance: Shield,
};

const extraAccents: Record<ExtraOption["icon"], string> = {
  breakfast: "bg-purple-100 text-purple-600",
  pickup: "bg-rating/10 text-rating",
  insurance: "bg-gold/15 text-gold",
};

export function ExtrasSection({
  currency,
  onSelectionChange,
}: {
  currency: string;
  onSelectionChange?: (selectedIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange?.([...next]);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-navy">Add Extras (Optional)</h2>
          <p className="text-sm text-muted-foreground">
            Enhance your stay with these additional services.
          </p>
        </div>
        <Link href="#" className="flex items-center gap-1 text-sm font-semibold text-gold hover:underline sm:shrink-0">
          View all extras
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {extraOptions.map((extra) => {
          const Icon = extraIcons[extra.icon];
          const isChecked = selected.has(extra.id);
          return (
            <label
              key={extra.id}
              className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors ${
                isChecked ? "border-navy ring-1 ring-navy" : "border-border hover:border-navy/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${extraAccents[extra.icon]}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggle(extra.id)}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{extra.title}</p>
                <p className="text-xs text-muted-foreground">{extra.description}</p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {currency} {extra.price.toLocaleString()}
                <span className="font-normal text-muted-foreground"> / stay</span>
              </p>
            </label>
          );
        })}
      </div>
    </div>
  );
}
