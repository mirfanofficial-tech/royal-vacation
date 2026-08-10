import { Heart, MapPin, Star, ShieldCheck, Tag, RotateCcw, Headset } from "lucide-react";

const benefits = [
  {
    id: "price",
    icon: ShieldCheck,
    title: "Best price guarantee",
    description: "Get the best prices available online.",
  },
  {
    id: "deals",
    icon: Tag,
    title: "Exclusive deals",
    description: "Access special member-only offers.",
  },
  {
    id: "flexible",
    icon: RotateCcw,
    title: "Flexible booking",
    description: "Free cancellation on most properties.",
  },
  {
    id: "support",
    icon: Headset,
    title: "24/7 support",
    description: "We're here to help anytime.",
  },
];

export function WishlistSidebar({
  totalProperties,
  destinationCount,
  averageRating,
}: {
  totalProperties: number;
  destinationCount: number;
  averageRating: number | null;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-navy">Wishlist summary</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Heart className="h-4 w-4" />
            </span>
            <dt className="flex-1 text-muted-foreground">Total properties</dt>
            <dd className="font-semibold text-foreground">{totalProperties}</dd>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
              <MapPin className="h-4 w-4" />
            </span>
            <dt className="flex-1 text-muted-foreground">Destinations</dt>
            <dd className="font-semibold text-foreground">{destinationCount}</dd>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Star className="h-4 w-4" />
            </span>
            <dt className="flex-1 text-muted-foreground">Average rating</dt>
            <dd className="font-semibold text-foreground">
              {averageRating !== null ? averageRating.toFixed(1) : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-navy">Your benefits</h2>
        <ul className="flex flex-col gap-3">
          {benefits.map((benefit) => (
            <li key={benefit.id} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                <benefit.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
