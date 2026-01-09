// src/types/index.ts
// TypeScript types for Admin Dashboard

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  equipment_count?: number;
  created_at: string;
}

export interface Equipment {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  brand?: string;
  model?: string;
  description?: string;
  daily_rate: number;
  weekly_rate?: number;
  replacement_value: number;
  damage_deposit: number;
  quantity_total: number;
  quantity_available: number;
  condition: 'excellent' | 'good' | 'fair' | 'maintenance';
  images: string[];
  is_active: boolean;
  popularity_score: number;
  average_rating: number;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_brand?: string;
  equipment_model?: string;
  equipment_images?: string[];
  brand?: string;
  model?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category_name?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  damage_deposit: number;
  tax: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'partial_refund';
  payment_method?: 'card' | 'apple_pay' | 'google_pay' | 'cash' | 'credit' | 'promo' | 'debit';
  stripe_payment_id?: string;
  notes?: string;
  admin_notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancelled_by_name?: string;
  extension_reason?: string;
  extended_at?: string;
  extended_by?: string;
  extended_by_name?: string;
  reactivated_at?: string;
  reactivated_by?: string;
  reactivated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalEquipment: number;
  totalBookings: number;
  totalCategories: number;
  totalRevenue?: number;
  equipment: Equipment[];
  bookings: Booking[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
