"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, MessageSquareQuote } from "lucide-react";
import { ReviewCard } from "@/components/property/review-card";
import type { GuestReview } from "@/lib/property-detail-mock-data";

export function ReviewsModal({
  open,
  onClose,
  reviews,
  totalReviews,
  rating,
  ratingLabel,
  propertyName,
}: {
  open: boolean;
  onClose: () => void;
  reviews: GuestReview[];
  totalReviews: number;
  rating: number;
  ratingLabel: string;
  propertyName: string;
}) {
  const [entered, setEntered] = useState(false);

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

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${propertyName} guest reviews`}
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-dark/60 p-4 backdrop-blur-sm transition-opacity duration-300 ease-out sm:items-center sm:p-8 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rating text-base font-bold text-white">
              {rating.toFixed(1)}
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-navy">{ratingLabel}</h2>
              <p className="text-xs text-muted-foreground">
                {totalReviews.toLocaleString()} verified reviews for {propertyName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reviews"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <MessageSquareQuote className="h-8 w-8" />
              <p className="text-sm">No individual reviews to show yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
