// // services/bookingCalendar.ts
// import api from "@/config/apiConfig";

// export interface RoomBookingEntry {
//   booking_id: number;
//   guest_name: string;
//   start_date: string;
//   end_date: string;
//   booking_type?: string;
//   status: string;
//   method?: string;
//   [key: string]: any;
// }

// export interface RepairEntry {
//   repair_id?: number;
//   id?: number;
//   start_date: string;
//   end_date: string;
//   description?: string;
//   note?: string;
//   [key: string]: any;
// }

// export interface CalendarRoom {
//   id?: number;
//   room_id: number;
//   room_number: string;
//   room_name?: string;
//   bookings: RoomBookingEntry[];
//   repairs: RepairEntry[];
//   [key: string]: any;
// }

// export interface CalendarCategory {
//   category_id: number;
//   category_name: string;
//   rooms: CalendarRoom[];
// }

// export interface BookingCalendarResponse {
//   categories: CalendarCategory[];
//   days_in_month: string[];
//   start_date?: string;
//   end_date?: string;
// }

// const getCalendarBookings = async (
//   bDate: string
// ): Promise<BookingCalendarResponse> => {
//   try {
//     console.log("📡 Fetching calendar for:", bDate);
//     const res = await api.get("/over_roll_booking_api", {
//       params: { b_date: bDate },
//     });
//     return res.data;
//   } catch (error) {
//     console.error("❌ Calendar Error:", error);
//     throw error;
//   }
// };

// export default { getCalendarBookings };


// services/bookingCalendar.ts
import api from "@/config/apiConfig";

export interface RoomBookingEntry {
  booking_id: number;
  guest_name: string;
  start_date: string;
  end_date: string;
  booking_type?: string;
  status: string;
  method?: string;
  [key: string]: any;
}

export interface RepairEntry {
  repair_id?: number;
  id?: number;
  start_date: string;
  end_date: string;
  description?: string;
  note?: string;
  [key: string]: any;
}

export interface CalendarRoom {
  id?: number;
  room_id: number;
  room_number: string;
  room_name?: string;
  bookings: RoomBookingEntry[];
  repairs: RepairEntry[];
  [key: string]: any;
}

export interface CalendarCategory {
  category_id: number;
  category_name: string;
  rooms: CalendarRoom[];
}

export interface BookingCalendarResponse {
  categories: CalendarCategory[];
  days_in_month: string[];
  start_date?: string;
  end_date?: string;
}

// Full booking detail returned from getOneBookingDeatils
export interface BookingDetail {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  checking_date: string;
  checkout_date: string;
  checking_time?: string;
  checkout_time?: string;
  total_amount?: number;
  usd_amount?: string;
  commission?: number;
  commission_usd?: number;
  advance_payment?: number | null;
  adults?: string;
  children?: string;
  room_count?: string;
  booking_method?: string;
  breakfast?: string;
  status: string;
  booking_code?: string;
  note?: string;
  additional_note?: string;
  source?: string;
  booking_type?: string;
  country?: string;
  booking_rooms?: { id: number; booking_id: string; room_id: string }[];
  booking_room_count?: {
    room_count: string;
    room_categories?: { id: number; category_name?: string; [k: string]: any };
    [k: string]: any;
  }[];
  [key: string]: any;
}

const getCalendarBookings = async (
  bDate: string
): Promise<BookingCalendarResponse> => {
  try {
    const res = await api.get("/over_roll_booking_api", {
      params: { b_date: bDate },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Calendar Error:", error);
    throw error;
  }
};

const getBookingDetail = async (bookingId: number): Promise<BookingDetail> => {
  try {
    const res = await api.get("/over_roll_booking_api/getOneBookingDeatils", {
      params: { booking_id: bookingId },
    });
    // API returns { success, booking: {...} }
    return res.data?.booking ?? res.data;
  } catch (error) {
    console.error("❌ Booking Detail Error:", error);
    throw error;
  }
};

export default { getCalendarBookings, getBookingDetail };