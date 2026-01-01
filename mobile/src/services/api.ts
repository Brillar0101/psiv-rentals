// mobile/src/services/api.ts
// Fixed version with better auth handling

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = 'http://172.20.4.208:5000/api';  // ← YOUR IP HERE

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
      
      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        console.log('401 Error - Clearing auth and redirecting to login');
        
        // Clear auth data
        await AsyncStorage.multiRemove(['token', 'user']);
        
        // Show alert
        Alert.alert(
          'Session Expired',
          'Please login again',
          [{ text: 'OK' }]
        );
        
        // Note: Navigation to login will happen automatically
        // because auth state will update
      }
    }
    
    return Promise.reject(error);
  }
);

export const equipmentAPI = {
  getAll: async () => {
    const response = await api.get('/equipment');
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
  search: async (query: string) => {
    const response = await api.get(`/equipment/search?q=${query}`);
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
      // Return empty data instead of throwing
      if (error.response?.status === 401) {
        return { success: false, data: [], requiresAuth: true };
      }
      return { success: false, data: [] };
    }
  },
  checkAvailability: async (equipmentId: string, startDate: string, endDate: string) => {
    const response = await api.post('/bookings/check-availability', {
      equipment_id: equipmentId,
      start_date: startDate,
      end_date: endDate,
    });
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
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (email: string, password: string, full_name: string) => {
    const response = await api.post('/auth/signup', { email, password, full_name });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
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
};

export default api;
