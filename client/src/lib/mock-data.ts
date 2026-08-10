export type PropertyType = {
  id: string;
  name: string;
  count: string;
  icon: "hotel" | "apartment" | "resort" | "villa" | "guesthouse" | "cabin";
};

export const propertyTypes: PropertyType[] = [
  { id: "hotels", name: "Hotels", count: "12,345 properties", icon: "hotel" },
  { id: "apartments", name: "Apartments", count: "8,234 properties", icon: "apartment" },
  { id: "resorts", name: "Resorts", count: "3,890 properties", icon: "resort" },
  { id: "villas", name: "Villas", count: "2,456 properties", icon: "villa" },
  { id: "guesthouses", name: "Guest houses", count: "1,234 properties", icon: "guesthouse" },
  { id: "cabins", name: "Cabins", count: "987 properties", icon: "cabin" },
];

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
    name: "Pearl Continental Hotel, Lahore",
    location: "Lahore, Pakistan",
    image: "https://picsum.photos/seed/royal-pc-lahore/640/480",
    rating: 9.1,
    ratingLabel: "Wonderful",
    reviews: 732,
    price: 18500,
    currency: "PKR",
  },
  {
    id: "fp-2",
    name: "Avari Towers Karachi",
    location: "Karachi, Pakistan",
    image: "https://picsum.photos/seed/royal-avari-karachi/640/480",
    rating: 8.8,
    ratingLabel: "Excellent",
    reviews: 512,
    price: 16200,
    currency: "PKR",
  },
  {
    id: "fp-3",
    name: "Serena Hotel, Islamabad",
    location: "Islamabad, Pakistan",
    image: "https://picsum.photos/seed/royal-serena-isb/640/480",
    rating: 9.3,
    ratingLabel: "Exceptional",
    reviews: 837,
    price: 17800,
    currency: "PKR",
  },
  {
    id: "fp-4",
    name: "Movenpick Hotel Karachi",
    location: "Karachi, Pakistan",
    image: "https://picsum.photos/seed/royal-movenpick-khi/640/480",
    rating: 8.9,
    ratingLabel: "Excellent",
    reviews: 645,
    price: 21000,
    currency: "PKR",
  },
  {
    id: "fp-5",
    name: "Ramada Plaza, Karachi",
    location: "Karachi, Pakistan",
    image: "https://picsum.photos/seed/royal-ramada-khi/640/480",
    rating: 8.6,
    ratingLabel: "Excellent",
    reviews: 398,
    price: 14300,
    currency: "PKR",
  },
];

export const homesGuestsLove: Property[] = [
  {
    id: "hg-1",
    name: "Modern Apartment in Bahria Town",
    location: "Lahore, Pakistan",
    image: "https://picsum.photos/seed/royal-bahria-apt/640/480",
    rating: 9.6,
    ratingLabel: "Exceptional",
    reviews: 326,
    price: 7500,
    currency: "PKR",
  },
  {
    id: "hg-2",
    name: "Luxury Sea View Apartment",
    location: "Karachi, Pakistan",
    image: "https://picsum.photos/seed/royal-seaview-apt/640/480",
    rating: 9.2,
    ratingLabel: "Wonderful",
    reviews: 196,
    price: 9200,
    currency: "PKR",
  },
  {
    id: "hg-3",
    name: "Cozy Cottage in Murree",
    location: "Murree, Pakistan",
    image: "https://picsum.photos/seed/royal-murree-cottage/640/480",
    rating: 9.0,
    ratingLabel: "Wonderful",
    reviews: 78,
    price: 6800,
    currency: "PKR",
  },
  {
    id: "hg-4",
    name: "Elegant Home in Islamabad",
    location: "Islamabad, Pakistan",
    image: "https://picsum.photos/seed/royal-isb-home/640/480",
    rating: 9.4,
    ratingLabel: "Exceptional",
    reviews: 112,
    price: 8700,
    currency: "PKR",
  },
  {
    id: "hg-5",
    name: "Riverside Guest House",
    location: "Skardu, Pakistan",
    image: "https://picsum.photos/seed/royal-skardu-guesthouse/640/480",
    rating: 9.1,
    ratingLabel: "Wonderful",
    reviews: 154,
    price: 5400,
    currency: "PKR",
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
    city: "Dubai",
    country: "United Arab Emirates",
    price: 24500,
    currency: "PKR",
    image: "https://picsum.photos/seed/royal-dubai/480/560",
  },
  {
    id: "dest-2",
    rank: "02",
    city: "Istanbul",
    country: "Turkey",
    price: 28700,
    currency: "PKR",
    image: "https://picsum.photos/seed/royal-istanbul/480/560",
  },
  {
    id: "dest-3",
    rank: "03",
    city: "London",
    country: "United Kingdom",
    price: 45000,
    currency: "PKR",
    image: "https://picsum.photos/seed/royal-london/480/560",
  },
  {
    id: "dest-4",
    rank: "04",
    city: "Kuala Lumpur",
    country: "Malaysia",
    price: 22000,
    currency: "PKR",
    image: "https://picsum.photos/seed/royal-kl/480/560",
  },
  {
    id: "dest-5",
    rank: "05",
    city: "Bangkok",
    country: "Thailand",
    price: 19800,
    currency: "PKR",
    image: "https://picsum.photos/seed/royal-bangkok/480/560",
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
    title: "Top 10 Beach Destinations for Your Next Vacation",
    date: "May 20, 2024",
    image: "https://picsum.photos/seed/royal-blog-beach/640/480",
  },
  {
    id: "blog-2",
    title: "A Guide to the Most Beautiful Places in Pakistan",
    date: "May 15, 2024",
    image: "https://picsum.photos/seed/royal-blog-pakistan/640/480",
  },
  {
    id: "blog-3",
    title: "Travel Smart: Tips for Booking the Perfect Stay",
    date: "May 10, 2024",
    image: "https://picsum.photos/seed/royal-blog-tips/640/480",
  },
  {
    id: "blog-4",
    title: "Budget vs Luxury: How to Choose the Right Hotel",
    date: "May 5, 2024",
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
