import Link from "next/link";
import { Building2, Building, Palmtree, Home, Warehouse, TreePine, ChevronRight } from "lucide-react";
import { propertyTypes } from "@/lib/mock-data";

const typeIcons = {
  hotel: Building2,
  apartment: Building,
  resort: Palmtree,
  villa: Home,
  guesthouse: Warehouse,
  cabin: TreePine,
};

export function PropertyTypes() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-navy">Browse by property type</h2>
        <Link href="/search" className="text-sm font-semibold text-gold hover:underline">
          View all
        </Link>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {propertyTypes.map((type) => {
            const Icon = typeIcons[type.icon];
            return (
              <Link
                key={type.id}
                href={`/search?propertyType=${type.id}`}
                className="flex flex-col items-center gap-3 rounded-xl border border-border px-4 py-6 text-center transition-colors hover:border-navy hover:shadow-md"
              >
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {type.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">{type.count}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Show more property types"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-muted lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
