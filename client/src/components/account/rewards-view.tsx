"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpCircle,
  BedDouble,
  Car,
  CheckCircle2,
  Coffee,
  Loader2,
  Lock,
  Wallet,
} from "lucide-react";

import type { BookingOut, UserOut } from "@royal-vacation/api-client";
import { ApiError, api, bookings } from "@/lib/api";

const LEVEL_1_AT = 2;
const LEVEL_2_AT = 5;

const TIERS = [
  {
    level: 1,
    perks: [
      { label: "10% off selected stays", icon: BedDouble },
      { label: "10% off rental cars", icon: Car },
    ],
  },
  {
    level: 2,
    perks: [
      { label: "10–15% off selected stays", icon: BedDouble },
      { label: "10–15% off rental cars", icon: Car },
      { label: "Free breakfast at selected stays", icon: Coffee },
      { label: "Free room upgrades when available", icon: ArrowUpCircle },
    ],
  },
];

export function RewardsView() {
  const [rows, setRows] = useState<BookingOut[] | null>(null);
  const [me, setMe] = useState<UserOut | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      bookings.list(),
      api.profile.get().catch(() => null),
    ])
      .then(([b, u]) => {
        setRows(b);
        setMe(u);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 401
            ? "Sign in to see your Genius rewards."
            : "We couldn't load your rewards.",
        );
        setRows([]);
      });
  }, []);

  if (rows === null) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const stays = rows.filter((b) => b.status === "confirmed" || b.status === "completed");
  const completed = rows.filter((b) => b.status === "completed").length;
  const totalSpent = rows
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);
  const currency = rows[0]?.currency ?? "AED";

  const count = stays.length;
  const level = count >= LEVEL_2_AT ? 2 : count >= LEVEL_1_AT ? 1 : 0;
  const target = level < 1 ? LEVEL_1_AT : LEVEL_2_AT;
  const remaining = Math.max(0, target - count);
  const progress = Math.min(100, Math.round((count / target) * 100));
  const activePerks = TIERS.filter((t) => t.level <= level).flatMap((t) => t.perks).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Genius status</p>
            <p className="font-heading text-xl font-bold text-navy">
              {level === 0 ? "Not enrolled yet" : `Genius Level ${level}`}
            </p>
          </div>
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy-dark">
            {activePerks} active reward{activePerks === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-navy" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {level >= 2
              ? "You've unlocked the highest Genius level. Enjoy!"
              : remaining === 0
                ? `You've completed enough stays for Level ${target === LEVEL_2_AT ? 2 : 1}.`
                : `You're ${remaining} completed stay${remaining === 1 ? "" : "s"} away from Genius Level ${level < 1 ? 1 : 2}.`}
          </p>
        </div>
      </div>

      {/* Real stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Stays booked", value: String(count) },
          { label: "Stays completed", value: String(completed) },
          {
            label: "Total spent",
            value: `${currency} ${totalSpent.toLocaleString()}`,
          },
          {
            label: "Member since",
            value: me ? format(new Date(me.created_at), "MMM yyyy") : "—",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-navy">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reward tiers */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-navy">Your rewards</h2>
        <div className="mt-4 flex flex-col gap-5">
          {TIERS.map((tier) => {
            const unlocked = tier.level <= level;
            return (
              <div key={tier.level}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {unlocked ? (
                    <CheckCircle2 className="h-4 w-4 text-rating" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  Genius Level {tier.level}
                  <span className="text-xs font-normal text-muted-foreground">
                    {unlocked
                      ? "Unlocked"
                      : `Unlocks at ${tier.level === 1 ? LEVEL_1_AT : LEVEL_2_AT} completed stays`}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {tier.perks.map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm ${
                        unlocked
                          ? "border-border text-foreground"
                          : "border-transparent bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wallet — genuinely empty, no credits system yet */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Wallet className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Credits &amp; vouchers</p>
            <p className="text-xs text-muted-foreground">
              You have no travel credits or vouchers yet.
            </p>
          </div>
          <span className="text-lg font-bold text-foreground">
            {currency} 0
          </span>
        </div>
      </div>

      <Link
        href="/account/trips"
        className="text-sm font-semibold text-navy hover:underline"
      >
        View your trips
      </Link>
    </div>
  );
}
