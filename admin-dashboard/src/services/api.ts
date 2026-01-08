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

  // Image management
  uploadImages: (id: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    return api.post(`/equipment/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (id: string, imageUrl: string) =>
    api.delete(`/equipment/${id}/images`, { data: { imageUrl } }),
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

  getDetails: (id: string) => api.get(`/bookings/${id}/details`),

  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),

  // Admin cancel with reason
  adminCancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/admin-cancel`, { reason }),

  // Reactivate cancelled booking
  reactivate: (id: string, newStatus?: string) =>
    api.post(`/bookings/${id}/reactivate`, { new_status: newStatus }),

  // Extend booking dates
  extend: (id: string, newEndDate: string, reason?: string) =>
    api.patch(`/bookings/${id}/extend`, { new_end_date: newEndDate, reason }),

  // Update admin notes
  updateNotes: (id: string, adminNotes: string) =>
    api.patch(`/bookings/${id}/notes`, { admin_notes: adminNotes }),

  // Update payment status
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    api.patch(`/bookings/${id}/payment-status`, { payment_status: paymentStatus }),

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

// Promo Codes and Credits API
export const promoAPI = {
  // Get all promo codes (admin)
  getAllCodes: () => api.get('/promo/admin/codes'),

  // Create new promo code
  createCode: (data: {
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed_amount' | 'credit';
    discount_value: number;
    min_order_amount?: number;
    max_discount?: number;
    max_uses?: number;
    max_uses_per_user?: number;
    expires_at?: string;
  }) => api.post('/promo/admin/create', data),

  // Generate unique code
  generateCode: (data: {
    prefix?: string;
    discount_type: 'percentage' | 'fixed_amount' | 'credit';
    discount_value: number;
    description?: string;
    min_order_amount?: number;
    max_discount?: number;
    max_uses?: number;
    max_uses_per_user?: number;
    expires_at?: string;
  }) => api.post('/promo/admin/generate', data),

  // Deactivate a promo code
  deactivateCode: (codeId: string) =>
    api.patch(`/promo/admin/codes/${codeId}/deactivate`),

  // Add credits to a user
  addUserCredits: (userId: string, amount: number, description?: string) =>
    api.post('/promo/admin/add-credit', { user_id: userId, amount, description }),

  // Get user's credit info
  getUserCredits: (userId: string) => api.get(`/promo/admin/user/${userId}/credits`),
};

// Dashboard Stats API
export const dashboardAPI = {
  getStats: async () => {
    // Get overview stats from multiple endpoints with error handling
    const results = await Promise.allSettled([
      api.get('/equipment'),
      api.get('/bookings'),
      api.get('/categories'),
    ]);

    const equipmentRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const bookingsRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const categoriesRes = results[2].status === 'fulfilled' ? results[2].value : null;

    // Get equipment count - use meta.total if available, otherwise count the array
    const equipmentData = equipmentRes?.data?.data || [];
    const totalEquipment = equipmentRes?.data?.meta?.total ?? equipmentData.length;

    // Get bookings count
    const bookingsData = bookingsRes?.data?.data || [];
    const totalBookings = bookingsRes?.data?.meta?.total ?? bookingsData.length;

    // Get categories count
    const categoriesData = categoriesRes?.data?.data || [];
    const totalCategories = categoriesData.length;

    return {
      totalEquipment,
      totalBookings,
      totalCategories,
      equipment: equipmentData,
      bookings: bookingsData,
    };
  },
};

export default api;
