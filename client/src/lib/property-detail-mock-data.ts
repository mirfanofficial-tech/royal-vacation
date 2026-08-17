export type RoomOption = {
  id: string;
  name: string;
  image: string;
  beds: string;
  maxGuests: number;
  size: string;
  view: string;
  breakfastIncluded: boolean;
  freeCancellationBefore: string;
  payAtProperty: boolean;
  price: number;
};

export type ReviewCategory = { label: string; score: number };

export type GuestReview = {
  id: string;
  name: string;
  country: string;
  date: string;
  score: number;
  text: string;
  photos: string[];
};

export type QuickFacilityIcon =
  | "beach"
  | "shuttle"
  | "wifi"
  | "pool"
  | "spa"
  | "family"
  | "fitness"
  | "restaurant";

export type PropertyDetail = {
  id: string;
  name: string;
  badge?: string;
  starRating: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  location: string;
  lat: number;
  lng: number;
  distance: string;
  country: string;
  city: string;
  price: number;
  currency: string;
  heroImage: string;
  heroBadge: string;
  galleryImages: string[];
  extraPhotosCount: number;
  aboutShort: string;
  aboutMore: string;
  quickFacilities: { icon: QuickFacilityIcon; label: string }[];
  popularFacilities: string[];
  rooms: RoomOption[];
  reviewCategories: ReviewCategory[];
  guestReviews: GuestReview[];
  highlights: string[];
  demandNote: string;
};

export const propertyDetails: Record<string, PropertyDetail> = {
  "burj-al-arab": {
    id: "burj-al-arab",
    name: "Burj Al Arab Jumeirah",
    badge: "Bestseller",
    starRating: 5,
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 1348,
    location: "Jumeirah Beach, Dubai, UAE",
    lat: 25.1412,
    lng: 55.1853,
    distance: "1.2 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 68000,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/burj-hero-view/900/700",
    heroBadge: "Best View",
    galleryImages: [
      "https://picsum.photos/seed/burj-lobby/500/380",
      "https://picsum.photos/seed/burj-terrace/500/380",
      "https://picsum.photos/seed/burj-pool/500/380",
      "https://picsum.photos/seed/burj-suite/500/380",
    ],
    extraPhotosCount: 85,
    aboutShort:
      "Towering 321 meters above the Arabian Gulf, Burj Al Arab Jumeirah is an iconic symbol of modern Dubai. This world-famous 7-star hotel offers unmatched luxury, exquisite restaurants, a private beach, and legendary service.",
    aboutMore:
      "Every suite spans at least two floors and comes with a dedicated butler service around the clock. Guests are chauffeured in a Rolls-Royce fleet and can dine at award-winning restaurants including Al Muntaha, suspended 200 meters above the sea.",
    quickFacilities: [
      { icon: "beach", label: "Private beach" },
      { icon: "shuttle", label: "Airport shuttle" },
      { icon: "wifi", label: "Free WiFi" },
      { icon: "pool", label: "Pool" },
      { icon: "spa", label: "Spa & wellness" },
      { icon: "family", label: "Family rooms" },
    ],
    popularFacilities: [
      "Outdoor swimming pool",
      "Beachfront",
      "Free WiFi",
      "Airport shuttle",
      "Family rooms",
      "Spa and wellness center",
      "5 restaurants",
      "Free parking",
      "Bar",
      "Private beach area",
    ],
    rooms: [
      {
        id: "deluxe-one-bedroom",
        name: "Deluxe One Bedroom Suite",
        image: "https://picsum.photos/seed/burj-room-1/300/220",
        beds: "1 King bed",
        maxGuests: 2,
        size: "105 m²",
        view: "Sea view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 8, 2024",
        payAtProperty: true,
        price: 68000,
      },
      {
        id: "panoramic-two-bedroom",
        name: "Panoramic Two Bedroom Suite",
        image: "https://picsum.photos/seed/burj-room-2/300/220",
        beds: "2 King beds",
        maxGuests: 4,
        size: "170 m²",
        view: "Sea view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 8, 2024",
        payAtProperty: true,
        price: 92000,
      },
      {
        id: "royal-three-bedroom",
        name: "Royal Three Bedroom Suite",
        image: "https://picsum.photos/seed/burj-room-3/300/220",
        beds: "3 King beds",
        maxGuests: 6,
        size: "280 m²",
        view: "Sea view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 8, 2024",
        payAtProperty: true,
        price: 150000,
      },
    ],
    reviewCategories: [
      { label: "Cleanliness", score: 9.7 },
      { label: "Comfort", score: 9.7 },
      { label: "Location", score: 9.6 },
      { label: "Facilities", score: 9.6 },
      { label: "Staff", score: 9.8 },
      { label: "Value for money", score: 8.9 },
    ],
    guestReviews: [
      {
        id: "review-hassan",
        name: "Hassan",
        country: "Pakistan",
        date: "May 2, 2024",
        score: 10,
        text: "Everything was perfect! The service, the view, the food - simply world-class. Will definitely come again.",
        photos: [
          "https://picsum.photos/seed/burj-review-1a/120/90",
          "https://picsum.photos/seed/burj-review-1b/120/90",
          "https://picsum.photos/seed/burj-review-1c/120/90",
        ],
      },
      {
        id: "review-ayesha",
        name: "Ayesha",
        country: "Pakistan",
        date: "Apr 28, 2024",
        score: 9,
        text: "Unbeatable experience. The staff was extremely cooperative and the suite was amazing.",
        photos: [
          "https://picsum.photos/seed/burj-review-2a/120/90",
          "https://picsum.photos/seed/burj-review-2b/120/90",
          "https://picsum.photos/seed/burj-review-2c/120/90",
        ],
      },
    ],
    highlights: [
      "Iconic 7-star hotel",
      "Stunning sea views",
      "Private beach",
      "World-class dining",
      "Award-winning spa",
    ],
    demandNote: "Booked 12 times in the last 24 hours",
  },

  "atlantis-the-palm": {
    id: "atlantis-the-palm",
    name: "Atlantis, The Palm",
    starRating: 5,
    rating: 9.4,
    ratingLabel: "Wonderful",
    reviews: 3214,
    location: "Palm Jumeirah, Dubai, UAE",
    lat: 25.1304,
    lng: 55.1171,
    distance: "17.5 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 52700,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/atlantis-hero/900/700",
    heroBadge: "Best View",
    galleryImages: [
      "https://picsum.photos/seed/atlantis-lobby/500/380",
      "https://picsum.photos/seed/atlantis-waterpark/500/380",
      "https://picsum.photos/seed/atlantis-pool/500/380",
      "https://picsum.photos/seed/atlantis-suite/500/380",
    ],
    extraPhotosCount: 62,
    aboutShort:
      "Set on the crescent of Palm Jumeirah, Atlantis, The Palm blends an underwater aquarium, a sprawling water park, and beachfront luxury into one unforgettable island resort.",
    aboutMore:
      "Families can explore Aquaventure Waterpark and The Lost Chambers Aquarium, while couples unwind at ShuiQi Spa. The resort's private beach and lagoon pools stretch across the outer edge of Palm Jumeirah.",
    quickFacilities: [
      { icon: "beach", label: "Private beach" },
      { icon: "pool", label: "Water park" },
      { icon: "wifi", label: "Free WiFi" },
      { icon: "family", label: "Kids club" },
      { icon: "spa", label: "Spa" },
      { icon: "restaurant", label: "25 restaurants" },
    ],
    popularFacilities: [
      "Outdoor swimming pools (3)",
      "Beachfront",
      "Free WiFi",
      "Kids club",
      "Family rooms",
      "ShuiQi Spa",
      "Aquaventure Waterpark",
      "Free parking",
      "Bar",
      "Private beach area",
    ],
    rooms: [
      {
        id: "ocean-deluxe",
        name: "Ocean Deluxe Room",
        image: "https://picsum.photos/seed/atlantis-room-1/300/220",
        beds: "2 Queen beds",
        maxGuests: 3,
        size: "48 m²",
        view: "Ocean view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 10, 2024",
        payAtProperty: true,
        price: 52700,
      },
      {
        id: "imperial-club",
        name: "Imperial Club Room",
        image: "https://picsum.photos/seed/atlantis-room-2/300/220",
        beds: "1 King bed",
        maxGuests: 2,
        size: "56 m²",
        view: "Palm view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 10, 2024",
        payAtProperty: false,
        price: 64500,
      },
      {
        id: "two-bedroom-suite",
        name: "Two Bedroom Suite",
        image: "https://picsum.photos/seed/atlantis-room-3/300/220",
        beds: "2 King beds",
        maxGuests: 5,
        size: "180 m²",
        view: "Ocean view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 10, 2024",
        payAtProperty: true,
        price: 98000,
      },
    ],
    reviewCategories: [
      { label: "Cleanliness", score: 9.4 },
      { label: "Comfort", score: 9.3 },
      { label: "Location", score: 9.5 },
      { label: "Facilities", score: 9.6 },
      { label: "Staff", score: 9.4 },
      { label: "Value for money", score: 8.7 },
    ],
    guestReviews: [
      {
        id: "review-sara",
        name: "Sara",
        country: "United Kingdom",
        date: "Mar 14, 2024",
        score: 9,
        text: "Perfect for families and couples. Amazing water park and the kids never wanted to leave!",
        photos: [
          "https://picsum.photos/seed/atlantis-review-1a/120/90",
          "https://picsum.photos/seed/atlantis-review-1b/120/90",
          "https://picsum.photos/seed/atlantis-review-1c/120/90",
        ],
      },
      {
        id: "review-omar",
        name: "Omar",
        country: "Saudi Arabia",
        date: "Feb 20, 2024",
        score: 9,
        text: "Beautiful property with excellent service. The aquarium suite was a unique experience.",
        photos: [
          "https://picsum.photos/seed/atlantis-review-2a/120/90",
          "https://picsum.photos/seed/atlantis-review-2b/120/90",
          "https://picsum.photos/seed/atlantis-review-2c/120/90",
        ],
      },
    ],
    highlights: [
      "Aquaventure Waterpark access",
      "Private beach",
      "Underwater aquarium suites",
      "25 restaurants & bars",
      "Award-winning spa",
    ],
    demandNote: "Booked 34 times in the last 24 hours",
  },

  "address-downtown": {
    id: "address-downtown",
    name: "Address Downtown",
    starRating: 5,
    rating: 9.2,
    ratingLabel: "Wonderful",
    reviews: 1932,
    location: "Downtown Dubai, UAE",
    lat: 25.1932,
    lng: 55.2794,
    distance: "0.5 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 48500,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/address-hero/900/700",
    heroBadge: "Best Location",
    galleryImages: [
      "https://picsum.photos/seed/address-lobby/500/380",
      "https://picsum.photos/seed/address-pool/500/380",
      "https://picsum.photos/seed/address-restaurant/500/380",
      "https://picsum.photos/seed/address-suite/500/380",
    ],
    extraPhotosCount: 41,
    aboutShort:
      "Rising beside the Burj Khalifa and Dubai Fountain, Address Downtown puts you at the centre of the city's skyline, with direct access to The Dubai Mall.",
    aboutMore:
      "The infinity pool overlooks the fountain show, and five in-house restaurants serve everything from modern Indian cuisine to rooftop cocktails with panoramic views of the world's tallest building.",
    quickFacilities: [
      { icon: "pool", label: "Infinity pool" },
      { icon: "fitness", label: "Fitness centre" },
      { icon: "wifi", label: "Free WiFi" },
      { icon: "spa", label: "Spa" },
      { icon: "restaurant", label: "5 restaurants" },
      { icon: "shuttle", label: "Valet parking" },
    ],
    popularFacilities: [
      "Infinity pool",
      "Fountain view",
      "Free WiFi",
      "Fitness centre",
      "Family rooms",
      "Spa and wellness centre",
      "5 restaurants",
      "Valet parking",
      "Bar",
      "Direct mall access",
    ],
    rooms: [
      {
        id: "fountain-view-room",
        name: "Fountain View Room",
        image: "https://picsum.photos/seed/address-room-1/300/220",
        beds: "1 King bed",
        maxGuests: 2,
        size: "50 m²",
        view: "Fountain view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 5, 2024",
        payAtProperty: true,
        price: 48500,
      },
      {
        id: "burj-view-suite",
        name: "Burj Khalifa View Suite",
        image: "https://picsum.photos/seed/address-room-2/300/220",
        beds: "1 King bed",
        maxGuests: 2,
        size: "75 m²",
        view: "City view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 5, 2024",
        payAtProperty: false,
        price: 61000,
      },
      {
        id: "two-bedroom-residence",
        name: "Two Bedroom Residence",
        image: "https://picsum.photos/seed/address-room-3/300/220",
        beds: "2 King beds",
        maxGuests: 4,
        size: "140 m²",
        view: "Fountain view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 5, 2024",
        payAtProperty: true,
        price: 89000,
      },
    ],
    reviewCategories: [
      { label: "Cleanliness", score: 9.3 },
      { label: "Comfort", score: 9.1 },
      { label: "Location", score: 9.8 },
      { label: "Facilities", score: 9.2 },
      { label: "Staff", score: 9.3 },
      { label: "Value for money", score: 8.6 },
    ],
    guestReviews: [
      {
        id: "review-fatima",
        name: "Fatima",
        country: "Pakistan",
        date: "Jan 18, 2024",
        score: 9,
        text: "Best location with breathtaking Burj Khalifa view! Walking distance to everything.",
        photos: [
          "https://picsum.photos/seed/address-review-1a/120/90",
          "https://picsum.photos/seed/address-review-1b/120/90",
          "https://picsum.photos/seed/address-review-1c/120/90",
        ],
      },
      {
        id: "review-ali",
        name: "Ali",
        country: "UAE",
        date: "Jan 3, 2024",
        score: 9,
        text: "Watching the fountain show from the infinity pool was unforgettable. Highly recommend.",
        photos: [
          "https://picsum.photos/seed/address-review-2a/120/90",
          "https://picsum.photos/seed/address-review-2b/120/90",
          "https://picsum.photos/seed/address-review-2c/120/90",
        ],
      },
    ],
    highlights: [
      "Direct Dubai Mall access",
      "Burj Khalifa & fountain views",
      "Infinity pool",
      "5 in-house restaurants",
      "Prime downtown location",
    ],
    demandNote: "Booked 21 times in the last 24 hours",
  },

  "rove-downtown": {
    id: "rove-downtown",
    name: "Rove Downtown",
    starRating: 4,
    rating: 9.0,
    ratingLabel: "Excellent",
    reviews: 2145,
    location: "Downtown Dubai, UAE",
    lat: 25.1916,
    lng: 55.2799,
    distance: "1.0 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 26010,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/rove-hero/900/700",
    heroBadge: "Great Value",
    galleryImages: [
      "https://picsum.photos/seed/rove-lobby/500/380",
      "https://picsum.photos/seed/rove-pool/500/380",
      "https://picsum.photos/seed/rove-gym/500/380",
      "https://picsum.photos/seed/rove-room/500/380",
    ],
    extraPhotosCount: 20,
    aboutShort:
      "Rove Downtown is a modern, budget-friendly hotel just minutes from Burj Khalifa and Dubai Mall, designed for travelers who want style without the price tag.",
    aboutMore:
      "Bright, playful rooms come with everything you need and nothing you don't — a co-working lobby, rooftop pool, and 24-hour gym make this a favourite for both business and leisure travelers.",
    quickFacilities: [
      { icon: "wifi", label: "Free WiFi" },
      { icon: "pool", label: "Outdoor pool" },
      { icon: "fitness", label: "Fitness centre" },
      { icon: "restaurant", label: "Restaurant" },
      { icon: "shuttle", label: "24-hour desk" },
      { icon: "family", label: "Family rooms" },
    ],
    popularFacilities: [
      "Outdoor pool",
      "City view",
      "Free WiFi",
      "Fitness centre",
      "Family rooms",
      "Co-working lounge",
      "Restaurant",
      "Free parking",
      "Bar",
      "24-hour front desk",
    ],
    rooms: [
      {
        id: "rover-room",
        name: "Rover Room",
        image: "https://picsum.photos/seed/rove-room-1/300/220",
        beds: "1 Queen bed",
        maxGuests: 2,
        size: "22 m²",
        view: "City view",
        breakfastIncluded: false,
        freeCancellationBefore: "Jun 6, 2024",
        payAtProperty: true,
        price: 26010,
      },
      {
        id: "rover-plus-room",
        name: "Rover Plus Room",
        image: "https://picsum.photos/seed/rove-room-2/300/220",
        beds: "1 King bed",
        maxGuests: 2,
        size: "26 m²",
        view: "City view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 6, 2024",
        payAtProperty: true,
        price: 31500,
      },
      {
        id: "family-room",
        name: "Family Room",
        image: "https://picsum.photos/seed/rove-room-3/300/220",
        beds: "1 King bed + 1 Bunk bed",
        maxGuests: 4,
        size: "34 m²",
        view: "City view",
        breakfastIncluded: true,
        freeCancellationBefore: "Jun 6, 2024",
        payAtProperty: false,
        price: 38200,
      },
    ],
    reviewCategories: [
      { label: "Cleanliness", score: 9.2 },
      { label: "Comfort", score: 8.9 },
      { label: "Location", score: 9.4 },
      { label: "Facilities", score: 8.7 },
      { label: "Staff", score: 9.1 },
      { label: "Value for money", score: 9.3 },
    ],
    guestReviews: [
      {
        id: "review-zainab",
        name: "Zainab",
        country: "Pakistan",
        date: "Apr 9, 2024",
        score: 9,
        text: "Clean, modern and great value for money! Perfect base for exploring downtown.",
        photos: [
          "https://picsum.photos/seed/rove-review-1a/120/90",
          "https://picsum.photos/seed/rove-review-1b/120/90",
          "https://picsum.photos/seed/rove-review-1c/120/90",
        ],
      },
      {
        id: "review-daniyal",
        name: "Daniyal",
        country: "Pakistan",
        date: "Mar 22, 2024",
        score: 8,
        text: "Great rooftop pool and friendly staff. Rooms are compact but well designed.",
        photos: [
          "https://picsum.photos/seed/rove-review-2a/120/90",
          "https://picsum.photos/seed/rove-review-2b/120/90",
          "https://picsum.photos/seed/rove-review-2c/120/90",
        ],
      },
    ],
    highlights: [
      "Minutes from Burj Khalifa",
      "Rooftop pool",
      "Great value for money",
      "24-hour gym & front desk",
      "Family-friendly rooms",
    ],
    demandNote: "Booked 18 times in the last 24 hours",
  },
};

const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  "Jumeirah, Dubai": { lat: 25.1976, lng: 55.2463 },
  "Jumeirah Beach, Dubai": { lat: 25.1412, lng: 55.1853 },
  "Palm Jumeirah, Dubai": { lat: 25.1304, lng: 55.1171 },
  "Downtown Dubai, Dubai": { lat: 25.1932, lng: 55.2794 },
  "Dubai Marina, Dubai": { lat: 25.0806, lng: 55.1402 },
  "Business Bay, Dubai": { lat: 25.1886, lng: 55.2723 },
};

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };

function propertyCoordinatesFor(location: string) {
  const normalized = location
    .split(",")
    .slice(0, 2)
    .map((part) => part.trim())
    .join(", ");
  return locationCoordinates[normalized] ?? DUBAI_CENTER;
}

/**
 * Home page "Featured Properties" / "Homes guests love" cards use the lighter
 * `Property` shape (mock-data.ts), not the rich `PropertyDetail` schema. Rather than
 * hand-authoring full detail content for every one of them, derive a reasonable
 * PropertyDetail on the fly so every property card on the site links to a working
 * detail page instead of a dead link.
 */
export function synthesizePropertyDetail(property: {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  ratingLabel: string;
  reviews: number;
  price: number;
  currency: string;
}): PropertyDetail {
  const [city, country] = property.location.split(",").map((part) => part.trim());
  const clampScore = (score: number) => Math.min(9.9, Math.max(6, Math.round(score * 10) / 10));
  const coords = propertyCoordinatesFor(property.location);

  return {
    id: property.id,
    name: property.name,
    starRating: property.rating >= 9.3 ? 5 : 4,
    rating: property.rating,
    ratingLabel: property.ratingLabel,
    reviews: property.reviews,
    location: property.location,
    lat: coords.lat,
    lng: coords.lng,
    distance: "1.5 km from center",
    country: country ?? "Pakistan",
    city: city ?? property.location,
    price: property.price,
    currency: property.currency,
    heroImage: property.image,
    heroBadge: "Guest Favorite",
    galleryImages: [
      `${property.image}&sig=1`,
      `${property.image}&sig=2`,
      `${property.image}&sig=3`,
      `${property.image}&sig=4`,
    ],
    extraPhotosCount: 18,
    aboutShort: `${property.name} is a highly-rated stay in ${city ?? property.location}, offering comfortable rooms and attentive service just minutes from the city's main attractions.`,
    aboutMore:
      "Guests consistently praise the friendly staff, convenient location, and great value for money. Whether you're visiting for business or leisure, this property makes a great base for your stay.",
    quickFacilities: [
      { icon: "wifi", label: "Free WiFi" },
      { icon: "family", label: "Family rooms" },
      { icon: "fitness", label: "Fitness centre" },
      { icon: "restaurant", label: "Restaurant" },
    ],
    popularFacilities: [
      "Free WiFi",
      "Family rooms",
      "Air conditioning",
      "24-hour front desk",
      "Restaurant",
      "Free parking",
      "Non-smoking rooms",
      "Room service",
    ],
    rooms: [
      {
        id: "standard-room",
        name: "Standard Room",
        image: property.image,
        beds: "1 Queen bed",
        maxGuests: 2,
        size: "24 m²",
        view: "City view",
        breakfastIncluded: false,
        freeCancellationBefore: "3 days before check-in",
        payAtProperty: true,
        price: property.price,
      },
      {
        id: "deluxe-room",
        name: "Deluxe Room",
        image: property.image,
        beds: "1 King bed",
        maxGuests: 2,
        size: "30 m²",
        view: "City view",
        breakfastIncluded: true,
        freeCancellationBefore: "3 days before check-in",
        payAtProperty: true,
        price: Math.round((property.price * 1.3) / 100) * 100,
      },
      {
        id: "suite",
        name: "Suite",
        image: property.image,
        beds: "1 King bed + Sofa bed",
        maxGuests: 3,
        size: "42 m²",
        view: "City view",
        breakfastIncluded: true,
        freeCancellationBefore: "3 days before check-in",
        payAtProperty: false,
        price: Math.round((property.price * 1.8) / 100) * 100,
      },
    ],
    reviewCategories: [
      { label: "Cleanliness", score: clampScore(property.rating + 0.1) },
      { label: "Comfort", score: clampScore(property.rating) },
      { label: "Location", score: clampScore(property.rating - 0.2) },
      { label: "Facilities", score: clampScore(property.rating - 0.3) },
      { label: "Staff", score: clampScore(property.rating + 0.2) },
      { label: "Value for money", score: clampScore(property.rating - 0.5) },
    ],
    guestReviews: [
      {
        id: `${property.id}-review-1`,
        name: "Bilal",
        country: "Pakistan",
        date: "Mar 12, 2024",
        score: Math.round(property.rating),
        text: "Great location and friendly staff. Would definitely stay here again on my next trip.",
        photos: [
          `${property.image}&sig=r1`,
          `${property.image}&sig=r2`,
          `${property.image}&sig=r3`,
        ],
      },
      {
        id: `${property.id}-review-2`,
        name: "Sana",
        country: "Pakistan",
        date: "Feb 24, 2024",
        score: Math.max(1, Math.round(property.rating) - 1),
        text: "Clean rooms and great value for money. The breakfast could be better but overall a solid stay.",
        photos: [
          `${property.image}&sig=r4`,
          `${property.image}&sig=r5`,
          `${property.image}&sig=r6`,
        ],
      },
    ],
    highlights: [
      `Centrally located in ${city ?? property.location}`,
      "Highly rated by guests",
      "Free WiFi throughout",
      "Great value for money",
      "Friendly, attentive staff",
    ],
    demandNote: `Booked ${Math.max(4, property.reviews % 30)} times in the last 24 hours`,
  };
}

export function getPropertyDetail(
  id: string,
  fallbackProperties: {
    id: string;
    name: string;
    location: string;
    image: string;
    rating: number;
    ratingLabel: string;
    reviews: number;
    price: number;
    currency: string;
  }[]
): PropertyDetail | undefined {
  if (propertyDetails[id]) return propertyDetails[id];
  const fallback = fallbackProperties.find((property) => property.id === id);
  return fallback ? synthesizePropertyDetail(fallback) : undefined;
}
