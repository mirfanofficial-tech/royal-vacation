import { BadgePercent, Headset, ShieldCheck, CalendarCheck } from "lucide-react";
import { whyBookFeatures } from "@/lib/search-mock-data";

const icons = {
  price: BadgePercent,
  support: Headset,
  secure: ShieldCheck,
  flexible: CalendarCheck,
};

export function WhyBookCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy">Why book with Royal Vacation?</h3>
      <ul className="flex flex-col gap-3">
        {whyBookFeatures.map((feature) => {
          const Icon = icons[feature.id as keyof typeof icons];
          return (
            <li key={feature.id} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
