// // src/services/homeService.ts
// import api from "../config/apiConfig";

// const homeService = {
//   getDailyBookingDetails: async (date: string) => {
//     const { data } = await api.get(`/hotel/daily-booking-details?date=${date}`);
//     return data;
//   },
// };

// export default homeService;


// src/services/homeService.ts
import api from "../config/apiConfig";

const homeService = {
  getDailyBookingDetails: async (date: string) => {
    try {
      const { data } = await api.get(`/hotel/daily-booking-details?date=${date}`);
      return data;
    } catch (error: any) {
      // Let the interceptor handle 401 errors
      throw error;
    }
  },
};

export default homeService;