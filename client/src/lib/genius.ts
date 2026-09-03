import { format } from "date-fns";

import type { BookingOut, GeniusLevelPublicOut, UserOut } from "@royal-vacation/api-client";
import {
  geniusLevels,
  geniusMember,
  qualifyingStays as mockQualifyingStays,
  type QualifyingStay,
} from "@/lib/genius-mock-data";

/** A loyalty tier as the /genius page consumes it — same shape whether it came
 *  from the admin-configured backend or the static fallback. */
export type GeniusTier = {
  name: string;
  staysRequired: number;
  discountPercent: number;
  benefits: string[];
};

/** Fallback used until the backend responds (or if it has no active levels). */
export const STATIC_TIERS: GeniusTier[] = geniusLevels.map((l) => ({
  name: l.name,
  staysRequired: l.staysRequired,
  discountPercent: l.discountPercent,
  benefits: [...l.benefits],
}));

/** Map the public `GET /genius/levels` payload to GeniusTier[]. */
export function tiersFromApi(levels: GeniusLevelPublicOut[]): GeniusTier[] {
  return [...levels]
    .sort((a, b) => a.tier - b.tier)
    .map((l) => ({
      name: l.name,
      staysRequired: l.stays_required,
      discountPercent: Math.round(Number(l.discount_percent)),
      benefits: l.benefits.map((b) => b.label),
    }));
}

/** Completed/booked-stay counts that unlock each level (static fallback). */
export const LEVEL_THRESHOLDS = STATIC_TIERS.map((l) => l.staysRequired);

export type GeniusView = {
  /** true once real booking/profile data has been loaded for a signed-in user. */
  signedIn: boolean;
  firstName: string;
  fullName: string;
  membershipNumber: string;
  memberSince: string;
  /** 0-based index into geniusLevels of the highest unlocked level (0 when not yet enrolled). */
  levelIndex: number;
  /** true once the member has enough qualifying stays for Level 1. */
  enrolled: boolean;
  qualifyingStays: number;
  totalSaved: number;
  totalNights: number;
  currency: string;
  stays: QualifyingStay[];
};

/** Shown to signed-out visitors so the marketing page still looks complete. */
export const SAMPLE_GENIUS_VIEW: GeniusView = {
  signedIn: false,
  firstName: geniusMember.firstName,
  fullName: geniusMember.fullName,
  membershipNumber: geniusMember.membershipNumber,
  memberSince: geniusMember.memberSince,
  levelIndex: geniusMember.levelIndex,
  enrolled: true,
  qualifyingStays: geniusMember.qualifyingStays,
  totalSaved: geniusMember.totalSaved,
  totalNights: 18,
  currency: geniusMember.currency,
  stays: mockQualifyingStays,
};

function membershipNumber(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, "");
  let digits = "0";
  try {
    digits = BigInt(`0x${hex || "0"}`).toString();
  } catch {
    digits = "0";
  }
  digits = digits.padStart(12, "0").slice(-12);
  return `RV ${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}

/** Derive a member's Genius standing from their real bookings + profile,
 *  against the given tier config (admin-managed, or the static fallback). */
export function buildGeniusView(
  rows: BookingOut[],
  me: UserOut | null,
  tiers: GeniusTier[] = STATIC_TIERS,
): GeniusView {
  const thresholds = (tiers.length ? tiers : STATIC_TIERS).map((t) => t.staysRequired);
  const active = rows.filter((b) => b.status !== "cancelled");
  const qualifying = rows.filter((b) => b.status === "confirmed" || b.status === "completed");
  const count = qualifying.length;

  let levelIndex = 0;
  for (let i = thresholds.length - 1; i >= 0; i -= 1) {
    if (count >= thresholds[i]!) {
      levelIndex = i;
      break;
    }
  }
  const enrolled = count >= (thresholds[0] ?? 2);

  const totalSaved = active.reduce((sum, b) => sum + Number(b.promo_discount || 0), 0);
  const totalNights = qualifying.reduce((sum, b) => sum + b.nights, 0);
  const currency = rows[0]?.currency ?? me?.preferred_currency ?? "AED";

  const first =
    me?.first_name?.trim() || me?.display_name?.trim()?.split(" ")[0] || "traveller";
  const last = me?.last_name?.trim() ?? "";

  const stays: QualifyingStay[] = [...active]
    .sort((a, b) => +new Date(b.check_in) - +new Date(a.check_in))
    .map((b) => ({
      id: b.id,
      propertyName: b.property_name,
      location: b.location ?? "",
      dateRange: `${format(new Date(b.check_in), "d MMM")} — ${format(
        new Date(b.check_out),
        "d MMM yyyy",
      )}`,
      status: b.status === "completed" ? "completed" : "upcoming",
      savedAmount: Number(b.promo_discount) || undefined,
    }));

  return {
    signedIn: true,
    firstName: first,
    fullName: `${first}${last ? ` ${last}` : ""}`.trim(),
    membershipNumber: me ? membershipNumber(me.id) : "RV — — —",
    memberSince: me ? format(new Date(me.created_at), "MMMM yyyy") : "—",
    levelIndex,
    enrolled,
    qualifyingStays: count,
    totalSaved,
    totalNights,
    currency,
    stays,
  };
}
