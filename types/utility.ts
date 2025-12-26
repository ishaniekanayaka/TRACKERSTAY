// types/utility.ts
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

export interface CreateUtilityFormData {
  date: string;
  u_category: number;
  startreading: string;
  utility_image: string | null;
}

export type UtilityFilterType = 'all' | number;