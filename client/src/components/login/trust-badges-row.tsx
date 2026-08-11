import { Wallet, Award, Headset, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  {
    id: "no-fees",
    icon: Wallet,
    title: "No booking fees",
    description: "Save more with no hidden fees",
  },
  {
    id: "best-price",
    icon: Award,
    title: "Best Price Guarantee",
    description: "Found a better price? We'll match it",
  },
  {
    id: "support",
    icon: Headset,
    title: "24/7 Customer Support",
    description: "We're here to help anytime",
  },
  {
    id: "secure",
    icon: ShieldCheck,
    title: "Secure Booking",
    description: "Your data and payments are always protected",
  },
];

export function TrustBadgesRow({
  variant = "card",
}: {
  variant?: "card" | "plain";
}) {
  return (
    <div
      className={cn(
        variant === "card" && "rounded-2xl border border-border bg-white p-6"
      )}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.id} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
              <badge.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
