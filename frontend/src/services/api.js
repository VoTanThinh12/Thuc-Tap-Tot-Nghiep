import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
};

// Pitch API
export const pitchAPI = {
  getAll: () => api.get("/pitches"),
  getById: (id) => api.get(`/pitches/${id}`),
  search: (params) => api.get("/pitches/search", { params }),
  create: (data) => api.post("/pitches", data),
  update: (id, data) => api.put(`/pitches/${id}`, data),
  delete: (id) => api.delete(`/pitches/${id}`),
};

// Booking API
export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getMyBookings: () => api.get("/bookings/my-bookings"),
  getAllBookings: () => api.get("/bookings/all"),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
  getRevenueChart: (params) =>
    api.get("/admin/dashboard/revenue-chart", { params }),

  // Fields
  getFields: (params) => api.get("/admin/fields", { params }),
  createField: (data) => api.post("/admin/fields", data),
  updateField: (id, data) => api.put(`/admin/fields/${id}`, data),
  deleteField: (id) => api.delete(`/admin/fields/${id}`),

  // Bookings
  getBookings: (params) => api.get("/admin/bookings", { params }),
  getBookingStats: () => api.get("/admin/bookings/stats"),

  // Customers
  getCustomers: (params) => api.get("/admin/customers", { params }),
  getCustomerStats: () => api.get("/admin/customers/stats"),

  // Services
  getServices: (params) => api.get("/admin/services", { params }),

  // Reports
  getRevenueByField: () => api.get("/admin/reports/revenue-by-field"),
  getMonthlyStats: () => api.get("/admin/reports/monthly-stats"),
  getTopCustomers: () => api.get("/admin/reports/top-customers"),
};

export default api;
