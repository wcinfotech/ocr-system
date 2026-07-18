/**
 * API Service (v3) - Axios Configuration
 * Centralized API calls for the Bill Scanner
 * Supports batch upload, export, stats
 */

import axios from 'axios';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

let apiURL = import.meta.env.VITE_API_URL || '';
if (apiURL && !apiURL.startsWith('http://') && !apiURL.startsWith('https://')) {
  apiURL = `https://${apiURL}`;
}

const API_BASE = apiURL ? `${apiURL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min timeout for large batch processing
});

// Interceptor to automatically attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single file upload (backward compatible)
export const uploadBill = (file, onProgress) => {
  const formData = new FormData();
  formData.append('billFile', file);
  return api.post('/upload-bill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
};

// Batch multi-file upload
export const uploadBills = (files, onProgress) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('billFiles', file);
  }
  return api.post('/upload-bills', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
};

// Get all bills with optional filters
export const getBills = (params = {}) => api.get('/bills', { params });

// Get single bill by ID
export const getBillById = (id) => api.get(`/bill/${id}`);

// Delete a bill by ID
export const deleteBill = (id) => api.delete(`/bill/${id}`);

// Get batch status
export const getBatchStatus = (batchId) => api.get(`/batch/${batchId}`);

// Export bills as CSV
export const exportBills = (params = {}) => api.get('/export', { params, responseType: 'blob' });

// Get dashboard stats
export const getStats = () => api.get('/stats');

// Update bill details (v4)
export const updateBill = (id, data) => api.put(`/bill/${id}`, data);

// Reprocess bill details (v4)
export const reprocessBill = (id) => api.post(`/bill/${id}/reprocess`);

// Auth endpoints
export const register = (data) => api.post('/v1/auth/register', data);
export const login = (data) => api.post('/v1/auth/login', data);
export const getMe = () => api.get('/v1/auth/me');
export const updateProfile = (data) => api.put('/v1/auth/me', data);
export const forgotPassword = (data) => api.post('/v1/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/v1/auth/reset-password', data);
export const verifyOtp = (data) => api.post('/v1/auth/verify-otp', data);

// Support ticket endpoints
export const createTicket = (data) => api.post('/v1/tickets', data);
export const getTickets = () => api.get('/v1/tickets');
export const getTicketById = (id) => api.get(`/v1/tickets/${id}`);
export const replyTicket = (id, message) => api.post(`/v1/tickets/${id}/reply`, { message });

// Subscription endpoints
export const getSubscriptionPlans = () => api.get('/v1/subscription/plans');
export const buySubscription = (data) => api.post('/v1/subscription/buy', data);
export const getInvoices = () => api.get('/v1/subscription/invoices');
export const downloadInvoice = (invoiceId) => api.get(`/v1/subscription/invoices/${invoiceId}/download`, { responseType: 'blob' });

// Public System Settings
export const getPublicSettings = () => api.get('/v1/auth/public-settings');
export const getBlogs = () => api.get('/v1/blogs');
export const getTestimonials = () => api.get('/v1/testimonials');
export const submitContactMessage = (data) => api.post('/v1/auth/contact', data);

// Analytics event logging helpers (Firebase connection)
export const logAnalyticsEvent = (name, params = {}) => {
  // 1. Log to Firebase JS SDK Client Analytics (GA4)
  if (analytics) {
    try {
      firebaseLogEvent(analytics, name, params);
    } catch (err) {
      console.error('Failed to log client event to Firebase JS SDK:', err);
    }
  }

  // 2. Log to backend proxy (Firestore)
  return api.post('/v1/analytics/log', { name, params })
    .catch(err => console.error('Failed to log client-side analytics event:', err));
};

export const getAnalyticsStats = () => api.get('/v1/analytics/stats');

export default api;
