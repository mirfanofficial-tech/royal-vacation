import { Receipt, BadgePercent, Headset, ShieldCheck } from "lucide-react";

const badges = [
  {
    id: "no-fees",
    icon: Receipt,
    title: "No booking fees",
    description: "Book your stay without any extra charges",
  },
  {
    id: "price-match",
    icon: BadgePercent,
    title: "Best Price Guarantee",
    description: "Find a lower price? We'll match it",
  },
  {
    id: "support",
    icon: Headset,
    title: "24/7 Customer Support",
    description: "We're here to help you anytime",
  },
  {
    id: "secure",
    icon: ShieldCheck,
    title: "Secure Booking",
    description: "Your card and payment info is always protected",
  },
];

export function TrustBadgesBand() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => (
        <div key={badge.id} className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <badge.icon className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{badge.title}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
