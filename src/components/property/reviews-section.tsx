import { ReviewSummaryCard } from "@/components/property/review-summary-card";
import { ReviewCard } from "@/components/property/review-card";
import type { PropertyDetail } from "@/lib/property-detail-mock-data";

export function ReviewsSection({ property }: { property: PropertyDetail }) {
  return (
    <section id="reviews" className="scroll-mt-36">
      <h2 className="mb-3 font-heading text-xl font-bold text-navy">
        What guests loved the most
      </h2>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr_1fr]">
        <ReviewSummaryCard
          rating={property.rating}
          ratingLabel={property.ratingLabel}
          reviews={property.reviews}
          categories={property.reviewCategories}
        />
        {property.guestReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:border-navy hover:text-navy"
        >
          Show all {property.reviews.toLocaleString()} reviews
        </button>
      </div>
    </section>
  );
}
