export type ExtraOption = {
  id: string;
  icon: "breakfast" | "pickup" | "insurance";
  title: string;
  description: string;
  price: number;
};

export const extraOptions: ExtraOption[] = [
  {
    id: "breakfast",
    icon: "breakfast",
    title: "Breakfast",
    description: "Daily breakfast for 2 people",
    price: 4000,
  },
  {
    id: "airport-pickup",
    icon: "pickup",
    title: "Airport Pickup",
    description: "Private pickup from airport",
    price: 6500,
  },
  {
    id: "travel-insurance",
    icon: "insurance",
    title: "Travel Insurance",
    description: "Coverage for your trip",
    price: 2800,
  },
];

export type PaymentMethod = {
  id: string;
  icon: "card" | "easypaisa" | "jazzcash" | "bank";
  title: string;
  subtitle: string;
};

export const paymentMethods: PaymentMethod[] = [
  { id: "card", icon: "card", title: "Credit / Debit Card", subtitle: "Visa, Mastercard, etc." },
  { id: "easypaisa", icon: "easypaisa", title: "EasyPaisa", subtitle: "Pay with EasyPaisa" },
  { id: "jazzcash", icon: "jazzcash", title: "JazzCash", subtitle: "Pay with JazzCash" },
  { id: "bank", icon: "bank", title: "Bank Transfer", subtitle: "Direct bank transfer" },
];

export const countryOptions = [
  { value: "PK", label: "Pakistan", dialCode: "+92" },
  { value: "AE", label: "United Arab Emirates", dialCode: "+971" },
  { value: "SA", label: "Saudi Arabia", dialCode: "+966" },
  { value: "GB", label: "United Kingdom", dialCode: "+44" },
  { value: "US", label: "United States", dialCode: "+1" },
  { value: "TR", label: "Turkey", dialCode: "+90" },
];

export const checkoutSteps = [
  { id: "guest-details", label: "Guest Details" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review & Confirm" },
];
