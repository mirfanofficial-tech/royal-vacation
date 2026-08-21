import Image from "next/image";
import type { GuestReview } from "@/lib/property-detail-mock-data";

function getFlag(code: string): string {
  const flags: Record<string, string> = {
    PK: "🇵🇰", GB: "🇬🇧", SA: "🇸🇦", AE: "🇦🇪", US: "🇺🇸",
    DE: "🇩🇪", FR: "🇫🇷", IN: "🇮🇳", AU: "🇦🇺", CA: "🇨🇦",
    JP: "🇯🇵", CN: "🇨🇳", IT: "🇮🇹", ES: "🇪🇸", BR: "🇧🇷",
  };
  return flags[code] ?? "🏳️";
}

export function ReviewCard({ review }: { review: GuestReview }) {
  const maxVisible = 2;
  const visiblePhotos = review.photos.slice(0, maxVisible);
  const extraCount = review.photos.length - maxVisible;

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-white p-4">
      {/* ---------- Header row ---------- */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy">
            {review.name.charAt(0)}
          </span>

          {/* Name + flag */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">
              {review.name}
            </p>
            <span className="text-base leading-none" aria-label={review.country}>
              {getFlag(review.countryCode)}
            </span>
          </div>
        </div>

        {/* Rating badge */}
        <span
          className={`flex h-7 min-w-[2rem] shrink-0 items-center justify-center rounded-md px-2 text-xs font-bold text-white ${
            review.score >= 8 ? "bg-rating" : "bg-navy"
          }`}
        >
          {review.score}
        </span>
      </div>

      {/* ---------- Review text ---------- */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* ---------- Photo thumbnails ---------- */}
      {review.photos.length > 0 && (
        <div className="flex gap-1.5">
          {visiblePhotos.map((photo, index) => {
            const isLast = index === visiblePhotos.length - 1;
            const showOverlay = isLast && extraCount > 0;

            return (
              <div
                key={photo}
                className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md"
              >
                <Image
                  src={photo}
                  alt={`${review.name}'s review photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {showOverlay && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white">
                    +{extraCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Trip info footer ---------- */}
      {review.tripInfo && (
        <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a4 4 0 0 0-8 0v2" />
            <line x1="2" y1="11" x2="22" y2="11" />
          </svg>
          <span className="text-xs text-muted-foreground">
            {review.tripInfo}
          </span>
        </div>
      )}
    </div>
  );
}
