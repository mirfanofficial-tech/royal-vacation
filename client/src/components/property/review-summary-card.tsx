import type { ReviewCategory } from "@/lib/property-detail-mock-data";

export function ReviewSummaryCard({
  rating,
  ratingLabel,
  reviews,
  categories,
}: {
  rating: number;
  ratingLabel: string;
  reviews: number;
  categories: ReviewCategory[];
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* Rating badge + label */}
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-navy text-xl font-extrabold text-white">
          {rating.toFixed(1)}
        </span>
        <div>
          <p className="text-base font-bold text-navy">{ratingLabel}</p>
          <p className="text-sm text-muted-foreground">
            {reviews.toLocaleString()} reviews
          </p>
        </div>
      </div>

      {/* Category ratings */}
      <ul className="mt-5 flex flex-col gap-3">
        {categories.map((category) => (
          <li key={category.label} className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-muted-foreground">
              {category.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-rating"
                style={{ width: `${(category.score / 10) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-semibold text-navy">
              {category.score.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
