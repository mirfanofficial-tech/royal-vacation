import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, CircleCheck, Croissant, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Percent, title: "10–25% off", description: "member-only rates" },
  { icon: BedDouble, title: "Free upgrades", description: "when rooms allow" },
  { icon: Croissant, title: "Free breakfast", description: "from Level 3" },
];

export function GeniusBanner() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6 lg:px-24">
      <div className="grid overflow-hidden rounded-2xl border border-border bg-white md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        {/* Image */}
        <div className="relative min-h-[200px] md:min-h-full">
          <Image
            src="/assets/static/loyality_program.png"
            alt="Hotel breakfast buffet"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 340px, 100vw"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Royal Loyalty
          </span>

          <h2 className="font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
            Travel more, pay less — every single stay
          </h2>

          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Three levels, no fees and no blackout dates. Your discount grows with every stay you
            book through Royal Vacation.
          </p>

          <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-center gap-3 py-3 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-navy">{title}</span>
                  <span className="block text-xs text-muted-foreground">{description}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              render={<Link href="/genius" />}
              nativeButton={false}
              className="shrink-0 gap-2 rounded-lg bg-navy px-5 py-5 text-sm font-semibold text-white hover:bg-navy-light"
            >
              Join Royal Loyalty
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CircleCheck className="h-4 w-4 shrink-0 text-rating" />
              Free forever · 2.4 million members · Discounts apply instantly at checkout
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
