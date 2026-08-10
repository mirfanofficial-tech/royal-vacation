import Image from "next/image";
import { Tag, Calendar, Heart } from "lucide-react";

const features = [
  {
    id: "deals",
    icon: Tag,
    title: "Exclusive Member Deals",
    description: "Unlock member-only discounts and special offers.",
  },
  {
    id: "manage",
    icon: Calendar,
    title: "Easy Booking Management",
    description: "View, modify and manage all your bookings in one place.",
  },
  {
    id: "favorites",
    icon: Heart,
    title: "Save Your Favorites",
    description: "Save places you love and plan your perfect trip.",
  },
];

export function LoginPromoPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:block">
      <div className="relative h-full min-h-[680px] w-full">
        <Image
          src="https://picsum.photos/seed/login-santorini-cliff/900/1000"
          alt="Cliffside villa terrace at dusk"
          fill
          className="object-cover"
          sizes="480px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/55 to-navy-dark/30" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-10">
        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-light">
            <span className="h-px w-6 bg-gold-light" />
            Welcome back
          </span>
          <h2 className="font-heading text-3xl font-bold text-white">
            Continue your journey with Royal Vacation
          </h2>
          <p className="mt-3 text-sm text-white/85">
            Sign in to access exclusive deals, manage bookings and more.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-light/50 text-gold-light">
                <feature.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="text-xs text-white/75">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
