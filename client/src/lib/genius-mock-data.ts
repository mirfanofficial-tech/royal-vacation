export type GeniusMember = {
  firstName: string;
  fullName: string;
  membershipNumber: string;
  memberSince: string;
  levelIndex: number; // 0-based index into geniusLevels
  qualifyingStays: number;
  totalSaved: number;
  currency: string;
  rewardPoints: number;
  nextLevelDeadline: string;
};

export const geniusMember: GeniusMember = {
  firstName: "Aisha",
  fullName: "Aisha Rahman",
  membershipNumber: "RV 8842 1099 31",
  memberSince: "March 2024",
  levelIndex: 1,
  qualifyingStays: 7,
  totalSaved: 1284,
  currency: "$",
  rewardPoints: 3450,
  nextLevelDeadline: "31 Dec 2026",
};

export type GeniusLevel = {
  name: string;
  staysRequired: number;
  discountPercent: number;
  benefits: string[];
};

export const geniusLevels: GeniusLevel[] = [
  {
    name: "Level 1",
    staysRequired: 2,
    discountPercent: 10,
    benefits: ["10% off selected stays", "Member-only prices", "Free cancellation on most rooms"],
  },
  {
    name: "Level 2",
    staysRequired: 5,
    discountPercent: 15,
    benefits: [
      "15% off selected stays",
      "Free breakfast at 4,200+ stays",
      "Priority email support",
      "Everything in Level 1",
    ],
  },
  {
    name: "Level 3",
    staysRequired: 10,
    discountPercent: 20,
    benefits: [
      "20% off selected stays",
      "Free room upgrades",
      "24/7 concierge line",
      "Late checkout to 15:00",
      "Everything in Level 2",
    ],
  },
];

export type QualifyingStay = {
  id: string;
  propertyName: string;
  location: string;
  dateRange: string;
  status: "completed" | "upcoming";
  savedAmount?: number;
};

export const qualifyingStays: QualifyingStay[] = [
  {
    id: "stay-1",
    propertyName: "Burj Al Arab Jumeirah",
    location: "Dubai",
    dateRange: "12 — 15 Nov 2026",
    status: "completed",
    savedAmount: 286,
  },
  {
    id: "stay-2",
    propertyName: "The Ritz-Carlton",
    location: "Doha",
    dateRange: "3 — 6 Oct 2026",
    status: "completed",
    savedAmount: 164,
  },
  {
    id: "stay-3",
    propertyName: "Rove Downtown",
    location: "Dubai",
    dateRange: "21 — 23 Aug 2026",
    status: "completed",
    savedAmount: 71,
  },
  {
    id: "stay-4",
    propertyName: "Marina Bay Suites",
    location: "Singapore",
    dateRange: "8 — 11 Jan 2027",
    status: "upcoming",
  },
];

export type GeniusProperty = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  ratingLabel: string;
  geniusPrice: number;
  currency: string;
  savePercent: number;
};

export const geniusProperties: GeniusProperty[] = [
  {
    id: "gp-1",
    name: "Atlantis, The Palm",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-genius-atlantis/640/480",
    rating: 9.1,
    ratingLabel: "Exceptional",
    geniusPrice: 1420,
    currency: "AED",
    savePercent: 15,
  },
  {
    id: "gp-2",
    name: "The Ritz-Carlton",
    location: "Doha, Qatar",
    image: "https://picsum.photos/seed/royal-genius-ritz-doha/640/480",
    rating: 9.4,
    ratingLabel: "Exceptional",
    geniusPrice: 980,
    currency: "QAR",
    savePercent: 15,
  },
  {
    id: "gp-3",
    name: "Marina Bay Suites",
    location: "Singapore",
    image: "https://picsum.photos/seed/royal-genius-marina-bay/640/480",
    rating: 8.9,
    ratingLabel: "Wonderful",
    geniusPrice: 610,
    currency: "SGD",
    savePercent: 15,
  },
  {
    id: "gp-4",
    name: "Rove Downtown",
    location: "Dubai, UAE",
    image: "https://picsum.photos/seed/royal-genius-rove-downtown/640/480",
    rating: 8.6,
    ratingLabel: "Wonderful",
    geniusPrice: 385,
    currency: "AED",
    savePercent: 15,
  },
];

export type GeniusStep = {
  step: string;
  title: string;
  description: string;
};

export const geniusSteps: GeniusStep[] = [
  {
    step: "01",
    title: "Book and complete 2 stays",
    description:
      "Any stay counts once you've checked out. Trips booked before joining count too.",
  },
  {
    step: "02",
    title: "Unlock Level 1 instantly",
    description:
      "Discounts apply automatically at checkout — you'll see the Genius label on every eligible property.",
  },
  {
    step: "03",
    title: "Keep climbing",
    description: "5 stays takes you to Level 2, 10 stays to Level 3. Levels are yours permanently.",
  },
];
