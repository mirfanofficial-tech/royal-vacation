import { format } from "date-fns";

import type { BookingOut, UserOut } from "@royal-vacation/api-client";
import {
  geniusLevels,
  geniusMember,
  qualifyingStays as mockQualifyingStays,
  type QualifyingStay,
} from "@/lib/genius-mock-data";

/** Completed/booked-stay counts that unlock each level — mirrors geniusLevels[].staysRequired. */
export const LEVEL_THRESHOLDS = geniusLevels.map((l) => l.staysRequired);

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

/** Derive a member's Genius standing from their real bookings + profile. */
export function buildGeniusView(rows: BookingOut[], me: UserOut | null): GeniusView {
  const active = rows.filter((b) => b.status !== "cancelled");
  const qualifying = rows.filter((b) => b.status === "confirmed" || b.status === "completed");
  const count = qualifying.length;

  let levelIndex = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (count >= LEVEL_THRESHOLDS[i]!) {
      levelIndex = i;
      break;
    }
  }
  const enrolled = count >= (LEVEL_THRESHOLDS[0] ?? 2);

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
