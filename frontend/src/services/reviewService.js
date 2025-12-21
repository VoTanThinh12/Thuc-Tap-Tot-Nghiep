import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {
  // Client APIs
  createReview: async (reviewData) => {
    const response = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getReviewsByPitch: async (pitchId, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_URL}/reviews/pitch/${pitchId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getMyReviews: async (page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_URL}/reviews/my-reviews?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  updateReview: async (reviewId, reviewData) => {
    const response = await axios.put(
      `${API_URL}/reviews/${reviewId}`,
      reviewData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Admin APIs
  getAllReviews: async (page = 1, limit = 20) => {
    const response = await axios.get(
      `${API_URL}/reviews/admin/all?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteReviewAdmin: async (reviewId) => {
    const response = await axios.delete(
      `${API_URL}/reviews/admin/${reviewId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getReviewStats: async (pitchId) => {
    const response = await axios.get(
      `${API_URL}/reviews/admin/stats/${pitchId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default reviewService;
