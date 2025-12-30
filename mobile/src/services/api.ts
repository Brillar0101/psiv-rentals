// src/services/api.ts
// API Service - Communicates with PSIV Rentals backend

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development (your computer)
  : 'https://api.psivrentals.com/api'; // Production

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      // Navigation will be handled by app
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

// Equipment API
export const equipmentAPI = {
  getAll: async (params?: {
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    condition?: string;
    available_only?: boolean;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => {
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
};

// Category API
export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  checkAvailability: async (data: {
    equipment_id: string;
    start_date: string;
    end_date: string;
  }) => {
    const response = await api.post('/bookings/check-availability', data);
    return response.data;
  },

  create: async (data: {
    equipment_id: string;
    start_date: string;
    end_date: string;
    notes?: string;
  }) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get('/bookings/user/me', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  getCalendar: async (equipmentId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/bookings/equipment/${equipmentId}/calendar`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (bookingId: string) => {
    const response = await api.post('/payments/create-intent', { booking_id: bookingId });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string) => {
    const response = await api.post('/payments/confirm', { payment_intent_id: paymentIntentId });
    return response.data;
  },

  getPaymentStatus: async (bookingId: string) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },
};

export default api;
