import api from "./api";

const pitchImageService = {
  getByPitch: (pitchId) => api.get(`/pitch-images/pitch/${pitchId}`),

  adminGetAll: (params) => api.get("/admin/pitch-images", { params }),

  adminUpload: (pitchId, file) => {
    const formData = new FormData();
    formData.append("pitch_id", pitchId);
    formData.append("image", file);

    return api.post("/admin/pitch-images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  adminCreateByUrl: (pitchId, imageUrl, isPrimary = false) =>
    api.post("/admin/pitch-images/link", {
      pitch_id: pitchId,
      image_url: imageUrl,
      is_primary: isPrimary ? 1 : 0,
    }),

  adminSetPrimary: (imageId) =>
    api.put(`/admin/pitch-images/${imageId}/primary`),

  adminUpdate: (imageId, data) =>
    api.put(`/admin/pitch-images/${imageId}`, data),

  adminDelete: (imageId) => api.delete(`/admin/pitch-images/${imageId}`),
};

export default pitchImageService;
