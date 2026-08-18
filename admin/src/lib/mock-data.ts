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

export type BookingChannel = "Direct" | "Booking.com" | "Expedia" | "Airbnb" | "Agent";

export interface AdminBooking {
  id: string;
  guest: string;
  email: string;
  property: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  currency: string;
  status: BookingStatus;
  channel: BookingChannel;
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
    email: "emily.carter@example.com",
    property: "Grand Marina Residence",
    checkIn: "2026-08-18",
    checkOut: "2026-08-22",
    nights: 4,
    guests: 2,
    total: 5800,
    currency: "AED",
    status: "confirmed",
    channel: "Direct",
  },
  {
    id: "BKG-1041",
    guest: "James Osei",
    email: "james.osei@example.com",
    property: "The Palm Villa Retreat",
    checkIn: "2026-08-20",
    checkOut: "2026-08-27",
    nights: 7,
    guests: 6,
    total: 29400,
    currency: "AED",
    status: "pending",
    channel: "Booking.com",
  },
  {
    id: "BKG-1040",
    guest: "Sofia Almeida",
    email: "sofia.almeida@example.com",
    property: "Downtown Executive Suite",
    checkIn: "2026-08-12",
    checkOut: "2026-08-15",
    nights: 3,
    guests: 2,
    total: 2940,
    currency: "AED",
    status: "completed",
    channel: "Expedia",
  },
  {
    id: "BKG-1039",
    guest: "Daniel Kim",
    email: "daniel.kim@example.com",
    property: "Marina Yacht Penthouse",
    checkIn: "2026-09-01",
    checkOut: "2026-09-05",
    nights: 4,
    guests: 4,
    total: 27200,
    currency: "AED",
    status: "confirmed",
    channel: "Agent",
  },
  {
    id: "BKG-1038",
    guest: "Priya Sharma",
    email: "priya.sharma@example.com",
    property: "Corniche Beachfront Studio",
    checkIn: "2026-07-28",
    checkOut: "2026-08-02",
    nights: 5,
    guests: 2,
    total: 3800,
    currency: "AED",
    status: "cancelled",
    channel: "Airbnb",
  },
  {
    id: "BKG-1037",
    guest: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    property: "Grand Marina Residence",
    checkIn: "2026-08-25",
    checkOut: "2026-08-29",
    nights: 4,
    guests: 3,
    total: 5800,
    currency: "AED",
    status: "confirmed",
    channel: "Direct",
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

export const adminUser = {
  name: "Royal Vacation Admin",
  email: "admin@royalvacation.com",
};

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
  | "contact"
  | "reports"
  | "payments"
  | "settings"
  | "roles"
  | "stays";

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
  contact: PermissionAction[];
  reports: PermissionAction[];
  payments: PermissionAction[];
  settings: PermissionAction[];
  roles: PermissionAction[];
  stays: PermissionAction[];
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
    contact: [...actions],
    reports: [...actions],
    payments: [...actions],
    settings: [...actions],
    roles: [...actions],
    stays: [...actions],
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
    description: "Read-only access to bookings, guest records and contact messages.",
    status: "active",
    permissions: {
      ...createPermissions(false),
      dashboard: ["view"],
      bookings: ["view"],
      guests: ["view"],
      contact: ["view", "edit"],
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

// ---------------------------------------------------------------------------
// Dashboard analytics — no bookings/revenue/review/payout backend exists yet,
// so this whole section is demo data (disclosed via the dashboard's "Demo
// data" badge). Only the "requires attention" pending-comment count is wired
// to a real endpoint, from the dashboard page itself, not from here.
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down";

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  trendDirection: TrendDirection;
  trendPercent: string;
}

export const dashboardKpis: DashboardKpi[] = [
  { id: "gbv", label: "Gross booking value", value: "AED 6.24M", trendDirection: "up", trendPercent: "14.2%" },
  { id: "bookings", label: "Confirmed bookings", value: "1,842", trendDirection: "up", trendPercent: "9.6%" },
  { id: "occupancy", label: "Occupancy rate", value: "82.7%", trendDirection: "up", trendPercent: "3.1%" },
  { id: "cancellation", label: "Cancellation rate", value: "4.8%", trendDirection: "down", trendPercent: "1.2%" },
];

export interface DashboardSecondaryMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
}

export const dashboardSecondaryMetrics: DashboardSecondaryMetric[] = [
  { id: "adr", label: "ADR", value: "AED 24,600", delta: "+4.6%" },
  { id: "revpar", label: "RevPAR", value: "AED 20,340", delta: "+7.2%" },
  { id: "lead-time", label: "Avg. lead time", value: "18 days", delta: "-2 days" },
  { id: "avg-stay", label: "Avg. stay", value: "2.4 nights", delta: "+0.2" },
  { id: "repeat-guests", label: "Repeat guests", value: "31.4%", delta: "+5.8%" },
  { id: "refunds", label: "Refunds issued", value: "AED 184K", delta: "+1.1%" },
];

export interface MonthlyRevenue {
  month: string;
  thisYear: number;
  lastYear: number;
}

export const revenueByMonth: MonthlyRevenue[] = [
  { month: "Sep", thisYear: 420000, lastYear: 380000 },
  { month: "Oct", thisYear: 468000, lastYear: 430000 },
  { month: "Nov", thisYear: 512000, lastYear: 445000 },
  { month: "Dec", thisYear: 705000, lastYear: 560000 },
  { month: "Jan", thisYear: 560000, lastYear: 495000 },
  { month: "Feb", thisYear: 505000, lastYear: 470000 },
  { month: "Mar", thisYear: 478000, lastYear: 452000 },
  { month: "Apr", thisYear: 520000, lastYear: 460000 },
  { month: "May", thisYear: 812000, lastYear: 690000 },
  { month: "Jun", thisYear: 748000, lastYear: 655000 },
];

export interface BookingChannelShare {
  id: string;
  label: string;
  percent: number;
}

export const bookingChannels: BookingChannelShare[] = [
  { id: "direct", label: "Direct", percent: 38 },
  { id: "booking-com", label: "Booking.com", percent: 26 },
  { id: "expedia", label: "Expedia", percent: 18 },
  { id: "airbnb", label: "Airbnb", percent: 12 },
  { id: "agents", label: "Agents", percent: 6 },
];

export type DashboardAccent = "navy" | "gold" | "rating" | "sky" | "violet";

export interface TopPerformingProperty {
  id: string;
  name: string;
  location: string;
  occupancy: number;
  revenue: number;
  currency: string;
  initials: string;
  accent: DashboardAccent;
}

export const topPerformingProperties: TopPerformingProperty[] = [
  {
    id: "prp_002",
    name: "The Palm Villa Retreat",
    location: "Palm Jumeirah, Dubai",
    occupancy: 94,
    revenue: 268800,
    currency: "AED",
    initials: "PV",
    accent: "navy",
  },
  {
    id: "prp_006",
    name: "Marina Yacht Penthouse",
    location: "Dubai Marina, Dubai",
    occupancy: 88,
    revenue: 251600,
    currency: "AED",
    initials: "MY",
    accent: "gold",
  },
  {
    id: "prp_003",
    name: "Downtown Executive Suite",
    location: "Downtown Dubai",
    occupancy: 81,
    revenue: 205800,
    currency: "AED",
    initials: "DE",
    accent: "rating",
  },
  {
    id: "prp_001",
    name: "Grand Marina Residence",
    location: "Dubai Marina, Dubai",
    occupancy: 76,
    revenue: 185600,
    currency: "AED",
    initials: "GM",
    accent: "sky",
  },
  {
    id: "prp_004",
    name: "Corniche Beachfront Studio",
    location: "Abu Dhabi Corniche, Abu Dhabi",
    occupancy: 69,
    revenue: 69920,
    currency: "AED",
    initials: "CB",
    accent: "violet",
  },
];

export interface TopDestination {
  id: string;
  city: string;
  bookings: number;
}

export const topDestinations: TopDestination[] = [
  { id: "dxb", city: "Dubai", bookings: 1042 },
  { id: "auh", city: "Abu Dhabi", bookings: 486 },
  { id: "shj", city: "Sharjah", bookings: 298 },
  { id: "ras", city: "Ras Al Khaimah", bookings: 241 },
  { id: "ajm", city: "Ajman", bookings: 196 },
  { id: "fjr", city: "Fujairah", bookings: 139 },
];

export interface DashboardReview {
  id: string;
  guestName: string;
  property: string;
  rating: number;
  text: string;
  timeAgo: string;
}

export const recentGuestReviews: DashboardReview[] = [
  {
    id: "rev_001",
    guestName: "Emily Carter",
    property: "Grand Marina Residence",
    rating: 5,
    text: "Flawless stay — the marina view room was exactly as pictured and check-in took two minutes.",
    timeAgo: "2h ago",
  },
  {
    id: "rev_002",
    guestName: "Daniel Kim",
    property: "Marina Yacht Penthouse",
    rating: 4,
    text: "Great location and spotless rooms. Breakfast service could start earlier for early flights.",
    timeAgo: "6h ago",
  },
  {
    id: "rev_003",
    guestName: "Sofia Almeida",
    property: "The Palm Villa Retreat",
    rating: 5,
    text: "The villa was worth every dirham. Staff arranged a boat tour for us on short notice.",
    timeAgo: "1d ago",
  },
];

export interface RequiresAttentionItem {
  id: string;
  label: string;
  sublabel: string;
  actionLabel: string;
  href: string;
}

export const requiresAttentionMock: RequiresAttentionItem[] = [
  {
    id: "refunds",
    label: "5 refund requests to approve",
    sublabel: "AED 184,200 total exposure",
    actionLabel: "Approve",
    href: "#",
  },
  {
    id: "photos",
    label: "3 properties missing photos",
    sublabel: "Listings hidden from search",
    actionLabel: "Fix now",
    href: "/stays/property-types",
  },
  {
    id: "payouts",
    label: "2 host payouts scheduled today",
    sublabel: "AED 612,000 releasing at 18:00",
    actionLabel: "View",
    href: "#",
  },
];

// ---------------------------------------------------------------------------
// CMS Content Hub — Pages/Blog posts/pending comments are real (fetched live
// on the /cms dashboard page itself via useCmsPagesQuery/useBlogPosts/
// useBlogCommentsQuery, not from here). Media Library, Destinations-as-content,
// Banners and FAQs have no backend yet, so their figures below are demo data
// (disclosed via the Content Hub's "Demo data" badge).
// ---------------------------------------------------------------------------

export type ContentHubItemType = "page" | "post" | "destination" | "banner" | "faq";
export type ContentHubStatus = "published" | "draft" | "scheduled" | "in_review";

export interface ContentHubRecentItem {
  id: string;
  title: string;
  type: ContentHubItemType;
  author: string;
  status: ContentHubStatus;
  updatedLabel: string;
}

export const contentHubRecentlyUpdated: ContentHubRecentItem[] = [
  { id: "rec_001", title: "Luxury Stays in Dubai — Landing", type: "page", author: "Ayesha Khan", status: "published", updatedLabel: "2h ago" },
  { id: "rec_002", title: "10 Hidden Beaches in the Maldives", type: "post", author: "Daniel Ruiz", status: "in_review", updatedLabel: "5h ago" },
  { id: "rec_003", title: "Istanbul", type: "destination", author: "Sana Mirza", status: "published", updatedLabel: "Yesterday" },
  { id: "rec_004", title: "Summer Escape — Hero Slide", type: "banner", author: "Omar Farooq", status: "scheduled", updatedLabel: "Yesterday" },
  { id: "rec_005", title: "Cancellation & Refund Policy", type: "faq", author: "Lina Haddad", status: "published", updatedLabel: "2 days ago" },
  { id: "rec_006", title: "A Weekend in Santorini", type: "post", author: "Elena Costa", status: "draft", updatedLabel: "3 days ago" },
  { id: "rec_007", title: "About Royal Vacation", type: "page", author: "Zeeshan W.", status: "published", updatedLabel: "4 days ago" },
  { id: "rec_008", title: "Bali", type: "destination", author: "James Wu", status: "in_review", updatedLabel: "5 days ago" },
];

export interface ContentHubReviewItem {
  id: string;
  title: string;
  sublabel: string;
  type: ContentHubItemType;
}

export const contentHubNeedsReviewMock: ContentHubReviewItem[] = [
  { id: "rev_001", title: "10 Hidden Beaches in the Maldives", sublabel: "Post · Daniel Ruiz", type: "post" },
  { id: "rev_002", title: "Bali destination guide", sublabel: "Destination · James Wu", type: "destination" },
  { id: "rev_003", title: "Summer Escape hero slide", sublabel: "Banner · goes live 14 Aug", type: "banner" },
];

export interface ContentHubTypeCount {
  id: string;
  label: string;
  count: number;
}

// Destinations and FAQs — demo counts, no backend yet. Pages, Blog posts and
// Media assets are merged in live by the Content Hub page itself.
export const contentHubDemoTypeCounts: ContentHubTypeCount[] = [
  { id: "destination", label: "Destinations", count: 86 },
  { id: "faq", label: "FAQs", count: 55 },
];

// ---------------------------------------------------------------------------
// FAQs — no FAQ backend exists yet, so groups/questions and their
// helpful-percent/vote/view figures below are demo data (no real
// voting/analytics pipeline exists to source them from). The page itself
// layers real interactions on top (add/edit/delete/reorder questions, real
// rich-text answer editing, translation-language switching, and a live
// "needs attention" list derived from this seed data, not hardcoded).
// ---------------------------------------------------------------------------

export interface FaqGroup {
  id: string;
  name: string;
  slug: string;
  shownOn: string;
}

export const faqGroupsSeed: FaqGroup[] = [
  { id: "booking-payment", name: "Booking & payment", slug: "booking-payment", shownOn: "/help and the checkout sidebar" },
  { id: "cancellations", name: "Cancellations & refunds", slug: "cancellations", shownOn: "/help and the booking management page" },
  { id: "check-in", name: "Check-in & arrival", slug: "check-in", shownOn: "/help" },
  { id: "properties", name: "Properties & rooms", slug: "properties", shownOn: "/help and property detail pages" },
  { id: "loyalty", name: "Loyalty programme", slug: "loyalty", shownOn: "/help and the loyalty dashboard" },
  { id: "account", name: "Account & privacy", slug: "account", shownOn: "/help" },
];

export interface FaqQuestionTranslationValue {
  question: string;
  answerHtml: string;
}

export interface FaqQuestion {
  id: string;
  groupId: string;
  question: string;
  answerHtml: string;
  helpfulPercent: number;
  voteCount: number;
  viewCount: number;
  updatedAt: string;
  translations: Record<string, FaqQuestionTranslationValue>;
}

export const faqQuestionsSeed: FaqQuestion[] = [
  {
    id: "faq_001",
    groupId: "booking-payment",
    question: "When is my card charged for a booking?",
    answerHtml:
      "<p>For most properties we authorise your card at the time of booking and charge the full amount 48 hours before check-in. Non-refundable rates and flash offers are charged immediately. You will always see which applies on the checkout page before confirming.</p>",
    helpfulPercent: 94,
    voteCount: 612,
    viewCount: 2418,
    updatedAt: "2026-08-10T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_002",
    groupId: "booking-payment",
    question: "Which payment methods do you accept?",
    answerHtml: "<p>Visa, Mastercard, American Express, Apple Pay and Google Pay.</p>",
    helpfulPercent: 98,
    voteCount: 340,
    viewCount: 1204,
    updatedAt: "2026-08-05T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_003",
    groupId: "booking-payment",
    question: "Can I pay in instalments?",
    answerHtml: "<p>Instalment plans are available for stays over AED 3,000 booked more than 14 days in advance.</p>",
    helpfulPercent: 91,
    voteCount: 158,
    viewCount: 640,
    updatedAt: "2026-08-01T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_004",
    groupId: "booking-payment",
    question: "Is my payment information secure?",
    answerHtml: "<p>Yes — all payments are processed through PCI-DSS compliant providers and card details are never stored on our servers.</p>",
    helpfulPercent: 96,
    voteCount: 201,
    viewCount: 511,
    updatedAt: "2026-07-29T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_005",
    groupId: "booking-payment",
    question: "Why was my card declined?",
    answerHtml: "<p>Declines are usually caused by insufficient funds, an expired card, or your bank's fraud checks. Try a different card or contact your bank before retrying.</p>",
    helpfulPercent: 62,
    voteCount: 240,
    viewCount: 980,
    updatedAt: "2026-08-11T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_006",
    groupId: "booking-payment",
    question: "Do you charge a booking fee?",
    answerHtml: "<p>No — the price shown at checkout is the total price, with no hidden booking fees.</p>",
    helpfulPercent: 89,
    voteCount: 176,
    viewCount: 430,
    updatedAt: "2026-07-20T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_007",
    groupId: "booking-payment",
    question: "How do I get a VAT invoice?",
    answerHtml: "<p>Request an invoice from your booking confirmation page — draft, needs a clearer walkthrough.</p>",
    helpfulPercent: 44,
    voteCount: 118,
    viewCount: 305,
    updatedAt: "2026-08-12T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_008",
    groupId: "booking-payment",
    question: "Can I book without an account?",
    answerHtml: "<p>Yes, guest checkout is available, though creating an account lets you manage bookings and earn loyalty points.</p>",
    helpfulPercent: 93,
    voteCount: 142,
    viewCount: 388,
    updatedAt: "2026-07-15T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_009",
    groupId: "booking-payment",
    question: "What currency will I be charged in?",
    answerHtml: "<p>Your card is charged in the currency shown at checkout, which you can change from the currency switcher in the header.</p>",
    helpfulPercent: 87,
    voteCount: 133,
    viewCount: 349,
    updatedAt: "2026-07-10T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_010",
    groupId: "cancellations",
    question: "What is your cancellation policy?",
    answerHtml: "<p>Cancellation terms vary by rate and are shown on the property page and at checkout before you confirm.</p>",
    helpfulPercent: 90,
    voteCount: 210,
    viewCount: 720,
    updatedAt: "2026-08-02T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_011",
    groupId: "check-in",
    question: "What time is check-in and check-out?",
    answerHtml: "<p>Standard check-in is 3:00 PM and check-out is 11:00 AM, though this varies by property.</p>",
    helpfulPercent: 92,
    voteCount: 260,
    viewCount: 900,
    updatedAt: "2026-08-03T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_012",
    groupId: "properties",
    question: "Are pets allowed?",
    answerHtml: "<p>Pet policies vary by property — look for the pet-friendly badge on the listing or contact the host directly.</p>",
    helpfulPercent: 85,
    voteCount: 96,
    viewCount: 310,
    updatedAt: "2026-07-25T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_013",
    groupId: "loyalty",
    question: "Loyalty tier benefits",
    answerHtml: "<p>Higher loyalty tiers unlock free room upgrades, late checkout and priority support.</p>",
    helpfulPercent: 88,
    voteCount: 74,
    viewCount: 260,
    updatedAt: "2026-06-30T09:00:00Z",
    translations: {},
  },
  {
    id: "faq_014",
    groupId: "account",
    question: "How do I delete my account?",
    answerHtml: "<p>Go to Account settings → Privacy → Delete account. This is permanent and cannot be undone.</p>",
    helpfulPercent: 90,
    voteCount: 58,
    viewCount: 190,
    updatedAt: "2026-06-20T09:00:00Z",
    translations: {},
  },
];

// ---------------------------------------------------------------------------
// Banners & Sliders — no banner/slide backend exists yet, so groups/slides
// below are demo data. The page itself derives schedule status (Live/
// Scheduled/Draft/Expired) live from each slide's startDate/endDate/isActive
// rather than storing a separate status field, and layers real interactions
// on top (add/edit/delete/reorder, translation-language switching, a working
// rotation preview) using local state.
// ---------------------------------------------------------------------------

export interface BannerGroup {
  id: string;
  name: string;
}

export const bannerGroupsSeed: BannerGroup[] = [
  { id: "homepage-hero", name: "Homepage hero" },
  { id: "destination-hero", name: "Destination hero" },
  { id: "promo-strip", name: "Promo strip" },
  { id: "app-banners", name: "App banners" },
];

export interface SlideTranslationValue {
  eyebrow: string;
  headline: string;
  buttonLabel: string;
  imageOverrideLabel?: string;
}

export interface Slide {
  id: string;
  groupId: string;
  backgroundLabel: string;
  width: number;
  height: number;
  sizeKb: number;
  buttonLink: string;
  textPosition: "left" | "center";
  overlayOpacity: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  sortOrder: number;
  translations: Record<string, SlideTranslationValue>;
}

export const slidesSeed: Slide[] = [
  {
    id: "slide_001",
    groupId: "homepage-hero",
    backgroundLabel: "summer-escape-hero.jpg",
    width: 1440,
    height: 620,
    sizeKb: 604,
    buttonLink: "/campaigns/summer",
    textPosition: "left",
    overlayOpacity: 55,
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    isActive: true,
    sortOrder: 0,
    translations: {
      en: { eyebrow: "LIMITED TIME · ENDS 30 SEP", headline: "Summer escapes, 18% off", buttonLabel: "Explore offers" },
    },
  },
  {
    id: "slide_002",
    groupId: "homepage-hero",
    backgroundLabel: "maldives-hero.jpg",
    width: 1440,
    height: 620,
    sizeKb: 588,
    buttonLink: "/destinations/maldives",
    textPosition: "left",
    overlayOpacity: 45,
    isActive: true,
    sortOrder: 1,
    translations: {
      en: { eyebrow: "TRENDING DESTINATION", headline: "Discover the Maldives", buttonLabel: "Browse resorts" },
    },
  },
  {
    id: "slide_003",
    groupId: "homepage-hero",
    backgroundLabel: "winter-sale-hero.jpg",
    width: 1440,
    height: 620,
    sizeKb: 512,
    buttonLink: "/campaigns/winter-2026",
    textPosition: "center",
    overlayOpacity: 60,
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    isActive: true,
    sortOrder: 2,
    translations: {
      en: { eyebrow: "COMING SOON", headline: "Winter Sale 2026", buttonLabel: "Shop the sale" },
    },
  },
  {
    id: "slide_004",
    groupId: "homepage-hero",
    backgroundLabel: "ramadan-hero.jpg",
    width: 1440,
    height: 620,
    sizeKb: 470,
    buttonLink: "/collections/ramadan",
    textPosition: "left",
    overlayOpacity: 55,
    isActive: false,
    sortOrder: 3,
    translations: {
      en: { eyebrow: "COLLECTION", headline: "Ramadan retreats", buttonLabel: "View collection" },
    },
  },
  {
    id: "slide_005",
    groupId: "destination-hero",
    backgroundLabel: "dubai-destination-hero.jpg",
    width: 1440,
    height: 480,
    sizeKb: 460,
    buttonLink: "/destinations/dubai",
    textPosition: "left",
    overlayOpacity: 50,
    isActive: true,
    sortOrder: 0,
    translations: {
      en: { eyebrow: "DUBAI · 248 PROPERTIES", headline: "Where the desert meets five-star luxury", buttonLabel: "Search Dubai stays" },
    },
  },
  {
    id: "slide_006",
    groupId: "promo-strip",
    backgroundLabel: "loyalty-strip.jpg",
    width: 1600,
    height: 240,
    sizeKb: 210,
    buttonLink: "/loyalty",
    textPosition: "center",
    overlayOpacity: 40,
    isActive: true,
    sortOrder: 0,
    translations: {
      en: { eyebrow: "ROYAL REWARDS", headline: "Earn points on every stay", buttonLabel: "Join free" },
    },
  },
  {
    id: "slide_007",
    groupId: "app-banners",
    backgroundLabel: "app-download-banner.jpg",
    width: 1200,
    height: 400,
    sizeKb: 265,
    buttonLink: "/app",
    textPosition: "center",
    overlayOpacity: 50,
    isActive: true,
    sortOrder: 0,
    translations: {
      en: { eyebrow: "NEW", headline: "Get the Royal Vacation app", buttonLabel: "Download now" },
    },
  },
];
