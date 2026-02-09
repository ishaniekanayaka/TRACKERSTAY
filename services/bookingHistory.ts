import api from "../config/apiConfig";

/* =======================
   TYPES
======================= */

export type RoomCount = {
  room_category_id: number;
  room_count: number;
  category_name: string;
};

export type BookingHistoryItem = {
  event_type: "created" | "updated" | "deleted";
  timestamp: string;
  user_id: number;
  booking_id: number;
  booking_code: string | null;
  guest_name: string;
  phone: string;
  email: string;
  checkin_date: string;
  checkout_date: string;
  checkin_time: string;
  checkout_time: string;
  status: string;
  total_amount: number;
  advance_payment: number;
  card_payment: number | null;
  cash_payment: number | null;
  balance: number | null;
  payment: string;
  booking_method: string;
  source: string;
  booking_type: string;
  adults: number | string;
  children: number | string;
  total_person: number;
  breakfast: string | null;
  country: string;
  note: string;
  reservation_id: string | null;
  checking_status: string | null;
  agency_id: number | null;
  rooms: any[];
  room_counts: RoomCount[];
};

export type BookingHistoryResponse = {
  success: boolean;
  summary: {
    total_events: number;
    created_count: number;
    updated_count: number;
    deleted_count: number;
    rooms_assigned_count: number;
    rooms_unassigned_count: number;
    date_range: {
      from: string;
      to: string;
    };
  };
  history: BookingHistoryItem[];
};

/* =======================
   SERVICE
======================= */

const bookingHistoryService = {
  /**
   * Get booking history
   * ✅ GET + query params (backend safe)
   */
  getBookingHistory: async (
    fromDate: string,
    toDate: string
  ): Promise<BookingHistoryResponse> => {
    try {
      const { data } = await api.get(
        "/hotel/booking-history",
        {
          params: {
            from_date: fromDate,
            to_date: toDate,
          },
        }
      );

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Filter by event type
   */
  filterByEventType: (
    history: BookingHistoryItem[],
    type: "created" | "updated" | "deleted"
  ) => history.filter(item => item.event_type === type),
};

export default bookingHistoryService;
