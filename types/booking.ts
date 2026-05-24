// // types/home.ts

// export type TabType = 'arrivals' | 'departures' | 'in_house' | 'pending';

// export interface Booking {
//   id: number;
//   first_name: string;
//   last_name: string;
//   checking_date: string;
//   checkout_date: string;
//   checking_time?: string;
//   checkout_time?: string;
//   adults: number;
//   children: number;
//   room_count: number;
//   breakfast: string;
//   total_amount: number;
//   status: string;
//   checking_status?: string;
//   booking_room_count?: any[];
//   reservation?: any;
//   passport?: string;
//   phone?: string;
//   email?: string;
//   country?: string;
//   booking_type?: string;
//   booking_method?: string;
//   booking_date?: string;

// }

// export interface BookingData {
//   summary: {
//     date: string;
//     available_rooms: number;
//     arrivals_count: number;
//     departures_count: number;
//     in_house_count: number;
//     pending_count: number;
//     checkout_room_count: number;
//     staying_room_count: number;
//   };
//   details: {
//     arrivals: Booking[];
//     departures: Booking[];
//     in_house: Booking[];
//     pending: Booking[];
//   };
// }

// export interface PaymentInfo {
//   paid: string;
//   balance: string;
//   total: string;
// }

// export interface StatusStyle {
//   backgroundColor: string;
//   borderColor: string;
//   textColor: string;
// }


// types/home.ts

export type TabType = 'arrivals' | 'departures' | 'in_house' | 'pending';

export interface Booking {
  id: number;
  first_name: string;
  last_name: string;
  checking_date: string;
  checkout_date: string;
  checking_time?: string;
  checkout_time?: string;
  adults: number | string;
  children: number | string;
  room_count: number | string;
  breakfast: string;
  total_amount: number;
  status: string;
  checking_status?: string;
  booking_room_count?: any[];
  booking_rooms?: any[];
  rooms?: any[];
  reservation?: any;
  passport?: string;
  phone?: string;
  email?: string;
  country?: string;
  booking_type?: string;
  booking_method?: string;
  booking_date?: string;

  // Payment fields
  advance_payment?: number | null;
  card_payment?: number | null;
  cash_payment?: number | null;
  payment?: string | null;

  // USD / commission fields
  usd_amount?: string | null;
  commission?: number;
  commission_usd?: number;

  // Other fields
  booking_code?: string | null;
  w_number?: string | null;
  balance?: string | null;
  source?: string | null;
  reservation_id?: string | null;
  additional_note?: string | null;
  agency_id?: number | null;
  room_with_rate_plan?: any | null;
  summary?: any | null;
  advance_payment_due_date?: string | null;
  is_uncertain?: string;
  note?: string | null;
  address?: string | null;
  image?: string | null;
  package_id?: number | null;
  total_person?: string | number;
  hotel_id?: string;
  user_id?: string | null;
  payment_slip?: string | null;
}

export interface BookingData {
  summary: {
    date: string;
    available_rooms: number;
    arrivals_count: number;
    departures_count: number;
    in_house_count: number;
    pending_count: number;
    checkout_room_count: number;
    staying_room_count: number;
  };
  details: {
    arrivals: Booking[];
    departures: Booking[];
    in_house: Booking[];
    pending: Booking[];
  };
}

export interface PaymentInfo {
  paid: string;
  balance: string;
  total: string;
}

export interface StatusStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}