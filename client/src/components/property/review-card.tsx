import Image from "next/image";
import type { GuestReview } from "@/lib/property-detail-mock-data";

export function ReviewCard({ review }: { review: GuestReview }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy">
            {review.name.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{review.name}</p>
            <p className="text-xs text-muted-foreground">{review.country}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex h-6 min-w-6 items-center justify-center rounded bg-rating px-1.5 text-xs font-bold text-white">
            {review.score}
          </span>
          <span className="text-[11px] text-muted-foreground">{review.date}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">&ldquo;{review.text}&rdquo;</p>

      <div className="flex gap-1.5">
        {review.photos.map((photo, index) => (
          <div key={photo} className="relative h-14 w-16 overflow-hidden rounded-md">
            <Image
              src={photo}
              alt={`${review.name}'s review photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
