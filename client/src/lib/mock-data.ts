export type Property = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  ratingLabel: string;
  reviews: number;
  price: number;
  currency: string;
};

export const featuredProperties: Property[] = [
  {
    id: "fp-1",
    name: "Burj Al Arab Jumeirah",
    location: "Jumeirah, Dubai",
    image: "https://picsum.photos/seed/royal-burj-al-arab/640/480",
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 4180,
    price: 3200,
    currency: "AED",
  },
  {
    id: "fp-2",
    name: "Atlantis The Palm",
    location: "Palm Jumeirah, Dubai",
    image: "https://picsum.photos/seed/royal-atlantis-palm/640/480",
    rating: 9.4,
    ratingLabel: "Exceptional",
    reviews: 3560,
    price: 2450,
    currency: "AED",
  },
  {
    id: "fp-3",
    name: "Address Downtown",
    location: "Downtown Dubai, Dubai",
    image: "https://picsum.photos/seed/royal-address-downtown/640/480",
    rating: 9.2,
    ratingLabel: "Wonderful",
    reviews: 2870,
    price: 1850,
    currency: "AED",
  },
  {
    id: "fp-4",
    name: "Jumeirah Beach Hotel",
    location: "Jumeirah Beach, Dubai",
    image: "https://picsum.photos/seed/royal-jumeirah-beach/640/480",
    rating: 9.3,
    ratingLabel: "Wonderful",
    reviews: 3120,
    price: 1600,
    currency: "AED",
  },
];

export const homesGuestsLove: Property[] = [
  {
    id: "hg-1",
    name: "Modern Apartment in Dubai Marina",
    location: "Dubai Marina, Dubai",
    image: "https://picsum.photos/seed/royal-dubai-marina-apt/640/480",
    rating: 9.5,
    ratingLabel: "Exceptional",
    reviews: 610,
    price: 650,
    currency: "AED",
  },
  {
    id: "hg-2",
    name: "Luxury Villa in Palm Jumeirah",
    location: "Palm Jumeirah, Dubai",
    image: "https://picsum.photos/seed/royal-palm-villa/640/480",
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 284,
    price: 1200,
    currency: "AED",
  },
  {
    id: "hg-3",
    name: "Cozy Studio in Downtown Dubai",
    location: "Downtown Dubai, Dubai",
    image: "https://picsum.photos/seed/royal-downtown-studio/640/480",
    rating: 9.0,
    ratingLabel: "Wonderful",
    reviews: 412,
    price: 420,
    currency: "AED",
  },
  {
    id: "hg-4",
    name: "Elegant Home in Jumeirah",
    location: "Jumeirah, Dubai",
    image: "https://picsum.photos/seed/royal-jumeirah-home/640/480",
    rating: 9.3,
    ratingLabel: "Wonderful",
    reviews: 198,
    price: 780,
    currency: "AED",
  },
  {
    id: "hg-5",
    name: "Waterfront Apartment in Business Bay",
    location: "Business Bay, Dubai",
    image: "https://picsum.photos/seed/royal-business-bay-apt/640/480",
    rating: 9.1,
    ratingLabel: "Wonderful",
    reviews: 356,
    price: 540,
    currency: "AED",
  },
];

export type Destination = {
  id: string;
  rank: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  image: string;
};

export const popularDestinations: Destination[] = [
  {
    id: "dest-1",
    rank: "01",
    city: "London",
    country: "United Kingdom",
    price: 1450,
    currency: "AED",
    image: "https://picsum.photos/seed/royal-london/560/420",
  },
  {
    id: "dest-2",
    rank: "02",
    city: "Istanbul",
    country: "Turkey",
    price: 890,
    currency: "AED",
    image: "https://picsum.photos/seed/royal-istanbul/560/420",
  },
  {
    id: "dest-3",
    rank: "03",
    city: "Maldives",
    country: "Maldives",
    price: 1650,
    currency: "AED",
    image: "https://picsum.photos/seed/royal-maldives/560/420",
  },
  {
    id: "dest-4",
    rank: "04",
    city: "Bangkok",
    country: "Thailand",
    price: 780,
    currency: "AED",
    image: "https://picsum.photos/seed/royal-bangkok/560/420",
  },
  {
    id: "dest-5",
    rank: "05",
    city: "Paris",
    country: "France",
    price: 1900,
    currency: "AED",
    image: "https://picsum.photos/seed/royal-paris/560/420",
  },
];

export type Attraction = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
};

export const attractions: Attraction[] = [
  {
    id: "attr-1",
    name: "Burj Khalifa",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-burj-khalifa/480/360",
    rating: 4.9,
    reviews: 5240,
  },
  {
    id: "attr-2",
    name: "Palm Jumeirah",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-palm-jumeirah/480/360",
    rating: 4.8,
    reviews: 3860,
  },
  {
    id: "attr-3",
    name: "Dubai Mall",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-dubai-mall/480/360",
    rating: 4.7,
    reviews: 4120,
  },
  {
    id: "attr-4",
    name: "Dubai Marina",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-dubai-marina/480/360",
    rating: 4.8,
    reviews: 2760,
  },
  {
    id: "attr-5",
    name: "Museum of the Future",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-museum-future/480/360",
    rating: 4.9,
    reviews: 2140,
  },
  {
    id: "attr-6",
    name: "Dubai Miracle Garden",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-miracle-garden/480/360",
    rating: 4.6,
    reviews: 1890,
  },
];

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  image: string;
};

export const featuredBlogs: BlogPost[] = [
  {
    id: "blog-1",
    title: "Top 10 Beach Destinations for Perfect Vacation",
    date: "May 30, 2024",
    image: "https://picsum.photos/seed/royal-blog-beach/640/480",
  },
  {
    id: "blog-2",
    title: "A Guide to the Most Beautiful Places in the UAE",
    date: "May 15, 2024",
    image: "https://picsum.photos/seed/royal-blog-uae/640/480",
  },
  {
    id: "blog-3",
    title: "Travel Smart: Tips for Booking the Perfect Stay",
    date: "May 12, 2024",
    image: "https://picsum.photos/seed/royal-blog-tips/640/480",
  },
  {
    id: "blog-4",
    title: "Budget vs Luxury: How to Choose the Right Hotel",
    date: "May 9, 2024",
    image: "https://picsum.photos/seed/royal-blog-budget/640/480",
  },
];

export const navLinks = [
  { id: "stays", label: "Stays", icon: "bed" as const },
  { id: "flights", label: "Flights", icon: "plane" as const },
  { id: "cars", label: "Cars", icon: "car" as const },
  { id: "attractions", label: "Attractions", icon: "ticket" as const },
  { id: "airport-taxis", label: "Airport Taxis", icon: "taxi" as const },
];
