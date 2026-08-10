import Image from "next/image";
import { format } from "date-fns";
import { Star, MapPin, Calendar, Moon, Users2 } from "lucide-react";

export function PropertySummaryCard({
  propertyName,
  propertyImage,
  starRating,
  rating,
  ratingLabel,
  reviews,
  location,
  checkIn,
  checkOut,
  nights,
  adults,
  rooms,
}: {
  propertyName: string;
  propertyImage: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  rooms: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
          <Image src={propertyImage} alt={propertyName} fill className="object-cover" sizes="112px" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold text-navy">{propertyName}</h2>
          <span className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: starRating }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </span>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="flex h-6 min-w-6 items-center justify-center rounded bg-navy px-1.5 text-xs font-bold text-white">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-foreground">{ratingLabel}</span>
            <span className="text-xs text-muted-foreground">
              {reviews.toLocaleString()} reviews
            </span>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {location}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-4">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="font-semibold text-foreground">{format(checkIn, "EEE, d MMM yyyy")}</p>
            <p className="text-xs text-muted-foreground">3:00 PM</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="font-semibold text-foreground">{format(checkOut, "EEE, d MMM yyyy")}</p>
            <p className="text-xs text-muted-foreground">12:00 PM</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Moon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold text-foreground">{nights} Nights</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Users2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Guests &amp; Rooms</p>
            <p className="font-semibold text-foreground">
              {adults} Adults, {rooms} Room{rooms > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
