import { BadgePercent, ShieldCheck, Headset } from "lucide-react";

const features = [
  {
    id: "price",
    icon: BadgePercent,
    title: "Best Price Guarantee",
    description: "Found a lower price? We'll match it.",
  },
  {
    id: "secure",
    icon: ShieldCheck,
    title: "Secure Booking",
    description: "Your booking is safe and protected.",
  },
  {
    id: "support",
    icon: Headset,
    title: "24/7 Customer Support",
    description: "We're here to help anytime.",
  },
];

export function WhyBookMiniCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy">Why book with Royal Vacation?</h3>
      <ul className="flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
              <feature.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
