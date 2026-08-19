import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Globe, Percent, Star, Tag, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Tag, lines: ["Exclusive", "Deals"] },
  { icon: Percent, lines: ["Member", "Discounts"] },
  { icon: Star, lines: ["More Benefits", "for You"] },
];

const stats = [
  { icon: Users, value: "10K+", label: "Happy Members" },
  { icon: Building2, value: "100K+", label: "Properties" },
  { icon: Globe, value: "100+", label: "Countries" },
];

export function GeniusBanner() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-6 lg:px-24">
      <div className="overflow-hidden rounded-2xl bg-cream">
        <div className="flex flex-col lg:flex-row">
          {/* Text content */}
          <div className="flex flex-1 flex-col items-start gap-4 px-6 py-8 sm:px-10 sm:py-9">
            <div className="flex items-center gap-2">
              <Image src="/assets/crown.png" alt="" width={60} height={42} className="h-6 w-auto" />
              <span className="font-heading text-lg font-bold text-navy">Loyalty</span>
            </div>

            <h2 className="max-w-md font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
              Unlock great <span className="text-gold">discounts</span> with Loyalty
            </h2>

            <p className="max-w-md text-sm text-muted-foreground">
              Sign in to enjoy exclusive deals and discounts at thousands of properties.
            </p>

            <div className="flex flex-wrap gap-5">
              {features.map(({ icon: Icon, lines }) => (
                <div key={lines.join(" ")} className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium leading-tight text-navy">
                    {lines[0]}
                    <br />
                    {lines[1]}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/genius">
              <Button className="mt-1 gap-2 rounded-full bg-navy px-5 text-white hover:bg-navy-light">
                <User className="h-4 w-4" />
                Sign in / Register
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Suitcase image */}
          <div className="relative hidden w-64 shrink-0 overflow-hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1670888664952-efff442ec0d2?auto=format&fit=crop&w=500&q=80"
              alt="Blue travel suitcase"
              fill
              className="object-cover"
            />
          </div>

          {/* Gold discount panel */}
          <div className="relative hidden w-44 shrink-0 flex-col items-center justify-center gap-1 overflow-hidden bg-gradient-to-br from-gold-light to-gold px-4 py-8 text-center text-white lg:flex">
            <div className="absolute right-3 top-3 grid grid-cols-3 gap-1 opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </div>
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10" />
            <span className="relative text-xs font-semibold tracking-wide">UP TO</span>
            <span className="relative font-heading text-4xl font-extrabold">20%</span>
            <span className="relative text-sm font-bold tracking-wide">OFF</span>
            <span className="relative my-2 h-px w-10 bg-white/40" />
            <span className="relative text-xs text-white/90">On thousands of properties</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-navy/10 bg-white/60 px-6 py-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-navy">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
