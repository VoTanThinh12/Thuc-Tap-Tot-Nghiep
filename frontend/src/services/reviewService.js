import api from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {
  // Client APIs
  createReview: async (reviewData) => {
    return api.post("/reviews", reviewData, { headers: getAuthHeader() });
  },

  getReviewsByPitch: async (pitchId, page = 1, limit = 10) => {
    return api.get(`/reviews/pitch/${pitchId}?page=${page}&limit=${limit}`);
  },

  getMyReviews: async (page = 1, limit = 10) => {
    return api.get(`/reviews/my-reviews?page=${page}&limit=${limit}`, { headers: getAuthHeader() });
  },

  updateReview: async (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData, { headers: getAuthHeader() });
  },

  deleteReview: async (reviewId) => {
    return api.delete(`/reviews/${reviewId}`, { headers: getAuthHeader() });
  },

  // Admin APIs
  getAllReviews: async (page = 1, limit = 20) => {
    return api.get(`/reviews/admin/all?page=${page}&limit=${limit}`, { headers: getAuthHeader() });
  },

  deleteReviewAdmin: async (reviewId) => {
    return api.delete(`/reviews/admin/${reviewId}`, { headers: getAuthHeader() });
  },

  getReviewStats: async (pitchId) => {
    return api.get(`/reviews/admin/stats/${pitchId}`, { headers: getAuthHeader() });
  },
};

export default reviewService;
