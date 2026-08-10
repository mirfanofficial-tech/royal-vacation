"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bed, Users2, Maximize, Eye, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoomOption } from "@/lib/property-detail-mock-data";

export function RoomCard({
  room,
  currency,
  propertyId,
}: {
  room: RoomOption;
  currency: string;
  propertyId: string;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:gap-5">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg sm:w-40">
        <Image src={room.image} alt={room.name} fill className="object-cover" sizes="160px" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="font-heading text-base font-bold text-navy">{room.name}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {room.beds}
          </span>
          <span className="flex items-center gap-1">
            <Users2 className="h-3.5 w-3.5" />
            {room.maxGuests} Adults
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" />
            {room.size}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {room.view}
          </span>
        </div>

        <div className="mt-1 flex flex-col gap-0.5 text-xs text-rating">
          {room.breakfastIncluded && (
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Breakfast included
            </span>
          )}
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Free cancellation before {room.freeCancellationBefore}
          </span>
          {room.payAtProperty && (
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Pay at the property
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold text-gold hover:underline"
        >
          Details
          <ChevronDown className={`h-3 w-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
        </button>
        {detailsOpen && (
          <p className="text-xs text-muted-foreground">
            The {room.name.toLowerCase()} comfortably fits {room.maxGuests} guests across{" "}
            {room.size}, featuring {room.beds.toLowerCase()} and a {room.view.toLowerCase()}.
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <p className="text-right">
          <span className="text-lg font-bold text-foreground">
            {currency} {room.price.toLocaleString()}
          </span>
          <span className="block text-xs text-muted-foreground">/ night</span>
        </p>
        <Button
          render={<Link href={`/checkout/${propertyId}?room=${room.id}`} />}
          nativeButton={false}
          className="rounded-lg bg-navy text-white hover:bg-navy-light"
        >
          Select room
        </Button>
      </div>
    </div>
  );
}
