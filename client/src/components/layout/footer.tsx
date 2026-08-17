import Link from "next/link";
import { Crown, Apple, PlayCircle } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  XIcon,
  LinkedinIcon,
} from "@/components/icons/social-icons";

const footerColumns = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Blog", "Sitemap"],
  },
  {
    title: "Support",
    links: ["Help Center", "FAQs", "Cancellation Options", "Terms & Conditions", "Privacy Policy"],
  },
  {
    title: "Partner with us",
    links: ["List your property", "Affiliate Program", "Advertise with us", "API Partners"],
  },
  {
    title: "Top Destinations",
    links: ["Dubai", "Istanbul", "London", "Bali", "Paris"],
  },
];

const socialLinks = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: YoutubeIcon, label: "YouTube" },
  { icon: XIcon, label: "Twitter" },
  { icon: LinkedinIcon, label: "LinkedIn" },
];

const paymentMethods = ["VISA", "Mastercard", "JCB", "easypaisa", "JazzCash"];

export function Footer() {
  return (
    <footer className="mt-10 bg-navy">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-10 px-10 py-12 sm:grid-cols-3 lg:grid-cols-6 lg:px-24">
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Crown className="h-7 w-7 text-gold" strokeWidth={1.75} />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg font-bold text-white">ROYAL</span>
              <span className="text-[9px] font-semibold tracking-[0.3em] text-gold">
                VACATION
              </span>
            </span>
          </Link>
          <p className="text-sm text-white/70">
            Your trusted travel partner for unforgettable experiences in Dubai and beyond.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">{column.title}</h3>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-white/70 hover:text-white">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">Download the app</h3>
          <div className="flex flex-col gap-2">
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:border-white/40"
            >
              <Apple className="h-4 w-4" />
              App Store
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:border-white/40"
            >
              <PlayCircle className="h-4 w-4" />
              Google Play
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col-reverse items-center justify-between gap-4 px-10 py-6 sm:flex-row lg:px-24">
          <p className="text-xs text-white/60">
            © 2026 Royal Vacation. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <Icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
