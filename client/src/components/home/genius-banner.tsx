import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Percent, Star, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Tag,
    title: "Exclusive Deals",
    description: "Access member-only offers & promotions",
  },
  {
    icon: Percent,
    title: "Member Discounts",
    description: "Save more on every booking",
  },
  {
    icon: Star,
    title: "More Benefits",
    description: "Enjoy extra perks made for you",
  },
];

export function GeniusBanner() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-6 lg:px-24">
      <div className="overflow-hidden rounded-2xl bg-cream">
        <div className="flex flex-col lg:flex-row">
          {/* Text content */}
          <div className="flex flex-1 flex-col items-start gap-4 px-6 py-8 sm:px-10 sm:py-9">
            <div className="flex items-center gap-1.5">
              <Image src="/assets/crown.png" alt="" width={60} height={42} className="h-4 w-auto" />
              <span className="text-xs font-bold tracking-widest text-gold">LOYALTY</span>
            </div>

            <h2 className="max-w-md font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
              Unlock great <span className="text-gold">discounts</span> with Loyalty
            </h2>

            <p className="max-w-md text-sm text-muted-foreground">
              Sign in to enjoy exclusive member deals and special discounts on thousands of
              properties worldwide.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex max-w-[10.5rem] items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-navy">{title}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
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

          {/* Member offer panel */}
          <div className="relative flex w-full shrink-0 flex-col items-center justify-center gap-1 overflow-hidden border-t border-navy/10 px-6 py-8 text-center lg:w-64 lg:border-l lg:border-t-0">
            <div className="absolute bottom-4 right-4 grid grid-cols-3 gap-1 opacity-30">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-gold" />
              ))}
            </div>
            <span className="relative text-xs font-semibold tracking-widest text-muted-foreground">
              MEMBER OFFER
            </span>
            <span className="relative mt-2 text-xs font-semibold tracking-wide text-muted-foreground">
              UP TO
            </span>
            <span className="relative font-heading text-4xl font-extrabold text-gold">20%</span>
            <span className="relative text-sm font-bold tracking-wide text-navy">OFF</span>
            <span className="relative mt-2 max-w-[10rem] text-xs text-muted-foreground">
              On thousands of properties worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
