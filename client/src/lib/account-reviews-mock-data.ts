/** Mock data for the account "Reviews" screen. No reviews backend exists yet —
 *  swap these for real API calls once one does. */

export type ReviewStat = {
  key: string;
  label: string;
  value: string;
  sub: string;
};

export const reviewStats: ReviewStat[] = [
  { key: "written", label: "Reviews written", value: "12", sub: "across 9 countries" },
  { key: "score", label: "Average score given", value: "9.1", sub: "you rate higher than 68%" },
  { key: "helpful", label: "Helpful votes", value: "341", sub: "from other travellers" },
  { key: "photos", label: "Photos shared", value: "46", sub: "in 7 reviews" },
  { key: "credit", label: "Credit earned", value: "$240", sub: "$20 per verified review" },
];

export type ReviewReply = { author: string; date: string; text: string };

export type MyReview = {
  id: string;
  propertyName: string;
  location: string;
  image: string;
  roomType: string;
  nights: number;
  stayedOn: string;
  status: "published" | "pending";
  /** e.g. "Reviewed 2 April 2026" or "Submitted 19 January 2026" */
  dateLabel: string;
  /** sortable ISO-ish date */
  sortDate: string;
  score: number;
  title: string;
  pros: string;
  cons?: string;
  photos: string[];
  reply?: ReviewReply;
  helpfulVotes: number;
  views: number;
};

export const myReviews: MyReview[] = [
  {
    id: "mr-burj",
    propertyName: "Burj Al Arab Jumeirah",
    location: "Dubai, United Arab Emirates",
    image: "https://picsum.photos/seed/rv-mr-burj/240/180",
    roomType: "Deluxe Suite",
    nights: 4,
    stayedOn: "March 2026",
    status: "published",
    dateLabel: "Reviewed 2 April 2026",
    sortDate: "2026-04-02",
    score: 9.6,
    title: "A flawless stay from arrival to check-out",
    pros: "Everything was perfect. The staff exceeded every expectation — private beach access, in-suite dining and a butler who anticipated what we needed before we asked.",
    cons: "Breakfast queues were long around 9am on weekends.",
    photos: [
      "https://picsum.photos/seed/rv-mr-burj-a/160/120",
      "https://picsum.photos/seed/rv-mr-burj-b/160/120",
      "https://picsum.photos/seed/rv-mr-burj-c/160/120",
    ],
    reply: {
      author: "Burj Al Arab Jumeirah",
      date: "3 April 2026",
      text: "Thank you for the wonderful words, Amina. We have added more breakfast seating for weekend mornings and hope to welcome your family back soon.",
    },
    helpfulVotes: 48,
    views: 2140,
  },
  {
    id: "mr-fourseasons",
    propertyName: "Four Seasons Resort Dubai",
    location: "Jumeirah Beach, Dubai",
    image: "https://picsum.photos/seed/rv-mr-fs/240/180",
    roomType: "Sea View Room",
    nights: 3,
    stayedOn: "July 2025",
    status: "published",
    dateLabel: "Reviewed 9 July 2025",
    sortDate: "2025-07-09",
    score: 8.8,
    title: "Great beach, average breakfast",
    pros: "The beach setup is the best in the city and the kids' club kept our two entertained all afternoon. Rooms are spacious and spotless.",
    cons: "Breakfast was repetitive after the second morning and the pool bar service was slow.",
    photos: [],
    helpfulVotes: 22,
    views: 1315,
  },
  {
    id: "mr-mamounia",
    propertyName: "La Mamounia Marrakech",
    location: "Marrakech, Morocco",
    image: "https://picsum.photos/seed/rv-mr-mamounia/240/180",
    roomType: "Garden Suite",
    nights: 5,
    stayedOn: "August 2025",
    status: "published",
    dateLabel: "Reviewed 28 August 2025",
    sortDate: "2025-08-28",
    score: 9.4,
    title: "The gardens alone are worth the trip",
    pros: "Every corner of this hotel is photogenic. The spa hammam was the highlight, and staff arranged a private guide for the medina within an hour of asking.",
    photos: [],
    reply: {
      author: "La Mamounia",
      date: "30 August 2025",
      text: "Shukran, Amina. Our gardeners will be delighted to read this — we hope to host you again during orange blossom season.",
    },
    helpfulVotes: 37,
    views: 1884,
  },
  {
    id: "mr-danieli",
    propertyName: "Hotel Danieli Venice",
    location: "Venice, Italy",
    image: "https://picsum.photos/seed/rv-mr-danieli/240/180",
    roomType: "Classic Room",
    nights: 3,
    stayedOn: "January 2026",
    status: "pending",
    dateLabel: "Submitted 19 January 2026",
    sortDate: "2026-01-19",
    score: 7.2,
    title: "Historic setting, tired bathroom",
    pros: "The lobby and rooftop terrace are genuinely breathtaking, and the location on the waterfront could not be better.",
    cons: "Our bathroom needed refurbishment and the canal-side room was noisy from early morning boat traffic.",
    photos: [],
    helpfulVotes: 0,
    views: 0,
  },
  {
    id: "mr-aman-tokyo",
    propertyName: "Aman Tokyo",
    location: "Otemachi, Tokyo",
    image: "https://picsum.photos/seed/rv-mr-aman/240/180",
    roomType: "Deluxe Room",
    nights: 2,
    stayedOn: "October 2025",
    status: "published",
    dateLabel: "Reviewed 14 October 2025",
    sortDate: "2025-10-14",
    score: 9.5,
    title: "Calm in the middle of the city",
    pros: "The 33rd-floor onsen with skyline views is unforgettable. Impeccably quiet rooms and the most attentive housekeeping I've experienced.",
    photos: [
      "https://picsum.photos/seed/rv-mr-aman-a/160/120",
      "https://picsum.photos/seed/rv-mr-aman-b/160/120",
    ],
    helpfulVotes: 41,
    views: 1620,
  },
  {
    id: "mr-plaza",
    propertyName: "The Plaza New York",
    location: "Midtown, New York",
    image: "https://picsum.photos/seed/rv-mr-plaza/240/180",
    roomType: "Edwardian Suite",
    nights: 2,
    stayedOn: "December 2025",
    status: "published",
    dateLabel: "Reviewed 30 December 2025",
    sortDate: "2025-12-30",
    score: 8.4,
    title: "Iconic, but you pay for the address",
    pros: "Location on Central Park is unbeatable and the suite was enormous. Turndown service and the concierge were excellent.",
    cons: "Wi-Fi was slow for the price and the restaurant was fully booked all three nights.",
    photos: ["https://picsum.photos/seed/rv-mr-plaza-a/160/120"],
    helpfulVotes: 19,
    views: 980,
  },
];

export type PropertyReview = {
  id: string;
  propertyName: string;
  image: string;
  reviewer: string;
  reviewerCountry: string;
  date: string;
  score: number;
  text: string;
  helpfulVotes: number;
};

export const followedPropertyReviews: PropertyReview[] = [
  {
    id: "pr-1",
    propertyName: "Burj Al Arab Jumeirah",
    image: "https://picsum.photos/seed/rv-pr-1/240/180",
    reviewer: "Marco",
    reviewerCountry: "Italy",
    date: "14 February 2026",
    score: 9.8,
    text: "Second stay this year and still the benchmark. The chauffeur pickup and the spa were the highlights.",
    helpfulVotes: 22,
  },
  {
    id: "pr-2",
    propertyName: "Atlantis, The Palm",
    image: "https://picsum.photos/seed/rv-pr-2/240/180",
    reviewer: "Sofia",
    reviewerCountry: "Spain",
    date: "1 February 2026",
    score: 8.4,
    text: "Fantastic for a weekend with friends. Rooms are starting to show their age but service made up for it.",
    helpfulVotes: 9,
  },
  {
    id: "pr-3",
    propertyName: "Address Downtown",
    image: "https://picsum.photos/seed/rv-pr-3/240/180",
    reviewer: "James",
    reviewerCountry: "United Kingdom",
    date: "18 January 2026",
    score: 9.1,
    text: "Perfectly located for New Year. Ask for a high floor on the fountain side.",
    helpfulVotes: 15,
  },
];

export type PendingReview = {
  id: string;
  propertyName: string;
  image: string;
  roomType: string;
  nights: number;
  stayedOn: string;
  closesInDays: number;
};

export const waitingForReview: PendingReview[] = [
  {
    id: "pending-amanpuri",
    propertyName: "Amanpuri Phuket",
    image: "https://picsum.photos/seed/rv-pending-aman/240/180",
    roomType: "Villa",
    nights: 6,
    stayedOn: "15 Feb 2026",
    closesInDays: 12,
  },
  {
    id: "pending-ritz",
    propertyName: "The Ritz Paris",
    image: "https://picsum.photos/seed/rv-pending-ritz/240/180",
    roomType: "Suite",
    nights: 2,
    stayedOn: "23 Nov 2025",
    closesInDays: 3,
  },
];

export type ReviewerProfile = {
  name: string;
  initials: string;
  level: number;
  standing: string;
  toNext: string;
  progressPct: number;
  badges: { key: string; label: string }[];
};

export const reviewerProfile: ReviewerProfile = {
  name: "Amina Khan",
  initials: "AK",
  level: 3,
  standing: "Level 3 reviewer · Top 8% in Dubai",
  toNext: "3 more reviews to reach Level 4 and unlock early access to new stays.",
  progressPct: 72,
  badges: [
    { key: "photo", label: "Photo pro" },
    { key: "detailed", label: "Detailed" },
    { key: "first", label: "First to review" },
  ],
};

export const reviewCredit = {
  amount: "$240",
  fromCount: 12,
  note: "Earned from 12 verified reviews. Credit applies automatically at checkout on any stay.",
};

export type UnfinishedDraft = {
  id: string;
  propertyName: string;
  saved: string;
  percent: number;
};

export const unfinishedDrafts: UnfinishedDraft[] = [
  { id: "draft-aman", propertyName: "Amanpuri Phuket", saved: "Saved 3 days ago", percent: 60 },
  { id: "draft-ritz", propertyName: "The Ritz Paris", saved: "Saved 2 weeks ago", percent: 20 },
];

export const howReviewsWork: string[] = [
  "Only guests who completed a stay can post a review.",
  "Reviews stay editable for 48 hours after publishing.",
  "Personal details and photos of other guests are removed.",
  "Properties may reply once to every review.",
];

export const draftCount = unfinishedDrafts.length;
export const propertyReviewCount = 1348;

export function scoreLabel(score: number): string {
  if (score >= 9.3) return "Exceptional";
  if (score >= 8.6) return "Fabulous";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  if (score >= 5) return "Fair";
  return "Poor";
}
