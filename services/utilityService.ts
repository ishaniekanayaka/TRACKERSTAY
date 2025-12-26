// services/utilityService.ts
import api from './../config/apiConfig';

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

// Chart data interfaces
export interface DailyReading {
  date: string;
  guests: number;
  [categoryName: string]: number | string; // Dynamic property for each category
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

class UtilityService {
  /**
   * Get all utility categories
   */
  async getCategories(): Promise<UtilityCategory[]> {
    try {
      const response = await api.get('/utility/categories');
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      }
      
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching utility categories:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }

  /**
   * Get all utilities
   */
  async getUtilities(): Promise<UtilityItem[]> {
    try {
      const response = await api.get('/utility');
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      }
      
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching utilities:', error);
      throw new Error(error.message || 'Failed to fetch utilities');
    }
  }

  /**
   * Get single utility by ID
   */
  async getUtilityById(id: number): Promise<UtilityItem> {
    try {
      const response = await api.get(`/utility/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching utility:', error);
      throw new Error(error.message || 'Failed to fetch utility');
    }
  }

  /**
   * Get chart data for utilities
   */
  async getChartData(date?: string): Promise<ChartDataResponse> {
    try {
      const params = date ? { date } : {};
      const response = await api.get<ApiChartDataResponse>('/utility/chart-data', { params });
      
      console.log('Chart data response:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid chart data response');
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      throw new Error(error.message || 'Failed to fetch chart data');
    }
  }

  /**
   * Save utility (create or update)
   * If id is provided in FormData, it will update, otherwise create
   */
  async saveUtility(data: FormData): Promise<UtilityItem> {
    try {
      const response = await api.post('/utility/save', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Save utility response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error saving utility:', error);
      throw new Error(error.message || 'Failed to save utility');
    }
  }

  /**
   * Delete utility
   */
  async deleteUtility(id: number): Promise<void> {
    try {
      await api.delete(`/utility/${id}`);
    } catch (error: any) {
      console.error('Error deleting utility:', error);
      throw new Error(error.message || 'Failed to delete utility');
    }
  }
}

export default new UtilityService();