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
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rating text-lg font-bold text-white">
          {rating.toFixed(1)}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{ratingLabel}</p>
          <p className="text-xs text-muted-foreground">{reviews.toLocaleString()} reviews</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((category) => (
          <li key={category.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{category.label}</span>
            <span className="font-semibold text-foreground">{category.score.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
