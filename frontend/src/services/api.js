/**
 * API Service - Axios Configuration
 * Centralized API calls for the Bill Scanner
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for OCR processing
});

// Upload a bill file with progress tracking
export const uploadBill = (file, onProgress) => {
  const formData = new FormData();
  formData.append('billFile', file);

  return api.post('/upload-bill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
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

export default api;
