const Review = require("../models/Review");
const Booking = require("../models/Booking");

class ReviewController {
  // ============ CLIENT APIS ============

  // Tạo đánh giá mới
  static async createReview(req, res) {
    try {
      const { booking_id, pitch_id, rating, comment } = req.body;
      const user_id = req.user.id;

      // Validate
      if (!booking_id || !pitch_id || !rating) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ thông tin",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Đánh giá phải từ 1-5 sao",
        });
      }

      // Kiểm tra booking có tồn tại và thuộc về user
      const booking = await Booking.getById(booking_id);
      if (!booking || booking.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền đánh giá booking này",
        });
      }

      // Kiểm tra booking đã hoàn thành chưa
      if (booking.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể đánh giá sau khi hoàn thành đặt sân",
        });
      }

      // Kiểm tra đã đánh giá chưa
      const hasReviewed = await Review.checkUserReviewed(booking_id, user_id);
      if (hasReviewed) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đánh giá booking này rồi",
        });
      }

      // Tạo review
      const reviewId = await Review.create({
        booking_id,
        user_id,
        pitch_id,
        rating,
        comment: comment || "",
      });

      res.status(201).json({
        success: true,
        message: "Đánh giá thành công",
        data: { id: reviewId },
      });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đánh giá",
      });
    }
  }

  // Lấy đánh giá theo sân
  static async getReviewsByPitch(req, res) {
    try {
      const { pitch_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Review.getByPitchId(pitch_id, page, limit);
      const stats = await Review.getAverageRating(pitch_id);

      res.json({
        success: true,
        data: {
          ...result,
          stats,
        },
      });
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy đánh giá",
      });
    }
  }

  // Lấy đánh giá của user hiện tại
  static async getMyReviews(req, res) {
    try {
      const user_id = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Review.getByUserId(user_id, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting user reviews:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy đánh giá",
      });
    }
  }

  // Cập nhật đánh giá
  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const user_id = req.user.id;

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: "Đánh giá phải từ 1-5 sao",
        });
      }

      const updated = await Review.update(id, user_id, { rating, comment });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa",
        });
      }

      res.json({
        success: true,
        message: "Cập nhật đánh giá thành công",
      });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật đánh giá",
      });
    }
  }

  // Xóa đánh giá (Client)
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const deleted = await Review.delete(id, user_id, false);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá hoặc bạn không có quyền xóa",
        });
      }

      res.json({
        success: true,
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa đánh giá",
      });
    }
  }

  // ============ ADMIN APIS ============

  // Lấy tất cả đánh giá (Admin)
  static async getAllReviews(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await Review.getAll(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting all reviews:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách đánh giá",
      });
    }
  }

  // Xóa đánh giá (Admin)
  static async deleteReviewAdmin(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Review.delete(id, null, true);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá",
        });
      }

      res.json({
        success: true,
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      console.error("Error deleting review (admin):", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa đánh giá",
      });
    }
  }

  // Lấy thống kê đánh giá (Admin)
  static async getReviewStats(req, res) {
    try {
      const { pitch_id } = req.params;
      const stats = await Review.getAverageRating(pitch_id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting review stats:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thống kê",
      });
    }
  }
}

module.exports = ReviewController;
