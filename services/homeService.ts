// import api from "../config/apiConfig";

// const homeService = {
//   getDailyBookingDetails: async (date: string) => {
//     try {
//       const { data } = await api.get(`/hotel/daily-booking-details?date=${date}`);
//       return data;
//     } catch (error: any) {
//       // Let the interceptor handle 401 errors
//       throw error;
//     }
//   },
// };

// export default homeService;


// services/homeService.ts
import api from "../config/apiConfig";

export type NotificationItem = {
  booking_id: string;
  "customer_name": string;
  "customer_phone": string;
  "customer_email": string;
  "checkin_date": string;
  "checkout_date": string;
  "status": string;
  "created_at": string;
  "updated_at": string;
};

const homeService = {

  getDailyBookingDetails: async (date: string) => {
    try {
      const { data } = await api.get(`/hotel/daily-booking-details?date=${date}`);
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  // NEW: Get notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const { data } = await api.get("/hotel/notifications");
      // API returns { notifications: [...] }
      return data.notifications || [];
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },
};

export default homeService;