"use client";

import { useState } from "react";
import { Palmtree, Bus, Wifi, Waves, Flower2, Users, Dumbbell, UtensilsCrossed } from "lucide-react";
import type { PropertyDetail, QuickFacilityIcon } from "@/lib/property-detail-mock-data";

const quickFacilityIcons: Record<QuickFacilityIcon, typeof Palmtree> = {
  beach: Palmtree,
  shuttle: Bus,
  wifi: Wifi,
  pool: Waves,
  spa: Flower2,
  family: Users,
  fitness: Dumbbell,
  restaurant: UtensilsCrossed,
};

export function AboutSection({ property }: { property: PropertyDetail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="overview" className="scroll-mt-36">
      <h2 className="mb-3 font-heading text-xl font-bold text-navy">About this property</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {property.aboutShort}
        {expanded && <span> {property.aboutMore}</span>}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-1 text-sm font-semibold text-gold hover:underline"
      >
        {expanded ? "Read less" : "Read more"}
      </button>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {property.quickFacilities.map((facility) => {
          const Icon = quickFacilityIcons[facility.icon];
          return (
            <div
              key={facility.label}
              className="flex flex-col items-center gap-2 rounded-lg border border-border px-2 py-3 text-center"
            >
              <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <span className="text-xs font-medium text-foreground">{facility.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
