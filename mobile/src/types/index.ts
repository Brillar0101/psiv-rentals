// src/types/index.ts
// Complete TypeScript types for PSIV Rentals Mobile

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  profile_image_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  equipment_count?: number;
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
  specifications?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  equipment_id: string;
  equipment_name?: string;
  brand?: string;
  model?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  damage_deposit: number;
  tax: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  stripe_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  equipment_id: string;
  rating: number;
  comment?: string;
  user_name?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

// Navigation types
export type RootStackParamList = {
  // Auth
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
  
  // Main
  MainTabs: undefined;
  
  // Equipment
  EquipmentDetail: { id: string };
  EquipmentGallery: { images: string[]; initialIndex: number };
  Reviews: { equipmentId: string };
  WriteReview: { bookingId: string; equipmentId: string };
  
  // Booking
  DateSelection: { equipmentId: string };
  BookingSummary: { bookingData: any };
  PaymentMethod: { bookingId: string };
  BookingConfirmation: { bookingId: string };
  
  // Profile
  EditProfile: undefined;
  BookingDetail: { id: string };
  Settings: undefined;
  
  // Support
  HelpCenter: undefined;
  Chatbot: undefined;
  LiveChat: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
};

// API Response types
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

export interface LoginResponse {
  user: User;
  token: string;
}

export interface BookingAvailability {
  available: boolean;
  pricing?: {
    daily_rate: number;
    weekly_rate?: number;
    total_days: number;
    subtotal: number;
    damage_deposit: number;
    tax: number;
    total_amount: number;
  };
}
