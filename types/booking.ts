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
  adults: number;
  children: number;
  room_count: number;
  breakfast: string;
  total_amount: number;
  status: string;
  checking_status?: string;
  booking_room_count?: any[];
  reservation?: any;
  passport?: string;
  phone?: string;
  email?: string;
  country?: string;
  booking_type?: string;
  booking_method?: string;
  booking_date?: string;

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