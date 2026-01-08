// mobile/src/services/api.ts
// COMPLETE FILE with getFeatured added

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = 'http://10.0.0.171:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.message);
    
    if (error.response) {
      console.error('Response:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('401 Error - Clearing auth and redirecting to login');
        await AsyncStorage.multiRemove(['token', 'user']);
        Alert.alert('Session Expired', 'Please login again', [{ text: 'OK' }]);
      }
    }
    
    return Promise.reject(error);
  }
);

// Search parameters interface
export interface SearchParams {
  search?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  available_only?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'popularity' | 'rating' | 'newest';
  limit?: number;
  page?: number;
}

export const equipmentAPI = {
  getAll: async (params?: SearchParams) => {
    const response = await api.get('/equipment', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  getByCategory: async (categoryId: string) => {
    const response = await api.get(`/equipment/category/${categoryId}`);
    return response.data;
  },
  getFeatured: async (limit: number = 6) => {
    const response = await api.get(`/equipment/featured?limit=${limit}`);
    return response.data;
  },
  search: async (query: string, options?: Omit<SearchParams, 'search'>) => {
    const response = await api.get('/equipment', {
      params: { search: query, ...options }
    });
    return response.data;
  },
};

export const bookingAPI = {
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/user');
      return response.data;
    } catch (error: any) {
      console.error('Get user bookings error:', error);
      if (error.response?.status === 401) {
        return { success: false, data: [], requiresAuth: true };
      }
      return { success: false, data: [] };
    }
  },
  checkAvailability: async (data: { equipment_id: string; start_date: string; end_date: string }) => {
    const response = await api.post('/bookings/check-availability', data);
    return response.data;
  },
  createBooking: async (bookingData: any) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getBookingById: async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },
  cancelBooking: async (bookingId: string) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
};

export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  terms_accepted: boolean;
  data_collection_consent: boolean;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Search Analytics API - Track what users search for
export const analyticsAPI = {
  logSearch: async (query: string, resultsCount: number, selectedItemId?: string) => {
    try {
      await api.post('/analytics/search', {
        query,
        results_count: resultsCount,
        selected_item_id: selectedItemId,
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.log('Analytics log failed:', error);
    }
  },
};

export const cartAPI = {
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error: any) {
      console.error('Get cart error:', error);
      if (error.response?.status === 401) {
        return { success: false, data: { items: [], summary: {} }, requiresAuth: true };
      }
      return { success: false, data: { items: [], summary: {} } };
    }
  },
  addItem: async (item: any) => {
    const response = await api.post('/cart/add', item);
    return response.data;
  },
  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  },
  removeItem: async (itemId: string) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
  checkout: async (paymentMethodId?: string) => {
    const response = await api.post('/cart/checkout', { payment_method_id: paymentMethodId });
    return response.data;
  },
  // Checkout with promo code and/or credits (for zero-payment or discounted orders)
  checkoutWithDiscounts: async (data: {
    promo_code?: string;
    use_credits?: number;
    payment_method_id?: string;
  }) => {
    const response = await api.post('/cart/checkout', data);
    return response.data;
  },
};

// Promo Codes and Credits API
export const promoAPI = {
  // Validate a promo code before applying
  validateCode: async (code: string, orderTotal: number) => {
    try {
      const response = await api.post('/promo/validate', { code, order_total: orderTotal });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid promo code',
      };
    }
  },

  // Apply a promo code to an order
  applyCode: async (code: string, orderTotal: number, bookingId?: string) => {
    try {
      const response = await api.post('/promo/apply', {
        code,
        order_total: orderTotal,
        booking_id: bookingId,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to apply promo code',
      };
    }
  },

  // Get user's credit balance and history
  getCredits: async () => {
    try {
      const response = await api.get('/promo/credits');
      return response.data;
    } catch (error: any) {
      console.error('Get credits error:', error);
      return { success: false, data: { balance: 0, transactions: [] } };
    }
  },

  // Use credits for a booking
  useCredits: async (amount: number, bookingId?: string) => {
    try {
      const response = await api.post('/promo/credits/use', {
        amount,
        booking_id: bookingId,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to use credits',
      };
    }
  },
};

export default api;