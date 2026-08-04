import Image from "next/image";
import { Tag, ShieldCheck, Heart } from "lucide-react";

const features = [
  {
    id: "deals",
    icon: Tag,
    title: "Exclusive Deals",
    description: "Access member-only prices and special offers.",
  },
  {
    id: "secure",
    icon: ShieldCheck,
    title: "Easy & Secure",
    description: "Quick booking with secure payments.",
  },
  {
    id: "personalized",
    icon: Heart,
    title: "Personalized Experience",
    description: "Save favorites and get personalized recommendations.",
  },
];

export function RegisterPromoPanel() {
  return (
    <div className="relative hidden overflow-hidden rounded-2xl lg:block">
      <div className="relative h-full min-h-[640px] w-full">
        <Image
          src="https://picsum.photos/seed/register-overwater-villa/900/1000"
          alt="Overwater villas at sunset"
          fill
          className="object-cover"
          sizes="480px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/50 to-navy-dark/20" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-8">
        <div>
          <h2 className="font-heading text-3xl font-bold text-white">
            Travel more, <span className="text-gold-light">Experience more</span>
          </h2>
          <p className="mt-3 text-sm text-white/85">
            Sign up today and start planning your perfect trip with exclusive deals and offers.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                <feature.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="text-xs text-white/75">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}
