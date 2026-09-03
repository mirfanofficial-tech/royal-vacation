"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpCircle,
  BedDouble,
  Car,
  ChevronRight,
  Coffee,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  Lock,
  Luggage,
  Mail,
  MessageSquare,
  ReceiptText,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { bookings } from "@/lib/api";
import { getSession, type ClientSession } from "@/lib/auth";

const CONTAINER = "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-24";
const LEVEL_1_AT = 2;
const LEVEL_2_AT = 5;

const rewardTiles = [
  { label: "10% off stays", icon: BedDouble, level: 1 },
  { label: "10% discounts on rental cars", icon: Car, level: 1 },
  { label: "10-15% off stays", icon: BedDouble, level: 2 },
  { label: "10-15% discounts on rental cars", icon: Car, level: 2 },
  { label: "Free breakfasts", icon: Coffee, level: 2 },
  { label: "Free room upgrades", icon: ArrowUpCircle, level: 2 },
];

type Row = { label: string; href: string; icon: typeof UserRound };
const sections: { title: string; rows: Row[] }[] = [
  {
    title: "Payment information",
    rows: [
      { label: "Rewards & Wallet", href: "/account/rewards", icon: Wallet },
      { label: "Payment methods", href: "/account/payment-methods", icon: CreditCard },
      { label: "Transactions", href: "/account/transactions", icon: ReceiptText },
    ],
  },
  {
    title: "Manage account",
    rows: [
      { label: "Personal details", href: "/account/personal", icon: UserRound },
      { label: "Security settings", href: "/account/security", icon: Lock },
      { label: "Other travellers", href: "/account/travellers", icon: Users },
    ],
  },
  {
    title: "Preferences",
    rows: [
      { label: "Customisation preferences", href: "/account/preferences", icon: SlidersHorizontal },
      { label: "Email preferences", href: "/account/email-preferences", icon: Mail },
    ],
  },
  {
    title: "Travel activity",
    rows: [
      { label: "Trips and bookings", href: "/account/trips", icon: Luggage },
      { label: "Saved lists", href: "/account/saved", icon: Heart },
      { label: "My reviews", href: "/account/reviews", icon: MessageSquare },
    ],
  },
  {
    title: "Help and support",
    rows: [
      { label: "Contact Customer service", href: "/account/help", icon: HelpCircle },
      { label: "Safety resource centre", href: "/account/safety", icon: ShieldCheck },
      { label: "Dispute resolution", href: "/account/help", icon: Scale },
    ],
  },
  {
    title: "Legal and privacy",
    rows: [
      { label: "Privacy and data management", href: "/account/privacy", icon: ShieldCheck },
      { label: "Content guidelines", href: "/account/content-guidelines", icon: FileText },
    ],
  },
];

export function AccountDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [stayCount, setStayCount] = useState<number | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    bookings
      .list()
      .then((rows) =>
        setStayCount(
          rows.filter((b) => b.status === "confirmed" || b.status === "completed").length,
        ),
      )
      .catch(() => setStayCount(0));
  }, [router]);

  const firstName = session?.name.split(" ")[0] ?? "";
  const count = stayCount ?? 0;
  const level = count >= LEVEL_2_AT ? 2 : count >= LEVEL_1_AT ? 1 : 0;
  const activePerks = rewardTiles.filter((t) => t.level <= level).length;
  const remaining = Math.max(0, (level < 1 ? LEVEL_1_AT : LEVEL_2_AT) - count);

  return (
    <div className="flex-1 bg-muted/40 pb-12">
      {/* Hero */}
      <div className="bg-navy pb-20 pt-6 text-white sm:pb-24 sm:pt-8 md:pt-10">
        <div className={`${CONTAINER} flex items-center gap-3 sm:gap-4`}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-gold text-white sm:size-14">
            <UserRound className="size-5 sm:size-7" />
          </span>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold leading-tight break-words sm:text-3xl">
              Welcome{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-sm font-medium text-white/90">
              {level === 0 ? (
                "Book 2 stays to join Genius"
              ) : (
                <>
                  Genius <span className="text-gold">Level {level}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Rewards row */}
      <div
        className={`${CONTAINER} -mt-14 grid grid-cols-1 gap-4 sm:-mt-16 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]`}
      >
        <div className="min-w-0 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-heading text-lg font-bold text-navy">
            {stayCount === null
              ? "Loading your rewards…"
              : activePerks > 0
                ? `You have ${activePerks} Genius reward${activePerks === 1 ? "" : "s"}`
                : "Unlock Genius rewards"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Enjoy rewards and discounts on select stays and rental cars worldwide.
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
            <span className="rounded-full bg-gold px-2.5 py-1 text-navy-dark">Level 1</span>
            <span className="h-px flex-1 bg-border" />
            <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
              Level 2
            </span>
          </div>

          <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
            {rewardTiles.map((tile) => {
              const Icon = tile.icon;
              const unlocked = tile.level <= level;
              return (
                <div
                  key={tile.label}
                  className={`flex w-36 shrink-0 snap-start flex-col justify-between rounded-xl border p-3 sm:w-40 ${
                    unlocked
                      ? "border-border bg-white"
                      : "border-transparent bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <Icon
                      className={`size-6 ${unlocked ? "text-navy" : "text-muted-foreground"}`}
                    />
                    <ChevronRight className="size-4 opacity-60" />
                  </div>
                  <p className="mt-4 text-sm font-semibold">{tile.label}</p>
                </div>
              );
            })}
          </div>

          <Link
            href="/account/rewards"
            className="mt-3 inline-block text-sm font-semibold text-navy hover:underline"
          >
            Learn more about your rewards
          </Link>
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:flex-row lg:flex-col">
          <div className="flex-1 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold text-foreground">
              {level >= 2
                ? "You've reached the top Genius level"
                : `You're ${remaining} completed stay${remaining === 1 ? "" : "s"} away from Genius Level ${level < 1 ? 1 : 2}`}
            </p>
            <Link
              href="/account/rewards"
              className="mt-3 inline-block text-sm font-semibold text-navy hover:underline"
            >
              Check your progress
            </Link>
          </div>
          <div className="flex-1 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No Credits or vouchers yet</p>
              <span className="text-lg font-bold text-foreground">0</span>
            </div>
            <Link
              href="/account/rewards"
              className="mt-3 inline-block text-sm font-semibold text-navy hover:underline"
            >
              Go to Wallet
            </Link>
          </div>
        </div>
      </div>

      {/* Sections grid */}
      <div
        className={`${CONTAINER} mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}
      >
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5"
          >
            <h3 className="font-heading text-base font-bold text-navy">{section.title}</h3>
            <ul className="mt-2 -mx-2">
              {section.rows.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">{label}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
