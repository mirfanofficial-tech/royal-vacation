export interface OccupancyMonth {
  label: string;
  occupancy: number;
  bookings: number;
}

export const occupancyMonthly: OccupancyMonth[] = [
  { label: "Jan", occupancy: 62, bookings: 42 },
  { label: "Feb", occupancy: 67, bookings: 48 },
  { label: "Mar", occupancy: 74, bookings: 56 },
  { label: "Apr", occupancy: 70, bookings: 50 },
  { label: "May", occupancy: 78, bookings: 61 },
  { label: "Jun", occupancy: 84, bookings: 68 },
  { label: "Jul", occupancy: 88, bookings: 77 },
  { label: "Aug", occupancy: 79, bookings: 59 },
];

export interface OccupancyProperty {
  name: string;
  location: string;
  occupancy: number;
  bookedNights: number;
  availableNights: number;
  avgStay: number;
}

export const occupancyProperties: OccupancyProperty[] = [
  { name: "The Palm Villa Retreat", location: "Palm Jumeirah, Dubai", occupancy: 91, bookedNights: 145, availableNights: 160, avgStay: 4.6 },
  { name: "Marina Yacht Penthouse", location: "Dubai Marina, Dubai", occupancy: 87, bookedNights: 139, availableNights: 160, avgStay: 3.8 },
  { name: "Downtown Executive Suite", location: "Downtown Dubai", occupancy: 82, bookedNights: 131, availableNights: 160, avgStay: 2.9 },
  { name: "Grand Marina Residence", location: "Dubai Marina, Dubai", occupancy: 79, bookedNights: 126, availableNights: 160, avgStay: 3.2 },
  { name: "Corniche Beachfront Studio", location: "Abu Dhabi Corniche", occupancy: 64, bookedNights: 102, availableNights: 160, avgStay: 2.6 },
];

export interface LeadTimeBucket {
  label: string;
  share: number;
  bookings: number;
}

export const occupancyLeadTime: LeadTimeBucket[] = [
  { label: "Same day", share: 18, bookings: 41 },
  { label: "1–7 days", share: 32, bookings: 74 },
  { label: "8–30 days", share: 27, bookings: 62 },
  { label: "31–90 days", share: 16, bookings: 37 },
  { label: "90+ days", share: 7, bookings: 16 },
];

export const occupancyKpis = {
  rate: 84,
  rateDelta: 6.2,
  bookedNights: 654,
  availableNights: 1240,
  bookedDelta: 8.9,
  avgStay: 3.4,
  avgStayDelta: 2.1,
  cancellations: 9,
  cancellationRate: 3.8,
};
