import Image from "next/image";
import Link from "next/link";
import { recentlyViewed } from "@/lib/search-mock-data";

export function RecentlyViewedCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy">Recently viewed</h3>
      <ul className="flex flex-col gap-3">
        {recentlyViewed.map((property) => (
          <li key={property.id}>
            <Link href="#" className="flex items-center gap-3 group">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-navy">
                  {property.name}
                </p>
                <p className="text-xs text-muted-foreground">{property.location}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="block rounded bg-rating px-1 py-0.5 text-[10px] font-bold text-white">
                  {property.rating.toFixed(1)}
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold text-foreground">
                  {property.currency} {property.price.toLocaleString()}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
