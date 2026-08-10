import { featuredProperties, homesGuestsLove } from "@/lib/mock-data";
import { searchProperties } from "@/lib/search-mock-data";

export type WishlistCategory = "hotels" | "apartments" | "resorts";

export type WishlistProperty = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  ratingLabel: string;
  reviews: number;
  starRating: number;
  price: number;
  currency: string;
  freeCancellation: boolean;
  category: WishlistCategory;
};

function inferCategory(name: string): WishlistCategory {
  if (/apartment/i.test(name)) return "apartments";
  if (/resort|villa|cottage|guest ?house/i.test(name)) return "resorts";
  return "hotels";
}

/** Every property known to the site, in a common shape, so the wishlist page can
 * resolve favorited ids regardless of which page (home or search) they came from. */
export function getAllWishlistableProperties(): WishlistProperty[] {
  const fromHome = [...featuredProperties, ...homesGuestsLove].map((property) => ({
    id: property.id,
    name: property.name,
    location: property.location,
    image: property.image,
    rating: property.rating,
    ratingLabel: property.ratingLabel,
    reviews: property.reviews,
    starRating: property.rating >= 9.3 ? 5 : 4,
    price: property.price,
    currency: property.currency,
    freeCancellation: true,
    category: inferCategory(property.name),
  }));

  const fromSearch = searchProperties.map((property) => ({
    id: property.id,
    name: property.name,
    location: property.location,
    image: property.image,
    rating: property.rating,
    ratingLabel: property.ratingLabel,
    reviews: property.reviews,
    starRating: property.starRating,
    price: property.price,
    currency: property.currency,
    freeCancellation: property.freeCancellation,
    category: inferCategory(property.name),
  }));

  return [...fromHome, ...fromSearch];
}
