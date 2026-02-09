// services/utilityService.ts
import api from './../config/apiConfig';

/* =======================
   Interfaces
======================= */

export interface UtilityCategory {
  id: number;
  utility_category_name: string;
  hotel_id: number;
  status: string;
  is_visible: number;
  monthly_charj: string;
  unit_price: number;
  average: string;
  difference: string;
  guest: string;
  range_date: number;
  point: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UtilityUser {
  id: number;
  name: string;
  email: string;
  lname: string;
  status: string;
  role: string;
  hotel_chain_id: number;
  user_type: string | null;
  mode: string | null;
  hotel_id: number;
  created_at: string;
  updated_at: string;
}

export interface UtilityItem {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  hotel_id: number;
  user_id: number;
  date: string;
  image: string;
  u_category: string;
  startreading: string;
  status: string;
  u_category_id: number;
  user: UtilityUser;
}

/* =======================
   Chart Interfaces
======================= */

export interface DailyReading {
  date: string;
  guests: number;
  [categoryName: string]: number | string;
}

export interface CategoryChartData {
  categoryName: number;
  categoryDisplayName: string;
  readings: DailyReading[];
}

export interface TotalCount {
  total_count: number;
  category: string;
  category_id: number;
  total_bill: string;
}

export interface TotalBillCount {
  total_bill_count: number;
  category: string;
  category_id: number;
  total_BillReading: string;
}

export interface ChartDataResponse {
  chartData: CategoryChartData[];
  total_count: TotalCount[];
  total_bill_count: TotalBillCount[];
}

export interface ApiChartDataResponse {
  success: boolean;
  data: ChartDataResponse;
  date: string;
}

/* =======================
   Utility Service
======================= */

class UtilityService {
  /**
   * Get all utility categories
   */
  async getCategories(): Promise<UtilityCategory[]> {
    const response = await api.get('/utility/categories');
    return response.data.data || [];
  }

  /**
   * Get all utilities
   */
  async getUtilities(): Promise<UtilityItem[]> {
    const response = await api.get('/utility');
    return response.data.data || [];
  }

  /**
   * Get single utility by ID
   */
  async getUtilityById(id: number): Promise<UtilityItem> {
    const response = await api.get(`/utility/${id}`);
    return response.data.data;
  }

  /**
   * Get chart data
   */
  async getChartData(date?: string): Promise<ChartDataResponse> {
    const response = await api.get<ApiChartDataResponse>(
      '/utility/chart-data',
      { params: date ? { date } : {} }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Failed to load chart data');
  }

  /**
   * Create utility
   */
  async saveUtility(data: FormData): Promise<UtilityItem> {
    const response = await api.post('/utility/save', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  }

  /**
   * ✅ UPDATE utility (NEW API)
   * POST /api/utility/update/{id}
   */
  async updateUtility(
    id: number,
    data: FormData
  ): Promise<UtilityItem> {
    try {
      const response = await api.post(
        `/utility/update/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error updating utility:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update utility'
      );
    }
  }

  /**
   * Delete utility
   */
  async deleteUtility(id: number): Promise<void> {
    await api.delete(`/utility/${id}`);
  }
}

export default new UtilityService();
