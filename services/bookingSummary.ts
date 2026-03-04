// // services/bookingSummary.ts
// import api from "@/config/apiConfig";
// import { BookingSummaryResponse } from "@/types/summary";



// const getBookingSummary = async (
//   fromDate: string,
//   toDate: string
// ): Promise<BookingSummaryResponse> => {
//   try {
//     console.log("📡 Sending GET request with params:", {
//       from_date: fromDate,
//       to_date: toDate,
//     });

//     const res = await api.get("/booking_summery/view", {
//       params: {
//         from_date: fromDate,
//         to_date: toDate,
//       },
//     });

//     console.log("✅ Service received response:", res.data);
//     return res.data;
//   } catch (error) {
//     console.error("❌ Booking Summary Service Error:", error);
//     throw error;
//   }
// };

// export default {
//   getBookingSummary,
// };

// services/bookingSummary.ts
import api from "@/config/apiConfig";
import { BookingSummaryResponse } from "@/types/summary";

export interface MonthlyChartResponse {
  labels: string[];
  earned: number[];
  upcoming: number[];
  selected: string;
}

const getMonthlyChart = async (
  selectedMonth: string // "2026-02"
): Promise<MonthlyChartResponse> => {
  try {
    console.log("📡 Fetching monthly chart data:", selectedMonth);

    const res = await api.get("/booking_summery/report", {
      params: {
        selected_month: selectedMonth,
      },
    });

    console.log("✅ Monthly chart response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Monthly Chart Service Error:", error);
    throw error;
  }
};

const getBookingSummary = async (
  fromDate: string,
  toDate: string
): Promise<BookingSummaryResponse> => {
  try {
    console.log("📡 Sending GET request with params:", {
      from_date: fromDate,
      to_date: toDate,
    });

    const res = await api.get("/booking_summery/view", {
      params: {
        from_date: fromDate,
        to_date: toDate,
      },
    });

    console.log("✅ Service received response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Booking Summary Service Error:", error);
    throw error;
  }
};

export default {
  getBookingSummary,
  getMonthlyChart,
};