"use client";

import { useState } from "react";
import { ReviewSummaryCard } from "@/components/property/review-summary-card";
import { ReviewCard } from "@/components/property/review-card";
import { ReviewsModal } from "@/components/property/reviews-modal";
import type { PropertyDetail } from "@/lib/property-detail-mock-data";

export function ReviewsSection({ property }: { property: PropertyDetail }) {
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  return (
    <section id="reviews" className="scroll-mt-36">
      <h2 className="mb-4 font-heading text-xl font-bold text-navy">
        What guests loved the most
      </h2>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[240px_1fr_1fr_180px]">
        {/* Left: Rating summary with category bars */}
        <ReviewSummaryCard
          rating={property.rating}
          ratingLabel={property.ratingLabel}
          reviews={property.reviews}
          categories={property.reviewCategories}
        />

        {/* Middle: Individual review cards */}
        {property.guestReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {/* Right: Total reviews count card */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white p-6 text-center lg:self-stretch">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-navy"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">
              {property.reviews.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">guest reviews</p>
          </div>
          <button
            type="button"
            onClick={() => setReviewsModalOpen(true)}
            className="mt-1 text-sm font-semibold text-navy hover:underline"
          >
            Read all &rarr;
          </button>
        </div>
      </div>

      <ReviewsModal
        open={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        reviews={property.guestReviews}
        totalReviews={property.reviews}
        rating={property.rating}
        ratingLabel={property.ratingLabel}
        propertyName={property.name}
      />
    </section>
  );
}
