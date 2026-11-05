import axios from 'axios';

// Use VITE_API_URL in production (Render URL), fall back to Vite proxy in dev
// Strip any trailing slashes to avoid double slashes like `https://...//api`
const rawApiUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '';
const BASE_URL = rawApiUrl ? `${rawApiUrl}/api` : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Response Interceptor ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or backend not reachable
      return Promise.reject({
        message:
          'Unable to connect to the server. Please check your connection or try again later.',
        status: 0,
      });
    }

    const { data, status } = error.response;
    return Promise.reject({
      message: data?.message || 'An unexpected error occurred.',
      status,
    });
  }
);

// ─── API Functions ─────────────────────────────────────────────────

// Health check
export const checkHealth = () => api.get('/health');

// Get dashboard stats
export const getStats = () => api.get('/students/stats');

// Get all students (with optional search/filter params)
export const getAllStudents = (params = {}) =>
  api.get('/students', { params });

// Get a single student by MongoDB _id
export const getStudentById = (id) => api.get(`/students/${id}`);

// Create a new student
export const createStudent = (data) => api.post('/students', data);

// Update a student by MongoDB _id
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);

// Delete a student by MongoDB _id
export const deleteStudent = (id) => api.delete(`/students/${id}`);

export default api;
