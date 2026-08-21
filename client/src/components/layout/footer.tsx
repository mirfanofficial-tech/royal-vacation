import Link from "next/link";
import { Apple, PlayCircle } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  XIcon,
  LinkedinIcon,
} from "@/components/icons/social-icons";
import { Logo } from "@/components/icons/logo";
import { api } from "@/lib/api";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

// Fallback content — used per-column whenever that column's CMS menu
// (location `footer-*`) hasn't been configured yet, so migrating one column
// at a time in the admin never breaks the others.
const footerColumns: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Sitemap", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "FAQs", href: "#" },
      { label: "Cancellation Options", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
  {
    title: "Partner with us",
    links: [
      { label: "List your property", href: "#" },
      { label: "Affiliate Program", href: "#" },
      { label: "Advertise with us", href: "#" },
      { label: "API Partners", href: "#" },
    ],
  },
  {
    title: "Top Destinations",
    links: [
      { label: "Dubai", href: "#" },
      { label: "Istanbul", href: "#" },
      { label: "London", href: "#" },
      { label: "Bali", href: "#" },
      { label: "Paris", href: "#" },
    ],
  },
];

const FOOTER_MENU_LOCATIONS = [
  "footer-company",
  "footer-support",
  "footer-partner",
  "footer-destinations",
];

const socialLinks = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: YoutubeIcon, label: "YouTube" },
  { icon: XIcon, label: "Twitter" },
  { icon: LinkedinIcon, label: "LinkedIn" },
];

const paymentMethods = ["VISA", "Mastercard", "JCB", "easypaisa", "JazzCash"];

export async function Footer() {
  const cmsMenus = await Promise.all(
    FOOTER_MENU_LOCATIONS.map((location) => api.cms.menus.get(location).catch(() => null))
  );

  const columns: FooterColumn[] = footerColumns.map((fallback, index) => {
    const menu = cmsMenus[index];
    if (!menu) return fallback;
    return {
      title: menu.name,
      links: menu.items.map((item) => ({
        label: item.label,
        href: item.page_slug ? `/pages/${item.page_slug}` : (item.url ?? "#"),
      })),
    };
  });

  return (
    <footer className="mt-10 bg-navy">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-10 px-4 sm:px-6 py-12 sm:grid-cols-3 lg:grid-cols-6 lg:px-24">
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
          </Link>
          <p className="text-sm text-white/70">
            Your trusted travel partner for unforgettable experiences in Dubai and beyond.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h3 className="relative pb-2 text-sm font-semibold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-6 after:bg-gold after:content-['']">
              {column.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-sm text-white/70 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 after:content-[''] hover:text-white hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <h3 className="relative pb-2 text-sm font-semibold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-6 after:bg-gold after:content-['']">
            Download the app
          </h3>
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
        <div className="mx-auto flex max-w-[1400px] flex-col-reverse items-center justify-between gap-4 px-4 sm:px-6 py-6 sm:flex-row lg:px-24">
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
