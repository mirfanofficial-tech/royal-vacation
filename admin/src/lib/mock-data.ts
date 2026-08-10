export type PropertyStatus = "active" | "draft" | "paused";
export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface AdminProperty {
  id: string;
  name: string;
  location: string;
  type: string;
  pricePerNight: number;
  currency: string;
  rating: number;
  status: PropertyStatus;
  bookings: number;
  revenue: number;
}

export interface AdminBooking {
  id: string;
  guest: string;
  property: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  currency: string;
  status: BookingStatus;
}

export interface AdminGuest {
  id: string;
  name: string;
  email: string;
  bookings: number;
  totalSpent: number;
  joined: string;
}

export const mockProperties: AdminProperty[] = [
  {
    id: "prp_001",
    name: "Grand Marina Residence",
    location: "Dubai Marina, Dubai",
    type: "Apartment",
    pricePerNight: 1450,
    currency: "AED",
    rating: 4.8,
    status: "active",
    bookings: 128,
    revenue: 185600,
  },
  {
    id: "prp_002",
    name: "The Palm Villa Retreat",
    location: "Palm Jumeirah, Dubai",
    type: "Villa",
    pricePerNight: 4200,
    currency: "AED",
    rating: 4.9,
    status: "active",
    bookings: 64,
    revenue: 268800,
  },
  {
    id: "prp_003",
    name: "Downtown Executive Suite",
    location: "Downtown Dubai",
    type: "Hotel",
    pricePerNight: 980,
    currency: "AED",
    rating: 4.6,
    status: "active",
    bookings: 210,
    revenue: 205800,
  },
  {
    id: "prp_004",
    name: "Corniche Beachfront Studio",
    location: "Abu Dhabi Corniche, Abu Dhabi",
    type: "Apartment",
    pricePerNight: 760,
    currency: "AED",
    rating: 4.4,
    status: "paused",
    bookings: 92,
    revenue: 69920,
  },
  {
    id: "prp_005",
    name: "Al Fahidi Heritage House",
    location: "Al Fahidi, Dubai",
    type: "Guest House",
    pricePerNight: 540,
    currency: "AED",
    rating: 4.7,
    status: "draft",
    bookings: 0,
    revenue: 0,
  },
  {
    id: "prp_006",
    name: "Marina Yacht Penthouse",
    location: "Dubai Marina, Dubai",
    type: "Penthouse",
    pricePerNight: 6800,
    currency: "AED",
    rating: 5.0,
    status: "active",
    bookings: 37,
    revenue: 251600,
  },
];

export const mockBookings: AdminBooking[] = [
  {
    id: "BKG-1042",
    guest: "Emily Carter",
    property: "Grand Marina Residence",
    checkIn: "2026-08-18",
    checkOut: "2026-08-22",
    nights: 4,
    guests: 2,
    total: 5800,
    currency: "AED",
    status: "confirmed",
  },
  {
    id: "BKG-1041",
    guest: "James Osei",
    property: "The Palm Villa Retreat",
    checkIn: "2026-08-20",
    checkOut: "2026-08-27",
    nights: 7,
    guests: 6,
    total: 29400,
    currency: "AED",
    status: "pending",
  },
  {
    id: "BKG-1040",
    guest: "Sofia Almeida",
    property: "Downtown Executive Suite",
    checkIn: "2026-08-12",
    checkOut: "2026-08-15",
    nights: 3,
    guests: 2,
    total: 2940,
    currency: "AED",
    status: "completed",
  },
  {
    id: "BKG-1039",
    guest: "Daniel Kim",
    property: "Marina Yacht Penthouse",
    checkIn: "2026-09-01",
    checkOut: "2026-09-05",
    nights: 4,
    guests: 4,
    total: 27200,
    currency: "AED",
    status: "confirmed",
  },
  {
    id: "BKG-1038",
    guest: "Priya Sharma",
    property: "Corniche Beachfront Studio",
    checkIn: "2026-07-28",
    checkOut: "2026-08-02",
    nights: 5,
    guests: 2,
    total: 3800,
    currency: "AED",
    status: "cancelled",
  },
  {
    id: "BKG-1037",
    guest: "Lucas Moreau",
    property: "Grand Marina Residence",
    checkIn: "2026-08-25",
    checkOut: "2026-08-29",
    nights: 4,
    guests: 3,
    total: 5800,
    currency: "AED",
    status: "confirmed",
  },
];

export const mockGuests: AdminGuest[] = [
  {
    id: "g_001",
    name: "Emily Carter",
    email: "emily.carter@example.com",
    bookings: 5,
    totalSpent: 21400,
    joined: "2025-11-02",
  },
  {
    id: "g_002",
    name: "James Osei",
    email: "james.osei@example.com",
    bookings: 3,
    totalSpent: 68200,
    joined: "2026-01-17",
  },
  {
    id: "g_003",
    name: "Sofia Almeida",
    email: "sofia.almeida@example.com",
    bookings: 8,
    totalSpent: 18950,
    joined: "2025-06-23",
  },
  {
    id: "g_004",
    name: "Daniel Kim",
    email: "daniel.kim@example.com",
    bookings: 2,
    totalSpent: 54400,
    joined: "2026-03-08",
  },
  {
    id: "g_005",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    bookings: 6,
    totalSpent: 15700,
    joined: "2025-09-12",
  },
  {
    id: "g_006",
    name: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    bookings: 4,
    totalSpent: 23100,
    joined: "2025-12-30",
  },
];

export type BlogStatus = "published" | "draft" | "scheduled";

export type BlogCategoryColorId =
  | "navy"
  | "gold"
  | "rating"
  | "sky"
  | "rose"
  | "amber"
  | "violet"
  | "emerald";

export const blogCategoryColors: {
  id: BlogCategoryColorId;
  label: string;
  chip: string;
  badge: string;
}[] = [
  { id: "navy", label: "Navy", chip: "bg-navy", badge: "bg-navy/10 text-navy" },
  { id: "gold", label: "Gold", chip: "bg-gold", badge: "bg-gold/15 text-gold" },
  {
    id: "rating",
    label: "Green",
    chip: "bg-rating",
    badge: "bg-rating/10 text-rating",
  },
  { id: "sky", label: "Sky", chip: "bg-sky-600", badge: "bg-sky-600/10 text-sky-600" },
  { id: "rose", label: "Rose", chip: "bg-rose-600", badge: "bg-rose-600/10 text-rose-600" },
  { id: "amber", label: "Amber", chip: "bg-amber-600", badge: "bg-amber-600/10 text-amber-600" },
  { id: "violet", label: "Violet", chip: "bg-violet-600", badge: "bg-violet-600/10 text-violet-600" },
  { id: "emerald", label: "Emerald", chip: "bg-emerald-600", badge: "bg-emerald-600/10 text-emerald-600" },
];

export interface AdminBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: BlogCategoryColorId;
  postCount: number;
}

export const blogCategories: AdminBlogCategory[] = [
  {
    id: "cat_guides",
    name: "Guides",
    slug: "guides",
    description: "Neighborhood round-ups, itineraries and travel advice.",
    color: "navy",
    postCount: 3,
  },
  {
    id: "cat_things",
    name: "Things to Do",
    slug: "things-to-do",
    description: "Attractions, dining and activities across the Emirates.",
    color: "gold",
    postCount: 1,
  },
  {
    id: "cat_hosting",
    name: "Hosting",
    slug: "hosting",
    description: "Tips for hosts running short-term vacation rentals.",
    color: "rating",
    postCount: 1,
  },
  {
    id: "cat_updates",
    name: "Updates",
    slug: "updates",
    description: "Product news, new services and company announcements.",
    color: "amber",
    postCount: 1,
  },
  {
    id: "cat_news",
    name: "News",
    slug: "news",
    description: "Press releases and industry news.",
    color: "violet",
    postCount: 0,
  },
];

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: BlogStatus;
  author: string;
  views: number;
  publishedAt: string;
  updatedAt: string;
}

export const mockBlogPosts: AdminBlogPost[] = [
  {
    id: "blog_001",
    title: "Best Neighborhoods to Stay in Dubai in 2026",
    slug: "best-neighborhoods-to-stay-in-dubai-in-2026",
    category: "Guides",
    excerpt:
      "From Marina's skyline to the quiet charm of Al Fahidi, here is where to book for every kind of trip.",
    content:
      "## Where to stay in Dubai\n\nDubai has a neighborhood for every traveler. For first-timers, **Dubai Marina** offers the most convenient base with restaurants and metro access. Families love **Jumeirah** for its beachfront villas, while culture seekers should look at **Al Fahidi**.\n\n> Tip: book at least 45 days ahead for peak winter dates.\n\n- Dubai Marina: best for nightlife\n- Palm Jumeirah: best for luxury\n- Downtown: best for first-timers",
    tags: ["dubai", "neighborhoods", "travel-guide"],
    status: "published",
    author: "Layla Rahman",
    views: 12840,
    publishedAt: "2026-07-28",
    updatedAt: "2026-08-02",
  },
  {
    id: "blog_002",
    title: "How to Host Short-Term Rentals Like a Pro",
    slug: "how-to-host-short-term-rentals-like-a-pro",
    category: "Hosting",
    excerpt:
      "Pricing, house rules, and the little details that turn a one-time guest into a five-star reviewer.",
    content: "",
    tags: ["hosting", "tips", "revenue"],
    status: "published",
    author: "Omar Haddad",
    views: 9802,
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-20",
  },
  {
    id: "blog_003",
    title: "Top 10 Rooftop Pools in Dubai",
    slug: "top-10-rooftop-pools-in-dubai",
    category: "Things to Do",
    excerpt:
      "Sky-high swims and sunset views at the city's most photogenic hotel pools.",
    content: "",
    tags: ["pools", "luxury", "dubai"],
    status: "draft",
    author: "Layla Rahman",
    views: 0,
    publishedAt: "",
    updatedAt: "2026-08-05",
  },
  {
    id: "blog_004",
    title: "Palm Jumeirah vs Dubai Marina: Which Should You Choose?",
    slug: "palm-jumeirah-vs-dubai-marina",
    category: "Guides",
    excerpt:
      "Beach villa or skyline apartment? We compare value, access and vibe side by side.",
    content: "",
    tags: ["palm-jumeirah", "marina", "comparison"],
    status: "published",
    author: "Omar Haddad",
    views: 7450,
    publishedAt: "2026-06-30",
    updatedAt: "2026-07-02",
  },
  {
    id: "blog_005",
    title: "Introducing Our 24/7 Concierge for Guests",
    slug: "introducing-247-concierge-for-guests",
    category: "Updates",
    excerpt:
      "From airport pickup to late-night dining reservations — a new concierge service for every booking.",
    content: "",
    tags: ["concierge", "service", "news"],
    status: "scheduled",
    author: "Royal Vacation Admin",
    views: 0,
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-06",
  },
  {
    id: "blog_006",
    title: "The Ultimate Packing List for a UAE Vacation",
    slug: "ultimate-packing-list-for-a-uae-vacation",
    category: "Guides",
    excerpt:
      "What to bring — and what to leave at home — for a smooth trip to the Emirates.",
    content: "",
    tags: ["packing", "tips", "uae"],
    status: "draft",
    author: "Priya Sharma",
    views: 0,
    publishedAt: "",
    updatedAt: "2026-08-04",
  },
];

export const adminUser = {
  name: "Royal Vacation Admin",
  email: "admin@royalvacation.com",
};

export type CmsPageStatus = "published" | "draft" | "archived";

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: CmsPageStatus;
  author: string;
  updatedAt: string;
  views: number;
}

export const mockCmsPages: CmsPage[] = [
  {
    id: "cms_001",
    title: "Home",
    slug: "/",
    status: "published",
    author: "Layla Rahman",
    updatedAt: "2026-08-05",
    views: 48210,
  },
  {
    id: "cms_002",
    title: "Properties",
    slug: "/properties",
    status: "published",
    author: "Omar Haddad",
    updatedAt: "2026-08-03",
    views: 31920,
  },
  {
    id: "cms_003",
    title: "Blog",
    slug: "/blog",
    status: "published",
    author: "Layla Rahman",
    updatedAt: "2026-07-30",
    views: 18450,
  },
  {
    id: "cms_004",
    title: "About Us",
    slug: "/about",
    status: "published",
    author: "Omar Haddad",
    updatedAt: "2026-07-22",
    views: 7320,
  },
  {
    id: "cms_005",
    title: "Contact",
    slug: "/contact",
    status: "published",
    author: "Priya Sharma",
    updatedAt: "2026-07-15",
    views: 9110,
  },
  {
    id: "cms_006",
    title: "Careers",
    slug: "/careers",
    status: "draft",
    author: "Priya Sharma",
    updatedAt: "2026-08-06",
    views: 0,
  },
  {
    id: "cms_007",
    title: "Privacy Policy",
    slug: "/privacy",
    status: "published",
    author: "Omar Haddad",
    updatedAt: "2026-06-18",
    views: 1240,
  },
  {
    id: "cms_008",
    title: "Terms of Service",
    slug: "/terms",
    status: "published",
    author: "Omar Haddad",
    updatedAt: "2026-06-18",
    views: 980,
  },
  {
    id: "cms_009",
    title: "Partners",
    slug: "/partners",
    status: "archived",
    author: "Layla Rahman",
    updatedAt: "2026-05-02",
    views: 310,
  },
];

export interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
}

export interface CmsMenu {
  id: string;
  name: string;
  location: string;
  description: string;
  items: CmsMenuItem[];
}

export const mockCmsMenus: CmsMenu[] = [
  {
    id: "menu_001",
    name: "Header menu",
    location: "Header",
    description: "Primary navigation shown in the site header.",
    items: [
      { id: "item_001", label: "Home", url: "/" },
      { id: "item_002", label: "Properties", url: "/properties" },
      { id: "item_003", label: "Blog", url: "/blog" },
      { id: "item_004", label: "About", url: "/about" },
      { id: "item_005", label: "Contact", url: "/contact" },
    ],
  },
  {
    id: "menu_002",
    name: "Footer menu",
    location: "Footer",
    description: "Quick links displayed in the site footer.",
    items: [
      { id: "item_006", label: "About Us", url: "/about" },
      { id: "item_007", label: "Careers", url: "/careers" },
      { id: "item_008", label: "Privacy Policy", url: "/privacy" },
      { id: "item_009", label: "Terms of Service", url: "/terms" },
    ],
  },
  {
    id: "menu_003",
    name: "Footer bottom",
    location: "Footer bottom",
    description: "Legal links in the very bottom bar of the site.",
    items: [
      { id: "item_010", label: "Privacy", url: "/privacy" },
      { id: "item_011", label: "Terms", url: "/terms" },
      { id: "item_012", label: "Sitemap", url: "/sitemap" },
    ],
  },
];

export type SettingCountryStatus = "active" | "paused";

export interface SettingCountry {
  id: string;
  name: string;
  code: string;
  currency: string;
  status: SettingCountryStatus;
  properties: number;
}

export const mockSettingCountries: SettingCountry[] = [
  { id: "country_001", name: "United Arab Emirates", code: "AE", currency: "AED", status: "active", properties: 6 },
  { id: "country_002", name: "Saudi Arabia", code: "SA", currency: "SAR", status: "active", properties: 0 },
  { id: "country_003", name: "Qatar", code: "QA", currency: "QAR", status: "active", properties: 0 },
  { id: "country_004", name: "Kuwait", code: "KW", currency: "KWD", status: "paused", properties: 0 },
  { id: "country_005", name: "Bahrain", code: "BH", currency: "BHD", status: "paused", properties: 0 },
  { id: "country_006", name: "Oman", code: "OM", currency: "OMR", status: "active", properties: 0 },
  { id: "country_007", name: "United Kingdom", code: "GB", currency: "GBP", status: "active", properties: 0 },
  { id: "country_008", name: "United States", code: "US", currency: "USD", status: "active", properties: 0 },
  { id: "country_009", name: "Germany", code: "DE", currency: "EUR", status: "active", properties: 0 },
  { id: "country_010", name: "France", code: "FR", currency: "EUR", status: "active", properties: 0 },
];

export type PaymentGatewayStatus = "active" | "test" | "inactive";

export interface GatewayCredentials {
  publicKey: string;
  secretKey: string;
  merchantId: string;
  webhookSecret: string;
}

export interface GatewayCallbacks {
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  status: PaymentGatewayStatus;
  isDefault: boolean;
  currencies: string[];
  credentials: GatewayCredentials;
  callbacks: GatewayCallbacks;
}

export const mockPaymentGateways: PaymentGateway[] = [
  {
    id: "gateway_001",
    name: "Checkout.com",
    description: "Global payments platform with card, Apple Pay and Google Pay support.",
    status: "active",
    isDefault: true,
    currencies: ["AED", "USD", "EUR"],
    credentials: {
      publicKey: "pk_live_8f2k9xQ4mZ1wR7tY6nP0",
      secretKey: "sk_live_4sHdK9fJ2oQxV8nL5cZm",
      merchantId: "M-42177",
      webhookSecret: "whsec_9vX3qL7pW2eRt5yU8iO",
    },
    callbacks: {
      successUrl: "https://royalvacation.com/booking/complete",
      cancelUrl: "https://royalvacation.com/booking/checkout",
      webhookUrl: "https://api.royalvacation.com/v1/webhooks/checkout",
    },
  },
  {
    id: "gateway_002",
    name: "Stripe",
    description: "Online payment processing with broad international coverage.",
    status: "active",
    isDefault: false,
    currencies: ["AED", "USD", "EUR", "GBP"],
    credentials: {
      publicKey: "pk_live_6Nc2sD8eF1hJ5kM0rT7b",
      secretKey: "sk_live_51QwE8rT2yU4iO7pA9sDf",
      merchantId: "acct_3Fv8Zx1CbN6kLmP4",
      webhookSecret: "whsec_2tB6nV9xK4cM7zE1pW",
    },
    callbacks: {
      successUrl: "https://royalvacation.com/booking/complete",
      cancelUrl: "https://royalvacation.com/booking/checkout",
      webhookUrl: "https://api.royalvacation.com/v1/webhooks/stripe",
    },
  },
  {
    id: "gateway_003",
    name: "Tap Payments",
    description: "Payments provider popular across the MENA region.",
    status: "active",
    isDefault: false,
    currencies: ["AED", "SAR", "KWD", "QAR"],
    credentials: {
      publicKey: "pk_test_3tS8uR5gH2wD7yK1nF",
      secretKey: "sk_test_9pW4cZ1vB6nM3qL8xT",
      merchantId: "tap_merchant_5Gd7",
      webhookSecret: "whsec_4uY8sE2dF7hJ1kL9oP",
    },
    callbacks: {
      successUrl: "https://royalvacation.com/booking/complete",
      cancelUrl: "https://royalvacation.com/booking/checkout",
      webhookUrl: "https://api.royalvacation.com/v1/webhooks/tap",
    },
  },
  {
    id: "gateway_004",
    name: "PayPal",
    description: "Digital wallet payments trusted by international guests.",
    status: "test",
    isDefault: false,
    currencies: ["USD", "EUR", "GBP"],
    credentials: {
      publicKey: "AZd8fG2hK4jL6mN8pQ",
      secretKey: "EL5wS7cR3tY9uI1oP2a",
      merchantId: "paypal_sb_9Xk2",
      webhookSecret: "whsec_7cR2vT6yH8jK1mP4sW",
    },
    callbacks: {
      successUrl: "https://royalvacation.com/booking/complete",
      cancelUrl: "https://royalvacation.com/booking/checkout",
      webhookUrl: "https://api.royalvacation.com/v1/webhooks/paypal",
    },
  },
  {
    id: "gateway_005",
    name: "mada",
    description: "Saudi Arabia's national card network.",
    status: "test",
    isDefault: false,
    currencies: ["SAR"],
    credentials: {
      publicKey: "pk_test_1rE6uI8oA4sD7fG5hJ",
      secretKey: "sk_test_2tY5uI8oP3qW6eR9t",
      merchantId: "mada_merchant_2Fb4",
      webhookSecret: "whsec_5hJ3kL7mN9pQ2wE4rT",
    },
    callbacks: {
      successUrl: "https://royalvacation.com/booking/complete",
      cancelUrl: "https://royalvacation.com/booking/checkout",
      webhookUrl: "https://api.royalvacation.com/v1/webhooks/mada",
    },
  },
  {
    id: "gateway_006",
    name: "Paytabs",
    description: "Payment gateway serving the Middle East and Africa.",
    status: "inactive",
    isDefault: false,
    currencies: ["AED", "SAR", "EGP"],
    credentials: {
      publicKey: "PT2V9K6L3M8N1B4X7C",
      secretKey: "S2R5Y8U1I4O7P0A3F6",
      merchantId: "paytabs_3Hn8",
      webhookSecret: "whsec_8dF1gH4jK7lZ2xC5vB",
    },
    callbacks: {
      successUrl: "https://royalvacation.com/booking/complete",
      cancelUrl: "https://royalvacation.com/booking/checkout",
      webhookUrl: "https://api.royalvacation.com/v1/webhooks/paytabs",
    },
  },
];

export type ModuleEnvironment = "development" | "staging" | "production";
export type MarkupType = "percentage" | "flat";
export type TaxType = "percentage" | "flat";

export interface MarkupRule {
  type: MarkupType;
  value: number;
}

export interface ModuleTaxConfig {
  type: TaxType;
  value: number;
}

export interface ThirdPartyCredentialField {
  key: string;
  label: string;
  secret?: boolean;
  required?: boolean;
  value: string;
}

export interface ThirdPartyModule {
  id: string;
  name: string;
  category: string;
  provider: string;
  moduleId: string;
  status: "active" | "inactive";
  aiEnabled: boolean;
  environment: ModuleEnvironment;
  markupB2B: MarkupRule;
  markupB2C: MarkupRule;
  baseCurrency: string;
  tax: ModuleTaxConfig;
  credentialFields: ThirdPartyCredentialField[];
  helpText: string;
}

export const mockThirdPartyModules: ThirdPartyModule[] = [
  {
    id: "kikoto",
    name: "Kikoto",
    category: "Ferries Module",
    provider: "kikoto",
    moduleId: "41",
    status: "active",
    aiEnabled: true,
    environment: "development",
    markupB2B: { type: "percentage", value: 2 },
    markupB2C: { type: "percentage", value: 5 },
    baseCurrency: "EUR - United Kingdom",
    tax: { type: "percentage", value: 5 },
    credentialFields: [
      { key: "bearerToken", label: "Bearer Token", secret: true, required: true, value: "kt_live_8F2k9xQ4mZ1wR7tY6nP0bC" },
      { key: "baseUrl", label: "Base URL", required: true, value: "https://api.kikoto.io/v1" },
    ],
    helpText:
      "Search, book and manage ferry routes and tickets across the region through the Kikoto ferry distribution network.",
  },
  {
    id: "amadeus",
    name: "Amadeus",
    category: "Flights Module",
    provider: "amadeus",
    moduleId: "12",
    status: "active",
    aiEnabled: false,
    environment: "production",
    markupB2B: { type: "percentage", value: 3 },
    markupB2C: { type: "percentage", value: 8 },
    baseCurrency: "USD - United States",
    tax: { type: "flat", value: 1 },
    credentialFields: [
      { key: "apiKey", label: "API Key", secret: true, required: true, value: "am_9Xk2qL7wE4rT6yU8iO" },
      { key: "apiSecret", label: "API Secret", secret: true, required: true, value: "sK_5mN8vB2cX7zV1qW3e" },
    ],
    helpText:
      "Real-time flight search, pricing and booking through the Amadeus Travel API.",
  },
  {
    id: "viator",
    name: "Viator",
    category: "Tours & Activities Module",
    provider: "viator",
    moduleId: "27",
    status: "active",
    aiEnabled: false,
    environment: "development",
    markupB2B: { type: "percentage", value: 10 },
    markupB2C: { type: "percentage", value: 15 },
    baseCurrency: "EUR - United Kingdom",
    tax: { type: "percentage", value: 5 },
    credentialFields: [
      { key: "apiKey", label: "API Key", secret: true, required: true, value: "vr_7Hj3kL8mN2bV5cX9zQ" },
    ],
    helpText:
      "Browse and sell tours, experiences and activities from Viator's global catalog.",
  },
  {
    id: "welcome-pickups",
    name: "Welcome Pickups",
    category: "Transfers Module",
    provider: "welcome-pickups",
    moduleId: "34",
    status: "active",
    aiEnabled: true,
    environment: "production",
    markupB2B: { type: "percentage", value: 12 },
    markupB2C: { type: "percentage", value: 18 },
    baseCurrency: "AED - United Arab Emirates",
    tax: { type: "percentage", value: 0 },
    credentialFields: [
      { key: "bearerToken", label: "Bearer Token", secret: true, required: true, value: "wp_live_4sHdK9fJ2oQxV8nL5cZm" },
      { key: "baseUrl", label: "Base URL", required: true, value: "https://api.welcomepickups.com/v3" },
    ],
    helpText:
      "Airport transfers and chauffeur services available for booking across all destinations.",
  },
  {
    id: "cartrawler",
    name: "CarTrawler",
    category: "Car Rental Module",
    provider: "cartrawler",
    moduleId: "18",
    status: "inactive",
    aiEnabled: false,
    environment: "development",
    markupB2B: { type: "percentage", value: 5 },
    markupB2C: { type: "percentage", value: 10 },
    baseCurrency: "USD - United States",
    tax: { type: "flat", value: 2 },
    credentialFields: [
      { key: "clientId", label: "Client ID", required: true, value: "" },
      { key: "clientSecret", label: "Client Secret", secret: true, required: true, value: "" },
      { key: "baseUrl", label: "Base URL", required: true, value: "" },
    ],
    helpText:
      "Compare and book car rentals from leading global suppliers.",
  },
  {
    id: "safetywing",
    name: "SafetyWing",
    category: "Insurance Module",
    provider: "safetywing",
    moduleId: "52",
    status: "active",
    aiEnabled: true,
    environment: "staging",
    markupB2B: { type: "percentage", value: 8 },
    markupB2C: { type: "percentage", value: 15 },
    baseCurrency: "GBP - United Kingdom",
    tax: { type: "percentage", value: 5 },
    credentialFields: [
      { key: "apiKey", label: "API Key", secret: true, required: true, value: "sw_3bN6vM9xC2kL7pQ4wE" },
      { key: "baseUrl", label: "Base URL", required: true, value: "https://api.safetywing.com/v1" },
    ],
    helpText:
      "Add travel insurance coverage options at checkout for every booking.",
  },
];

export type PermissionAction = "view" | "create" | "edit" | "delete";

export type ModuleKey =
  | "dashboard"
  | "properties"
  | "bookings"
  | "guests"
  | "modules"
  | "cms"
  | "blog"
  | "reports"
  | "payments"
  | "settings"
  | "roles";

export const ALL_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
];

export interface Permissions {
  dashboard: PermissionAction[];
  properties: PermissionAction[];
  bookings: PermissionAction[];
  guests: PermissionAction[];
  modules: PermissionAction[];
  cms: PermissionAction[];
  blog: PermissionAction[];
  reports: PermissionAction[];
  payments: PermissionAction[];
  settings: PermissionAction[];
  roles: PermissionAction[];
}

export function createPermissions(full = false): Permissions {
  const actions: PermissionAction[] = full ? [...ALL_ACTIONS] : [];
  return {
    dashboard: [...actions],
    properties: [...actions],
    bookings: [...actions],
    guests: [...actions],
    modules: [...actions],
    cms: [...actions],
    blog: [...actions],
    reports: [...actions],
    payments: [...actions],
    settings: [...actions],
    roles: [...actions],
  };
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  status: "active" | "inactive";
  permissions: Permissions;
}

export const mockAdminRoles: AdminRole[] = [
  {
    id: "role_super_admin",
    name: "Super Admin",
    description:
      "Full access to every module, including role and user management.",
    isSystem: true,
    status: "active",
    permissions: createPermissions(true),
  },
  {
    id: "role_admin",
    name: "Administrator",
    description: "Runs day-to-day operations across all business modules.",
    isSystem: true,
    status: "active",
    permissions: { ...createPermissions(true), roles: ["view"] },
  },
  {
    id: "role_manager",
    name: "Manager",
    description:
      "Manages properties, bookings and guests but no site content or settings.",
    status: "active",
    permissions: {
      ...createPermissions(false),
      dashboard: ["view"],
      properties: ["view", "create", "edit"],
      bookings: ["view", "create", "edit"],
      guests: ["view", "create", "edit"],
    },
  },
  {
    id: "role_content_editor",
    name: "Content Editor",
    description: "Owns blog posts, pages and menus across the customer site.",
    status: "active",
    permissions: {
      ...createPermissions(false),
      dashboard: ["view"],
      cms: ["view", "create", "edit", "delete"],
      blog: ["view", "create", "edit", "delete"],
    },
  },
  {
    id: "role_support",
    name: "Support Agent",
    description: "Read-only access to bookings and guest records.",
    status: "active",
    permissions: {
      ...createPermissions(false),
      dashboard: ["view"],
      bookings: ["view"],
      guests: ["view"],
    },
  },
];

export type AdminUserStatus = "active" | "invited" | "inactive";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: AdminUserStatus;
  lastActive: string;
}

export const mockAdminUsers: AdminUserRecord[] = [
  {
    id: "user_001",
    name: "Royal Vacation Admin",
    email: "admin@royalvacation.com",
    roleId: "role_super_admin",
    status: "active",
    lastActive: "2026-08-07",
  },
  {
    id: "user_002",
    name: "Amina Al-Farsi",
    email: "amina@royalvacation.com",
    roleId: "role_manager",
    status: "active",
    lastActive: "2026-08-06",
  },
  {
    id: "user_003",
    name: "Sarah Mitchell",
    email: "sarah@royalvacation.com",
    roleId: "role_content_editor",
    status: "active",
    lastActive: "2026-08-05",
  },
  {
    id: "user_004",
    name: "John Carter",
    email: "john@royalvacation.com",
    roleId: "role_support",
    status: "active",
    lastActive: "2026-08-04",
  },
  {
    id: "user_005",
    name: "Lina Haddad",
    email: "lina@royalvacation.com",
    roleId: "role_manager",
    status: "invited",
    lastActive: "—",
  },
];
