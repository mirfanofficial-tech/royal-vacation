export type RatePlan = {
  id: string;
  adults: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  taxesFees: number;
  loyaltyDiscount?: boolean;
  perks: string[];
  cancellation: string;
  refundable: boolean;
  payNote: string;
};

export type RoomOption = {
  id: string;
  name: string;
  roomType: "rooms" | "studios" | "apartments";
  image: string;
  beds: string;
  roomsCount: number;
  maxGuests: number;
  size: string;
  view: string;
  tags: string[];
  availabilityNote?: string;
  floorNote?: string;
  amenities: string[];
  ratePlans: RatePlan[];
};

export type ReviewCategory = { label: string; score: number };

export type GuestReview = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  date: string;
  score: number;
  text: string;
  photos: string[];
  tripInfo: string;
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

export type NearbyPlace = { label: string; distance: string };

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
  staffScore: number;
  guestLovedQuote: { text: string; guestName: string; guestCountry: string };
  nearby: NearbyPlace[];
  gettingAround: NearbyPlace[];
};

const defaultRoomAmenities: string[] = [
  "Free toiletries",
  "Safety deposit box",
  "Streaming service (like Netflix)",
  "Toilet",
  "Sofa",
  "Bath or shower",
  "Towels",
  "Linen",
  "Cleaning products",
  "Tile/Marble floor",
  "Seating area",
  "Suit press",
  "TV",
  "Slippers",
  "Refrigerator",
  "Telephone",
  "Ironing facilities",
  "Satellite channels",
  "Tea/Coffee maker",
  "Iron",
  "Heating",
  "Hairdryer",
  "Fan",
  "Walk-in closet",
  "Towels/Sheets (extra fee)",
  "Electric kettle",
  "Outdoor dining area",
  "Wake-up service",
  "Wardrobe or closet",
  "Upper floors accessible by elevator",
  "Clothes rack",
  "Toilet paper",
  "Entire unit wheelchair accessible",
  "Carbon monoxide detector",
  "Single-room AC for guest accommodation",
  "Hand sanitizer",
];

export const propertyDetails: Record<string, PropertyDetail> = {
  "burj-al-arab": {
    id: "burj-al-arab",
    name: "Burj Al Arab Jumeirah",
    badge: "Hotel",
    starRating: 5,
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 1348,
    location: "Jumeirah St, Umm Suqeim 3, Dubai, United Arab Emirates",
    lat: 25.1412,
    lng: 55.1853,
    distance: "1.2 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 68000,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/burj-hero-view/900/700",
    heroBadge: "Private beach",
    galleryImages: [
      "https://picsum.photos/seed/burj-lobby/500/380",
      "https://picsum.photos/seed/burj-terrace/500/380",
      "https://picsum.photos/seed/burj-pool/500/380",
      "https://picsum.photos/seed/burj-suite/500/380",
      "https://picsum.photos/seed/burj-room/500/380",
      "https://picsum.photos/seed/burj-spa/500/380",
      "https://picsum.photos/seed/burj-restaurant/500/380",
    ],
    extraPhotosCount: 41,
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
      "Spa and wellness center",
      "5 restaurants",
      "Airport shuttle",
      "Family rooms",
      "Free parking",
      "Bar",
      "Private beach area",
    ],
    rooms: [
      {
        id: "standard-double-room",
        name: "Standard Double Room",
        roomType: "rooms",
        image: "https://picsum.photos/seed/burj-room-1/300/220",
        beds: "1 king bed",
        roomsCount: 1,
        maxGuests: 3,
        size: "26 m²",
        view: "City view",
        tags: ["Patio", "Free WiFi", "Attached bathroom", "Air conditioning", "Flat-screen TV", "Soundproofing", "Minibar"],
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "standard-double-breakfast-refundable",
            adults: 2,
            price: 19958,
            originalPrice: 22689,
            discountPercent: 12,
            taxesFees: 3393,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast included"],
            cancellation: "Free cancellation before 6:00 PM on August 11, 2026",
            refundable: true,
            payNote: "No prepayment needed – pay at the property",
          },
          {
            id: "standard-double-nonrefundable",
            adults: 2,
            price: 19958,
            originalPrice: 22689,
            discountPercent: 12,
            taxesFees: 3393,
            loyaltyDiscount: true,
            perks: ["Includes valet parking & late check-out + high-speed internet"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
          {
            id: "standard-double-breakfast-3-adults",
            adults: 3,
            price: 21732,
            originalPrice: 24689,
            discountPercent: 12,
            taxesFees: 3895,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast included"],
            cancellation: "Free cancellation before 6:00 PM on August 11, 2026",
            refundable: true,
            payNote: "No prepayment needed – pay at the property",
          },
        ],
      },
      {
        id: "superior-studio",
        name: "Superior Studio",
        roomType: "studios",
        image: "https://picsum.photos/seed/burj-room-2/300/220",
        beds: "1 king bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "42 m²",
        view: "Sea view",
        tags: ["Balcony", "Free WiFi", "Attached bathroom", "Air conditioning", "Flat-screen TV", "Minibar"],
        availabilityNote: "We have 2 left",
        floorNote: "High floor",
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "superior-studio-nonrefundable",
            adults: 2,
            price: 32789,
            originalPrice: 37760,
            discountPercent: 12,
            taxesFees: 5574,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast PKR 2,000"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
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
        countryCode: "PK",
        date: "May 2, 2024",
        score: 10,
        text: "Everything was perfect! The service, the view, the food - simply world-class. Will definitely come again.",
        photos: [
          "https://picsum.photos/seed/burj-review-1a/120/90",
          "https://picsum.photos/seed/burj-review-1b/120/90",
          "https://picsum.photos/seed/burj-review-1c/120/90",
        ],
        tripInfo: "Perfect stay · 4 nights · Deluxe Suite",
      },
      {
        id: "review-ayesha",
        name: "Ayesha",
        country: "Pakistan",
        countryCode: "PK",
        date: "Apr 28, 2024",
        score: 9,
        text: "Unbeatable experience. The staff was extremely cooperative and the suite was amazing.",
        photos: [
          "https://picsum.photos/seed/burj-review-2a/120/90",
          "https://picsum.photos/seed/burj-review-2b/120/90",
          "https://picsum.photos/seed/burj-review-2c/120/90",
        ],
        tripInfo: "Perfect stay · 3 nights · Royal Room",
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
    staffScore: 9.8,
    guestLovedQuote: {
      text: "Everything was perfect - the suite, the private beach and a team that remembered our names.",
      guestName: "Amira",
      guestCountry: "United Kingdom",
    },
    nearby: [
      { label: "Burj Khalifa", distance: "18 km" },
      { label: "Wild Wadi Waterpark", distance: "900 m" },
      { label: "Mall of the Emirates", distance: "4.2 km" },
    ],
    gettingAround: [
      { label: "Dubai Intl. Airport (DXB)", distance: "26 km" },
      { label: "Mall of the Emirates Metro", distance: "4.5 km" },
      { label: "Jumeirah Public Beach", distance: "1.1 km" },
    ],
  },

  "atlantis-the-palm": {
    id: "atlantis-the-palm",
    name: "Atlantis, The Palm",
    badge: "Hotel",
    starRating: 5,
    rating: 9.4,
    ratingLabel: "Wonderful",
    reviews: 3214,
    location: "Crescent Rd, Palm Jumeirah, Dubai, United Arab Emirates",
    lat: 25.1304,
    lng: 55.1171,
    distance: "17.5 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 52700,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/atlantis-hero/900/700",
    heroBadge: "Water park access",
    galleryImages: [
      "https://picsum.photos/seed/atlantis-lobby/500/380",
      "https://picsum.photos/seed/atlantis-waterpark/500/380",
      "https://picsum.photos/seed/atlantis-pool/500/380",
      "https://picsum.photos/seed/atlantis-suite/500/380",
      "https://picsum.photos/seed/atlantis-room/500/380",
      "https://picsum.photos/seed/atlantis-aquarium/500/380",
      "https://picsum.photos/seed/atlantis-beach/500/380",
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
      "ShuiQi Spa",
      "Aquaventure Waterpark",
      "Kids club",
      "Family rooms",
      "Free parking",
      "Bar",
      "Private beach area",
    ],
    rooms: [
      {
        id: "ocean-deluxe",
        name: "Ocean Deluxe Room",
        roomType: "rooms",
        image: "https://picsum.photos/seed/atlantis-room-1/300/220",
        beds: "2 queen beds",
        roomsCount: 1,
        maxGuests: 3,
        size: "48 m²",
        view: "Ocean view",
        tags: ["Free WiFi", "Attached bathroom", "Air conditioning", "Flat-screen TV", "Minibar"],
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "ocean-deluxe-breakfast",
            adults: 2,
            price: 52700,
            originalPrice: 59900,
            discountPercent: 12,
            taxesFees: 8950,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast included"],
            cancellation: "Free cancellation before 6:00 PM on August 10, 2026",
            refundable: true,
            payNote: "No prepayment needed – pay at the property",
          },
          {
            id: "ocean-deluxe-nonrefundable",
            adults: 3,
            price: 49900,
            originalPrice: 56700,
            discountPercent: 12,
            taxesFees: 8480,
            loyaltyDiscount: true,
            perks: ["Includes valet parking & high-speed internet"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
      },
      {
        id: "imperial-club",
        name: "Imperial Club Room",
        roomType: "rooms",
        image: "https://picsum.photos/seed/atlantis-room-2/300/220",
        beds: "1 king bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "56 m²",
        view: "Palm view",
        tags: ["Balcony", "Free WiFi", "Attached bathroom", "Air conditioning", "Minibar"],
        availabilityNote: "We have 3 left",
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "imperial-club-nonrefundable",
            adults: 2,
            price: 64500,
            originalPrice: 73300,
            discountPercent: 12,
            taxesFees: 10965,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast PKR 2,500"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
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
        countryCode: "GB",
        date: "Mar 14, 2024",
        score: 9,
        text: "Perfect for families and couples. Amazing water park and the kids never wanted to leave!",
        photos: [
          "https://picsum.photos/seed/atlantis-review-1a/120/90",
          "https://picsum.photos/seed/atlantis-review-1b/120/90",
          "https://picsum.photos/seed/atlantis-review-1c/120/90",
        ],
        tripInfo: "Family vacation · 5 nights · Ocean Suite",
      },
      {
        id: "review-omar",
        name: "Omar",
        country: "Saudi Arabia",
        countryCode: "SA",
        date: "Feb 20, 2024",
        score: 9,
        text: "Beautiful property with excellent service. The aquarium suite was a unique experience.",
        photos: [
          "https://picsum.photos/seed/atlantis-review-2a/120/90",
          "https://picsum.photos/seed/atlantis-review-2b/120/90",
          "https://picsum.photos/seed/atlantis-review-2c/120/90",
        ],
        tripInfo: "Anniversary trip · 3 nights · Aquarium Suite",
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
    staffScore: 9.5,
    guestLovedQuote: {
      text: "The waterpark, the aquarium suite, the sunset over the Palm - our kids still talk about it.",
      guestName: "Faisal",
      guestCountry: "Saudi Arabia",
    },
    nearby: [
      { label: "Aquaventure Waterpark", distance: "On-site" },
      { label: "The Pointe", distance: "1.5 km" },
      { label: "Palm Jumeirah Boardwalk", distance: "800 m" },
    ],
    gettingAround: [
      { label: "Dubai Intl. Airport (DXB)", distance: "28 km" },
      { label: "Palm Monorail Station", distance: "600 m" },
      { label: "Dubai Marina", distance: "6.5 km" },
    ],
  },

  "address-downtown": {
    id: "address-downtown",
    name: "Address Downtown",
    badge: "Hotel",
    starRating: 5,
    rating: 9.2,
    ratingLabel: "Wonderful",
    reviews: 1932,
    location: "Emaar Blvd, Downtown Dubai, Dubai, United Arab Emirates",
    lat: 25.1932,
    lng: 55.2794,
    distance: "0.5 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 48500,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/address-hero/900/700",
    heroBadge: "Best location",
    galleryImages: [
      "https://picsum.photos/seed/address-lobby/500/380",
      "https://picsum.photos/seed/address-pool/500/380",
      "https://picsum.photos/seed/address-restaurant/500/380",
      "https://picsum.photos/seed/address-suite/500/380",
      "https://picsum.photos/seed/address-room/500/380",
      "https://picsum.photos/seed/address-gym/500/380",
      "https://picsum.photos/seed/address-view/500/380",
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
      "Spa and wellness centre",
      "5 restaurants",
      "Fitness centre",
      "Family rooms",
      "Valet parking",
      "Bar",
      "Direct mall access",
    ],
    rooms: [
      {
        id: "fountain-view-room",
        name: "Fountain View Room",
        roomType: "rooms",
        image: "https://picsum.photos/seed/address-room-1/300/220",
        beds: "1 king bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "50 m²",
        view: "Fountain view",
        tags: ["Balcony", "Free WiFi", "Attached bathroom", "Air conditioning", "Flat-screen TV"],
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "fountain-view-breakfast",
            adults: 2,
            price: 48500,
            originalPrice: 55100,
            discountPercent: 12,
            taxesFees: 8245,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast included"],
            cancellation: "Free cancellation before 6:00 PM on August 9, 2026",
            refundable: true,
            payNote: "No prepayment needed – pay at the property",
          },
        ],
      },
      {
        id: "burj-view-suite",
        name: "Burj Khalifa View Suite",
        roomType: "apartments",
        image: "https://picsum.photos/seed/address-room-2/300/220",
        beds: "1 king bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "75 m²",
        view: "City view",
        tags: ["Free WiFi", "Attached bathroom", "Air conditioning", "Minibar"],
        availabilityNote: "We have 4 left",
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "burj-view-nonrefundable",
            adults: 2,
            price: 61000,
            originalPrice: 69300,
            discountPercent: 12,
            taxesFees: 10370,
            loyaltyDiscount: true,
            perks: ["Includes late check-out + high-speed internet"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
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
        countryCode: "PK",
        date: "Jan 18, 2024",
        score: 9,
        text: "Best location with breathtaking Burj Khalifa view! Walking distance to everything.",
        photos: [
          "https://picsum.photos/seed/address-review-1a/120/90",
          "https://picsum.photos/seed/address-review-1b/120/90",
          "https://picsum.photos/seed/address-review-1c/120/90",
        ],
        tripInfo: "Wonderful stay · 3 nights · Burj Khalifa View Suite",
      },
      {
        id: "review-ali",
        name: "Ali",
        country: "UAE",
        countryCode: "AE",
        date: "Jan 3, 2024",
        score: 9,
        text: "Watching the fountain show from the infinity pool was unforgettable. Highly recommend.",
        photos: [
          "https://picsum.photos/seed/address-review-2a/120/90",
          "https://picsum.photos/seed/address-review-2b/120/90",
          "https://picsum.photos/seed/address-review-2c/120/90",
        ],
        tripInfo: "Pleasant stay · 2 nights · Fountain View Room",
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
    staffScore: 9.4,
    guestLovedQuote: {
      text: "Ask for a fountain-facing room - watching the show from the infinity pool was unforgettable.",
      guestName: "Zara",
      guestCountry: "Pakistan",
    },
    nearby: [
      { label: "Burj Khalifa", distance: "300 m" },
      { label: "The Dubai Mall", distance: "400 m" },
      { label: "Dubai Fountain", distance: "250 m" },
    ],
    gettingAround: [
      { label: "Dubai Intl. Airport (DXB)", distance: "15 km" },
      { label: "Burj Khalifa/Dubai Mall Metro", distance: "900 m" },
      { label: "Business Bay", distance: "3 km" },
    ],
  },

  "rove-downtown": {
    id: "rove-downtown",
    name: "Rove Downtown",
    badge: "Hotel",
    starRating: 4,
    rating: 9.0,
    ratingLabel: "Excellent",
    reviews: 2145,
    location: "Marasi Dr, Downtown Dubai, Dubai, United Arab Emirates",
    lat: 25.1916,
    lng: 55.2799,
    distance: "1.0 km from center",
    country: "United Arab Emirates",
    city: "Dubai",
    price: 26010,
    currency: "PKR",
    heroImage: "https://picsum.photos/seed/rove-hero/900/700",
    heroBadge: "Great value",
    galleryImages: [
      "https://picsum.photos/seed/rove-lobby/500/380",
      "https://picsum.photos/seed/rove-pool/500/380",
      "https://picsum.photos/seed/rove-gym/500/380",
      "https://picsum.photos/seed/rove-room/500/380",
      "https://picsum.photos/seed/rove-lounge/500/380",
      "https://picsum.photos/seed/rove-cowork/500/380",
      "https://picsum.photos/seed/rove-rooftop/500/380",
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
      "Co-working lounge",
      "Restaurant",
      "Fitness centre",
      "Family rooms",
      "Free parking",
      "Bar",
      "24-hour front desk",
    ],
    rooms: [
      {
        id: "rover-room",
        name: "Rover Room",
        roomType: "rooms",
        image: "https://picsum.photos/seed/rove-room-1/300/220",
        beds: "1 queen bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "22 m²",
        view: "City view",
        tags: ["Free WiFi", "Attached bathroom", "Air conditioning", "Flat-screen TV"],
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "rover-room-nonrefundable",
            adults: 2,
            price: 26010,
            originalPrice: 29556,
            discountPercent: 12,
            taxesFees: 4422,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast PKR 1,200"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
      },
      {
        id: "family-room",
        name: "Family Room",
        roomType: "rooms",
        image: "https://picsum.photos/seed/rove-room-3/300/220",
        beds: "1 king bed + 1 bunk bed",
        roomsCount: 1,
        maxGuests: 4,
        size: "34 m²",
        view: "City view",
        tags: ["Free WiFi", "Attached bathroom", "Air conditioning", "Flat-screen TV"],
        availabilityNote: "We have 5 left",
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "family-room-breakfast",
            adults: 4,
            price: 38200,
            originalPrice: 43400,
            discountPercent: 12,
            taxesFees: 6494,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast included"],
            cancellation: "Free cancellation before 6:00 PM on August 12, 2026",
            refundable: true,
            payNote: "No prepayment needed – pay at the property",
          },
        ],
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
        countryCode: "PK",
        date: "Apr 9, 2024",
        score: 9,
        text: "Clean, modern and great value for money! Perfect base for exploring downtown.",
        photos: [
          "https://picsum.photos/seed/rove-review-1a/120/90",
          "https://picsum.photos/seed/rove-review-1b/120/90",
          "https://picsum.photos/seed/rove-review-1c/120/90",
        ],
        tripInfo: "Great stay · 3 nights · Rover Room",
      },
      {
        id: "review-daniyal",
        name: "Daniyal",
        country: "Pakistan",
        countryCode: "PK",
        date: "Mar 22, 2024",
        score: 8,
        text: "Great rooftop pool and friendly staff. Rooms are compact but well designed.",
        photos: [
          "https://picsum.photos/seed/rove-review-2a/120/90",
          "https://picsum.photos/seed/rove-review-2b/120/90",
          "https://picsum.photos/seed/rove-review-2c/120/90",
        ],
        tripInfo: "Comfortable stay · 2 nights · Family Room",
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
    staffScore: 9.1,
    guestLovedQuote: {
      text: "Great value, spotless rooms and the rooftop pool view over Downtown is unbeatable at this price.",
      guestName: "Daniyal",
      guestCountry: "Pakistan",
    },
    nearby: [
      { label: "Burj Khalifa", distance: "1.5 km" },
      { label: "The Dubai Mall", distance: "1.8 km" },
      { label: "Dubai Fountain", distance: "1.6 km" },
    ],
    gettingAround: [
      { label: "Dubai Intl. Airport (DXB)", distance: "16 km" },
      { label: "Business Bay Metro", distance: "700 m" },
      { label: "Business Bay", distance: "1 km" },
    ],
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
  const deluxePrice = Math.round((property.price * 1.3) / 100) * 100;
  const suitePrice = Math.round((property.price * 1.8) / 100) * 100;

  return {
    id: property.id,
    name: property.name,
    badge: "Hotel",
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
    heroBadge: "Guest favorite",
    galleryImages: [
      `${property.image}&sig=1`,
      `${property.image}&sig=2`,
      `${property.image}&sig=3`,
      `${property.image}&sig=4`,
      `${property.image}&sig=5`,
      `${property.image}&sig=6`,
      `${property.image}&sig=7`,
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
      "Restaurant",
      "24-hour front desk",
      "Free parking",
      "Non-smoking rooms",
      "Room service",
    ],
    rooms: [
      {
        id: "standard-room",
        name: "Standard Room",
        roomType: "rooms",
        image: property.image,
        beds: "1 queen bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "24 m²",
        view: "City view",
        tags: ["Free WiFi", "Attached bathroom", "Air conditioning"],
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "standard-room-nonrefundable",
            adults: 2,
            price: property.price,
            originalPrice: Math.round((property.price * 1.13) / 10) * 10,
            discountPercent: 12,
            taxesFees: Math.round((property.price * 0.17) / 10) * 10,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast PKR 1,200"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
      },
      {
        id: "deluxe-room",
        name: "Deluxe Room",
        roomType: "rooms",
        image: property.image,
        beds: "1 king bed",
        roomsCount: 1,
        maxGuests: 2,
        size: "30 m²",
        view: "City view",
        tags: ["Balcony", "Free WiFi", "Attached bathroom", "Air conditioning"],
        availabilityNote: "We have 3 left",
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "deluxe-room-breakfast",
            adults: 2,
            price: deluxePrice,
            originalPrice: Math.round((deluxePrice * 1.13) / 10) * 10,
            discountPercent: 12,
            taxesFees: Math.round((deluxePrice * 0.17) / 10) * 10,
            loyaltyDiscount: true,
            perks: ["Wonderful breakfast included"],
            cancellation: "Free cancellation before check-in",
            refundable: true,
            payNote: "No prepayment needed – pay at the property",
          },
        ],
      },
      {
        id: "suite",
        name: "Suite",
        roomType: "apartments",
        image: property.image,
        beds: "1 king bed + sofa bed",
        roomsCount: 1,
        maxGuests: 3,
        size: "42 m²",
        view: "City view",
        tags: ["Free WiFi", "Attached bathroom", "Air conditioning", "Minibar"],
        amenities: defaultRoomAmenities,
        ratePlans: [
          {
            id: "suite-nonrefundable",
            adults: 3,
            price: suitePrice,
            originalPrice: Math.round((suitePrice * 1.13) / 10) * 10,
            discountPercent: 12,
            taxesFees: Math.round((suitePrice * 0.17) / 10) * 10,
            loyaltyDiscount: true,
            perks: ["Includes late check-out + high-speed internet"],
            cancellation: "Non-refundable",
            refundable: false,
            payNote: "Pay at the property before arrival",
          },
        ],
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
        countryCode: "PK",
        date: "Mar 12, 2024",
        score: Math.round(property.rating),
        text: "Great location and friendly staff. Would definitely stay here again on my next trip.",
        photos: [
          `${property.image}&sig=r1`,
          `${property.image}&sig=r2`,
          `${property.image}&sig=r3`,
        ],
        tripInfo: "Pleasant stay · 3 nights · Standard Room",
      },
      {
        id: `${property.id}-review-2`,
        name: "Sana",
        country: "Pakistan",
        countryCode: "PK",
        date: "Feb 24, 2024",
        score: Math.max(1, Math.round(property.rating) - 1),
        text: "Clean rooms and great value for money. The breakfast could be better but overall a solid stay.",
        photos: [
          `${property.image}&sig=r4`,
          `${property.image}&sig=r5`,
          `${property.image}&sig=r6`,
        ],
        tripInfo: "Good stay · 2 nights · Executive Suite",
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
    staffScore: clampScore(property.rating + 0.2),
    guestLovedQuote: {
      text: "Everything was perfect and the team really made us feel welcome from check-in to check-out.",
      guestName: "Bilal",
      guestCountry: "Pakistan",
    },
    nearby: [
      { label: "City centre", distance: "1.5 km" },
      { label: "Main shopping district", distance: "2 km" },
      { label: "Nearest beach", distance: "3.5 km" },
    ],
    gettingAround: [
      { label: "Nearest airport", distance: "20 km" },
      { label: "Nearest metro station", distance: "1 km" },
      { label: "Business district", distance: "2.5 km" },
    ],
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
