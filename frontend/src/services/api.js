/**
 * API Service (v3) - Axios Configuration
 * Centralized API calls for the Bill Scanner
 * Supports batch upload, export, stats
 */

import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || '';
if (apiURL && !apiURL.startsWith('http://') && !apiURL.startsWith('https://')) {
  apiURL = `https://${apiURL}`;
}

const API_BASE = apiURL ? `${apiURL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min timeout for large batch processing
});

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

export default api;
