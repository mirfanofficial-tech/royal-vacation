export type SearchProperty = {
  id: string;
  lat: number;
  lng: number;
  badge?: { label: string; tone: "bestseller" | "discount" };
  image: string;
  thumbnails: string[];
  extraPhotosCount: number;
  name: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  distance: string;
  amenityTags: string[];
  quote: string;
  features: string[];
  freeCancellation: boolean;
  noPrepayment: boolean;
  originalPrice?: number;
  discountPercent?: number;
  price: number;
  currency: string;
  nights: number;
  totalPrice: number;
};

export const searchProperties: SearchProperty[] = [
  {
    id: "burj-al-arab",
    lat: 25.1412,
    lng: 55.1853,
    badge: { label: "Best Seller", tone: "bestseller" },
    image: "https://picsum.photos/seed/dubai-burj-al-arab/560/380",
    thumbnails: [
      "https://picsum.photos/seed/dubai-burj-al-arab-1/140/100",
      "https://picsum.photos/seed/dubai-burj-al-arab-2/140/100",
      "https://picsum.photos/seed/dubai-burj-al-arab-3/140/100",
    ],
    extraPhotosCount: 24,
    name: "Burj Al Arab Jumeirah",
    starRating: 5,
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 2847,
    location: "Jumeirah, Dubai",
    distance: "1.2 km from city center",
    amenityTags: ["Breakfast included", "Sea view", "Free WiFi"],
    quote: "Absolutely stunning experience. Luxury at its finest.",
    features: ["Private beach", "Spa & wellness centre", "Airport shuttle", "Family rooms"],
    freeCancellation: true,
    noPrepayment: true,
    originalPrice: 89900,
    discountPercent: 20,
    price: 71920,
    currency: "PKR",
    nights: 3,
    totalPrice: 215760,
  },
  {
    id: "atlantis-the-palm",
    lat: 25.1304,
    lng: 55.1171,
    image: "https://picsum.photos/seed/dubai-atlantis-palm/560/380",
    thumbnails: [
      "https://picsum.photos/seed/dubai-atlantis-1/140/100",
      "https://picsum.photos/seed/dubai-atlantis-2/140/100",
      "https://picsum.photos/seed/dubai-atlantis-3/140/100",
    ],
    extraPhotosCount: 32,
    name: "Atlantis, The Palm",
    starRating: 5,
    rating: 9.4,
    ratingLabel: "Wonderful",
    reviews: 3214,
    location: "Palm Jumeirah, Dubai",
    distance: "17.5 km from city center",
    amenityTags: ["Breakfast included", "Water park", "Beachfront"],
    quote: "Perfect for families and couples. Amazing water park!",
    features: ["Private beach", "Swimming pools (3)", "Spa", "Kids club"],
    freeCancellation: true,
    noPrepayment: false,
    originalPrice: 62000,
    discountPercent: 15,
    price: 52700,
    currency: "PKR",
    nights: 3,
    totalPrice: 158100,
  },
  {
    id: "address-downtown",
    lat: 25.1932,
    lng: 55.2794,
    image: "https://picsum.photos/seed/dubai-address-downtown/560/380",
    thumbnails: [
      "https://picsum.photos/seed/dubai-address-1/140/100",
      "https://picsum.photos/seed/dubai-address-2/140/100",
      "https://picsum.photos/seed/dubai-address-3/140/100",
    ],
    extraPhotosCount: 28,
    name: "Address Downtown",
    starRating: 5,
    rating: 9.2,
    ratingLabel: "Wonderful",
    reviews: 1932,
    location: "Downtown Dubai",
    distance: "0.5 km from city center",
    amenityTags: ["Breakfast included", "City view", "Free WiFi"],
    quote: "Best location with breathtaking Burj Khalifa view!",
    features: ["Infinity pool", "Fitness centre", "Spa", "5 restaurants"],
    freeCancellation: true,
    noPrepayment: false,
    price: 48500,
    currency: "PKR",
    nights: 3,
    totalPrice: 145500,
  },
  {
    id: "rove-downtown",
    lat: 25.1916,
    lng: 55.2799,
    image: "https://picsum.photos/seed/dubai-rove-downtown/560/380",
    thumbnails: [
      "https://picsum.photos/seed/dubai-rove-1/140/100",
      "https://picsum.photos/seed/dubai-rove-2/140/100",
      "https://picsum.photos/seed/dubai-rove-3/140/100",
    ],
    extraPhotosCount: 20,
    name: "Rove Downtown",
    starRating: 4,
    rating: 9.0,
    ratingLabel: "Excellent",
    reviews: 2145,
    location: "Downtown Dubai",
    distance: "1.0 km from city center",
    amenityTags: ["Free WiFi", "City view", "Modern rooms"],
    quote: "Clean, modern and great value for money!",
    features: ["Outdoor pool", "Fitness centre", "Restaurant", "24-hour front desk"],
    freeCancellation: true,
    noPrepayment: false,
    originalPrice: 28900,
    discountPercent: 10,
    price: 26010,
    currency: "PKR",
    nights: 3,
    totalPrice: 78030,
  },
];

export type CountFilter = { id: string; label: string; count: number };

export const starRatingFilters: CountFilter[] = [
  { id: "5", label: "5 stars", count: 214 },
  { id: "4", label: "4 stars", count: 198 },
  { id: "3", label: "3 stars", count: 126 },
  { id: "2", label: "2 stars", count: 54 },
  { id: "1", label: "1 star", count: 22 },
];

export const guestRatingFilters: CountFilter[] = [
  { id: "wonderful", label: "Wonderful 9+", count: 328 },
  { id: "very-good", label: "Very good 8+", count: 542 },
  { id: "good", label: "Good 7+", count: 618 },
];

export type IconCountFilter = CountFilter & {
  icon: "hotel" | "apartment" | "resort" | "villa" | "guesthouse" | "hostel";
};

export const propertyTypeFilters: IconCountFilter[] = [
  { id: "hotels", label: "Hotels", count: 412, icon: "hotel" },
  { id: "apartments", label: "Apartments", count: 124, icon: "apartment" },
  { id: "resorts", label: "Resorts", count: 68, icon: "resort" },
  { id: "villas", label: "Villas", count: 22, icon: "villa" },
  { id: "guesthouses", label: "Guest houses", count: 10, icon: "guesthouse" },
  { id: "hostels", label: "Hostels", count: 6, icon: "hostel" },
];

export type AmenityFilter = CountFilter & {
  icon: "wifi" | "pool" | "parking" | "breakfast" | "shuttle" | "spa" | "family" | "fitness";
};

export const amenityFilters: AmenityFilter[] = [
  { id: "wifi", label: "Free WiFi", count: 580, icon: "wifi" },
  { id: "pool", label: "Swimming pool", count: 342, icon: "pool" },
  { id: "parking", label: "Free parking", count: 298, icon: "parking" },
  { id: "breakfast", label: "Breakfast included", count: 421, icon: "breakfast" },
  { id: "shuttle", label: "Airport shuttle", count: 187, icon: "shuttle" },
  { id: "spa", label: "Spa & wellness", count: 156, icon: "spa" },
  { id: "family", label: "Family rooms", count: 276, icon: "family" },
  { id: "fitness", label: "Fitness centre", count: 203, icon: "fitness" },
];

export const mealFilters: CountFilter[] = [
  { id: "breakfast", label: "Breakfast included", count: 421 },
  { id: "all-inclusive", label: "All-inclusive", count: 86 },
  { id: "self-catering", label: "Self-catering", count: 112 },
];

export const cancellationFilters: CountFilter[] = [
  { id: "free-cancellation", label: "Free cancellation", count: 498 },
];

export const mapPins = [
  { id: "burj-al-arab", price: "PKR 71,920", lat: 25.1412, lng: 55.1853 },
  { id: "atlantis-the-palm", price: "PKR 52,700", lat: 25.1304, lng: 55.1171 },
  { id: "address-downtown", price: "PKR 43,200", lat: 25.1932, lng: 55.2794 },
  { id: "rove-downtown", price: "PKR 26,010", lat: 25.1916, lng: 55.2799 },
  { id: "pin-5", price: "PKR 34,900", lat: 25.2124, lng: 55.2841 },
];

export const decorativeMapPins = [
  { id: "amb-1", price: "PKR 33,400", lat: 25.1598, lng: 55.2891 },
  { id: "amb-2", price: "PKR 43,500", lat: 25.2088, lng: 55.2715 },
  { id: "amb-3", price: "PKR 38,700", lat: 25.2261, lng: 55.3301 },
  { id: "amb-4", price: "PKR 31,100", lat: 25.2561, lng: 55.3317 },
  { id: "amb-5", price: "PKR 22,300", lat: 25.1231, lng: 55.2121 },
  { id: "amb-6", price: "PKR 34,000", lat: 25.1181, lng: 55.2511 },
];

export const whyBookFeatures = [
  {
    id: "price",
    title: "Best Price Guarantee",
    description: "Find a lower price, we'll match it",
  },
  {
    id: "support",
    title: "24/7 Customer Support",
    description: "Always here to help you",
  },
  {
    id: "secure",
    title: "Secure Booking",
    description: "Your data is 100% protected",
  },
  {
    id: "flexible",
    title: "Flexible Cancellation",
    description: "Book with peace of mind",
  },
];

export const discoverDubaiLinks = [
  { id: "activities", label: "Activities" },
  { id: "city-tours", label: "City Tours" },
  { id: "yacht-tours", label: "Yacht Tours" },
  { id: "desert-safari", label: "Desert Safari" },
];

export type RecentlyViewedProperty = {
  id: string;
  name: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
};

export const recentlyViewed: RecentlyViewedProperty[] = [
  {
    id: "burj-khalifa-view",
    name: "Burj Khalifa",
    location: "Dubai",
    image: "https://picsum.photos/seed/dubai-recent-burj/120/120",
    price: 89900,
    currency: "PKR",
    rating: 9.6,
  },
  {
    id: "ritz-carlton",
    name: "The Ritz-Carlton",
    location: "Dubai",
    image: "https://picsum.photos/seed/dubai-recent-ritz/120/120",
    price: 76500,
    currency: "PKR",
    rating: 9.3,
  },
  {
    id: "jumeirah-beach-hotel",
    name: "Jumeirah Beach Hotel",
    location: "Dubai",
    image: "https://picsum.photos/seed/dubai-recent-jumeirah/120/120",
    price: 65200,
    currency: "PKR",
    rating: 9.1,
  },
];
