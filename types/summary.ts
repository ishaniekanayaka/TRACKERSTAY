// // types/summary.ts

// export interface BookingSummaryItem {
//   id: number;
//   guest_name: string;
//   guest_details: string;
//   check_in: string;
//   check_out: string;
//   rooms: number;
//   booked_on: string;
//   status: string;
//   price: number;
//   commission: number;
//   source: string;
//   booking_number: string | null;
// }

// export interface BookingSummaryTotals {
//   total_price: number;
//   total_commission: number;
//   total_bookings: number;
// }

// export interface BookingSummaryResponse {
//   success: boolean;
//   summary: BookingSummaryTotals;
//   data: BookingSummaryItem[];
// }


// types/summary.ts - Add these types to your existing summary types file

export interface BookingSummaryItem {
  id: number;
  guest_name: string;
  guest_details: string;
  check_in: string;
  check_out: string;
  rooms: string;
  booked_on: string;
  status: string;
  price: number;
  usdprice: number;
  commission: number;
  booking_number?: string;
  source: string;
}

export interface SummaryStats {
  total_bookings: number;
  total_price: number;
  total_commission: number;
}

export interface BookingSummaryResponse {
  data: BookingSummaryItem[];
  summary: SummaryStats;
}

// NEW: Types for monthly chart
export interface MonthlyChartResponse {
  labels: string[];
  earned: number[];
  upcoming: number[];
  selected: string;
}