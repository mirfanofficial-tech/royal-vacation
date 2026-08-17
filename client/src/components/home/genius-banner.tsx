import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GeniusBanner() {
  return (
    <section className="mx-auto max-w-[1400px] px-10 py-6 lg:px-24">
      <div className="relative overflow-hidden rounded-2xl bg-navy">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/royal-genius-luggage/1400/400"
            alt="Suitcase ready for a beach vacation"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        </div>

        <div className="relative flex flex-col items-start gap-4 px-8 py-10 sm:px-12 sm:py-12">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-gold-light" />
            <span className="font-heading text-2xl font-bold text-gold-light">Loyality</span>
          </div>
          <h2 className="max-w-md font-heading text-2xl font-bold text-white sm:text-3xl">
            Unlock exclusive discounts with Loyality
          </h2>
          <p className="max-w-md text-sm text-white/85">
            Sign in to enjoy exclusive deals and discounts at thousands of properties.
          </p>
          <Button className="mt-1 rounded-full bg-gold text-navy-dark hover:bg-gold-light">
            Sign in / Register
          </Button>
        </div>

        <div className="absolute right-8 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full border-4 border-gold-light bg-navy-dark text-center sm:flex">
          <span className="font-heading text-sm font-bold leading-tight text-white">
            Up to
            <br />
            <span className="text-2xl text-gold-light">20%</span>
            <br />
            OFF
          </span>
        </div>
      </div>
    </section>
  );
}
