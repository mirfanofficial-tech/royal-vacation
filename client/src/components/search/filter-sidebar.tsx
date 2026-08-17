"use client";

import type { ComponentType } from "react";
import {
  Star,
  ThumbsUp,
  Building2,
  Building,
  Palmtree,
  Home,
  Warehouse,
  BedSingle,
  Wifi,
  Waves,
  SquareParking,
  Coffee,
  Bus,
  Flower2,
  Users,
  Dumbbell,
  Search,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  starRatingFilters,
  guestRatingFilters,
  propertyTypeFilters,
  amenityFilters,
  mealFilters,
  cancellationFilters,
} from "@/lib/search-mock-data";

const propertyTypeIcons = {
  hotel: Building2,
  apartment: Building,
  resort: Palmtree,
  villa: Home,
  guesthouse: Warehouse,
  hostel: BedSingle,
};

const amenityIcons = {
  wifi: Wifi,
  pool: Waves,
  parking: SquareParking,
  breakfast: Coffee,
  shuttle: Bus,
  spa: Flower2,
  family: Users,
  fitness: Dumbbell,
};

function FilterRow({
  id,
  label,
  count,
  defaultChecked,
  icon: Icon,
}: {
  id: string;
  label: string;
  count: number;
  defaultChecked?: boolean;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-2 py-1 text-sm"
    >
      <span className="flex items-center gap-2 text-foreground">
        <Checkbox id={id} defaultChecked={defaultChecked} />
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
      </span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </label>
  );
}

export function FilterSidebar({
  onApply,
  defaultTypeId = "hotels",
}: {
  onApply?: () => void;
  defaultTypeId?: string;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy">Filter Results</h2>
        <button type="button" className="text-xs font-semibold text-gold hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Property name</h3>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Enter hotel name" className="pl-9" />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Filters the results in this search</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Price range (PKR / night)
        </h3>
        <Slider defaultValue={[5000, 150000]} min={0} max={150000} step={1000} />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>PKR 5,000</span>
          <span>PKR 150,000+</span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Star rating</h3>
        <div className="flex flex-col gap-1">
          {starRatingFilters.map((filter) => (
            <label
              key={filter.id}
              htmlFor={`star-${filter.id}`}
              className="flex cursor-pointer items-center justify-between gap-2 py-1 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground">
                <Checkbox id={`star-${filter.id}`} />
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: Number(filter.id) }, (_, i) => (
                    <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                  ))}
                </span>
                {filter.label}
              </span>
              <span className="text-xs text-muted-foreground">({filter.count})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Guest rating</h3>
        <div className="flex flex-col gap-1">
          {guestRatingFilters.map((filter) => (
            <FilterRow key={filter.id} {...filter} id={`guest-${filter.id}`} icon={ThumbsUp} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Property type</h3>
        <div className="flex flex-col gap-1">
          {propertyTypeFilters.map((filter) => (
            <FilterRow
              key={filter.id}
              {...filter}
              id={`type-${filter.id}`}
              icon={propertyTypeIcons[filter.icon]}
              defaultChecked={filter.id === defaultTypeId}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Popular amenities</h3>
        <div className="flex flex-col gap-1">
          {amenityFilters.map((filter) => (
            <FilterRow
              key={filter.id}
              {...filter}
              id={`amenity-${filter.id}`}
              icon={amenityIcons[filter.icon]}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Meals included</h3>
        <div className="flex flex-col gap-1">
          {mealFilters.map((filter) => (
            <FilterRow key={filter.id} {...filter} id={`meal-${filter.id}`} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Cancellation policy</h3>
        <div className="flex flex-col gap-1">
          {cancellationFilters.map((filter) => (
            <FilterRow key={filter.id} {...filter} id={`cancel-${filter.id}`} defaultChecked />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Distance from city center</h3>
        <p className="mb-3 text-xs text-muted-foreground">Within 10 km</p>
        <Slider defaultValue={[0, 10]} min={0} max={50} step={1} />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>0 km</span>
          <span>50+ km</span>
        </div>
      </div>

      <Button
        onClick={onApply}
        className="w-full rounded-lg bg-navy text-white hover:bg-navy-light"
      >
        Apply Filters
      </Button>
    </aside>
  );
}
