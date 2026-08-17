import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { SearchBar } from "@/components/home/search-bar";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/static/home_page_banner_bg.png"
          alt="Infinity pool overlooking the coast at dusk from a luxury villa terrace"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/60 via-navy-dark/20 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-10 pb-16 pt-14 lg:px-24 lg:pb-20 lg:pt-20">
        <div className="max-w-xl text-white">
          <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Find your perfect stay
          </h1>
          <p className="mt-3 text-base text-white/90 sm:text-lg">
            Experience the world with Royal Vacation
          </p>
        </div>

        <SearchBar />

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-white">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gold-light" />
            No booking fees
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gold-light" />
            Best Price Guarantee
          </span>
        </div>
      </div>
    </section>
  );
}
