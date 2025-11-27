import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm token vào header
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Pitch API
export const pitchAPI = {
  getAll: () => api.get('/pitches'),
  getById: (id) => api.get(`/pitches/${id}`),
  search: (params) => api.get('/pitches/search', { params }),
  create: (data) => api.post('/pitches', data),
  update: (id, data) => api.put(`/pitches/${id}`, data),
  delete: (id) => api.delete(`/pitches/${id}`),
};

// Booking API
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getAllBookings: () => api.get('/bookings/all'),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export default api;