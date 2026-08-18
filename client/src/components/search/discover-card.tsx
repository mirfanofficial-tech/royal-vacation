import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { discoverDubaiLinks } from "@/lib/search-mock-data";

export function DiscoverCard({ destination }: { destination: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src="https://picsum.photos/seed/dubai-discover-skyline/480/360"
          alt={`${destination} skyline at dusk`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/40 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4">
        <p className="font-heading text-lg font-bold text-white">Discover More of {destination}</p>

        <div className="grid grid-cols-2 gap-2">
          {discoverDubaiLinks.map((link) => (
            <Link
              key={link.id}
              href="#"
              className="rounded-md bg-white/15 px-2 py-1.5 text-center text-xs font-medium text-white backdrop-blur-sm hover:bg-white/25"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Button className="w-full rounded-lg bg-gold text-navy-dark hover:bg-gold-light">
          View Top Attractions
        </Button>
      </div>
    </div>
  );
}
