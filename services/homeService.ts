// services/homeService.ts
import api from "../config/apiConfig";

export type NotificationItem = {
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  checkin_date: string;
  checkout_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type BookingHistoryItem = {
  event_type: string;
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
  room_counts: Array<{
    room_category_id: number;
    room_count: number;
    category_name: string;
  }>;
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

// Helper to extract a user-friendly message from any error shape
const parseErrorMessage = (error: any): string => {
  // No internet / timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please check your connection and try again.';
    return 'Unable to reach the server. Please check your internet connection.';
  }

  const status = error.response?.status;
  const serverMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.response?.data?.msg ||
    null;

  switch (status) {
    case 400: return serverMessage || 'Bad request. Please try again.';
    case 401: return 'Session expired. Please log in again.';
    case 403: return 'You do not have permission to access this data.';
    case 404: return 'Requested data not found on the server.';
    case 422: return serverMessage || 'Invalid data sent to the server.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 500: return 'Server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504: return 'Server is temporarily unavailable. Please try again shortly.';
    default:  return serverMessage || `Unexpected error (${status}). Please try again.`;
  }
};



const homeService = {

  getDailyBookingDetails: async (date: string) => {
    try {
      const { data } = await api.get(`/hotel/daily-booking-details?date=${date}`);
      return data;
    } catch (error: any) {
      // Re-throw a clean Error with a readable message so the UI can show it
      throw new Error(parseErrorMessage(error));
    }
  },

  // Get Booking History
};

export default homeService;