// src/services/api.ts
// API Service - Handles all backend API calls

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () => api.get('/auth/me'),
};

// Equipment API
export const equipmentAPI = {
  getAll: (params?: any) => api.get('/equipment', { params }),
  
  getById: (id: string) => api.get(`/equipment/${id}`),
  
  create: (data: any) => api.post('/equipment', data),
  
  update: (id: string, data: any) => api.put(`/equipment/${id}`, data),
  
  updateAvailability: (id: string, data: any) =>
    api.patch(`/equipment/${id}/availability`, data),
  
  delete: (id: string) => api.delete(`/equipment/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: (withCount?: boolean) =>
    api.get('/categories', { params: { with_count: withCount } }),
  
  getById: (id: string) => api.get(`/categories/${id}`),
  
  create: (data: any) => api.post('/categories', data),
  
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Booking API
export const bookingAPI = {
  getAll: (params?: any) => api.get('/bookings', { params }),
  
  getById: (id: string) => api.get(`/bookings/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),
  
  getCalendar: (equipmentId: string, startDate: string, endDate: string) =>
    api.get(`/bookings/equipment/${equipmentId}/calendar`, {
      params: { start_date: startDate, end_date: endDate },
    }),
};

// Payment API
export const paymentAPI = {
  getPaymentStatus: (bookingId: string) =>
    api.get(`/payments/booking/${bookingId}`),
  
  refund: (bookingId: string, amount?: number, reason?: string) =>
    api.post('/payments/refund', { booking_id: bookingId, amount, reason }),
};

// Dashboard Stats API
export const dashboardAPI = {
  getStats: async () => {
    // Get overview stats from multiple endpoints
    const [equipmentRes, bookingsRes, categoriesRes] = await Promise.all([
      api.get('/equipment'),
      api.get('/bookings'),
      api.get('/categories'),
    ]);

    return {
      totalEquipment: equipmentRes.data.meta?.total || 0,
      totalBookings: bookingsRes.data.meta?.total || 0,
      totalCategories: categoriesRes.data.data?.length || 0,
      equipment: equipmentRes.data.data,
      bookings: bookingsRes.data.data,
    };
  },
};

export default api;
