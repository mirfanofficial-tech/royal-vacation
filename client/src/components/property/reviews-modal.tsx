"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { format } from "date-fns";
import { Check, MessageSquareQuote, TrendingUp, X } from "lucide-react";
import type { GuestReview, ReviewCategory } from "@/lib/property-detail-mock-data";

function getFlag(code: string): string {
  const flags: Record<string, string> = {
    PK: "🇵🇰", GB: "🇬🇧", SA: "🇸🇦", AE: "🇦🇪", US: "🇺🇸",
    DE: "🇩🇪", FR: "🇫🇷", IN: "🇮🇳", AU: "🇦🇺", CA: "🇨🇦",
    JP: "🇯🇵", CN: "🇨🇳", IT: "🇮🇹", ES: "🇪🇸", BR: "🇧🇷",
  };
  return flags[code] ?? "🏳️";
}

function scoreLabel(score: number): string {
  if (score >= 9.3) return "Exceptional";
  if (score >= 8.6) return "Wonderful";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  if (score >= 5) return "Fair";
  return "Poor";
}

function fmtScore(score: number): string {
  return score >= 10 ? "10" : score.toFixed(1);
}

function fmtDate(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : format(d, "d MMMM yyyy");
}

const TRIP_FILTERS = ["Families", "Couples", "Solo", "Business"] as const;
type SortKey = "recent" | "high" | "low";

export function ReviewsModal({
  open,
  onClose,
  reviews,
  totalReviews,
  rating,
  ratingLabel,
  propertyName,
  location,
  categories,
  ratingTrend = "0.2",
}: {
  open: boolean;
  onClose: () => void;
  reviews: GuestReview[];
  totalReviews: number;
  rating: number;
  ratingLabel: string;
  propertyName: string;
  location?: string;
  categories?: ReviewCategory[];
  /** e.g. "0.2" — shown as "↑ 0.2 vs last year". */
  ratingTrend?: string;
}) {
  const [entered, setEntered] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "photos" | (typeof TRIP_FILTERS)[number]>(
    "all",
  );
  const [sort, setSort] = useState<SortKey>("recent");

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
    };
  }, [open, onClose]);

  const withPhotos = useMemo(() => reviews.filter((r) => r.photos.length > 0).length, [reviews]);

  const visibleReviews = useMemo(() => {
    let list = reviews;
    if (activeFilter === "photos") list = list.filter((r) => r.photos.length > 0);
    else if (activeFilter !== "all") {
      const needle = activeFilter.toLowerCase().replace(/s$/, "");
      list = list.filter((r) => r.tripInfo.toLowerCase().includes(needle));
    }
    const sorted = [...list];
    if (sort === "high") sorted.sort((a, b) => b.score - a.score);
    else if (sort === "low") sorted.sort((a, b) => a.score - b.score);
    else sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted;
  }, [reviews, activeFilter, sort]);

  if (!open) return null;

  const tabs: { key: typeof activeFilter; label: string }[] = [
    { key: "all", label: "All reviews" },
    { key: "photos", label: `With photos · ${withPhotos.toLocaleString()}` },
    ...TRIP_FILTERS.map((t) => ({ key: t, label: t })),
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${propertyName} guest reviews`}
      className={`fixed inset-0 z-[2500] flex items-start justify-center overflow-y-auto bg-navy-dark/60 p-4 backdrop-blur-sm transition-opacity duration-300 ease-out sm:items-center sm:p-8 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-full w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold text-navy">Guest reviews</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {propertyName}
              {location ? ` · ${location}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reviews"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-navy hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------- Summary bar ---------- */}
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex shrink-0 items-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-navy text-2xl font-bold text-white">
                {rating.toFixed(1)}
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-navy">{ratingLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {totalReviews.toLocaleString()} verified reviews
                </p>
                {ratingTrend && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-rating">
                    <TrendingUp className="h-3 w-3" />
                    {ratingTrend} vs last year
                  </p>
                )}
              </div>
            </div>

            {categories && categories.length > 0 && (
              <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                {categories.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cat.label}</span>
                      <span className="font-bold text-navy">{cat.score.toFixed(1)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-rating"
                        style={{ width: `${Math.min(100, cat.score * 10)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Filter / sort bar ---------- */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveFilter(t.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === t.key
                    ? "border-navy bg-navy text-white"
                    : "border-border text-foreground hover:border-navy hover:text-navy"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none focus-visible:border-navy"
            >
              <option value="recent">Most recent</option>
              <option value="high">Highest score</option>
              <option value="low">Lowest score</option>
            </select>
          </label>
        </div>

        {/* ---------- Review list ---------- */}
        <div className="flex-1 overflow-y-auto px-6">
          {visibleReviews.length > 0 ? (
            <ul className="divide-y divide-border">
              {visibleReviews.map((review) => {
                const visible = review.photos.slice(0, 2);
                const extra = review.photos.length - visible.length;
                return (
                  <li key={review.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-6">
                    {/* Reviewer */}
                    <div className="flex shrink-0 gap-3 sm:w-40 sm:flex-col sm:gap-2">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy">
                        {review.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">{review.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span aria-hidden>{getFlag(review.countryCode)}</span>
                          {review.country}
                        </p>
                        {review.tripInfo && (
                          <p className="mt-1 text-xs text-muted-foreground">{review.tripInfo}</p>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-rating px-2 py-1 text-xs font-bold text-white">
                          {fmtScore(review.score)}
                          <span className="font-semibold">{scoreLabel(review.score)}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {fmtDate(review.date)}
                        </span>
                      </div>

                      <p className="mt-3 flex gap-2 text-sm leading-relaxed text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-rating" />
                        <span>{review.text}</span>
                      </p>

                      {review.photos.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {visible.map((photo, i) => (
                            <div
                              key={photo}
                              className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md"
                            >
                              <Image
                                src={photo}
                                alt={`${review.name}'s photo ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          ))}
                          {extra > 0 && (
                            <div className="flex h-16 w-20 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                              +{extra}
                              <span className="text-[10px] font-normal">photos</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <MessageSquareQuote className="h-8 w-8" />
              <p className="text-sm">No reviews match this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
