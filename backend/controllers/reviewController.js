const Review = require('../models/Review');

// Tạo đánh giá
exports.createReview = async (req, res) => {
  try {
    const { booking_id, pitch_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Kiểm tra user đã đánh giá chưa
    const hasReviewed = await Review.checkUserReviewed(booking_id, user_id);
    if (hasReviewed) {
      return res.status(400).json({ message: 'Bạn đã đánh giá đơn đặt này rồi' });
    }

    const reviewId = await Review.create({ booking_id, user_id, pitch_id, rating, comment });
    res.status(201).json({ message: 'Đánh giá thành công', reviewId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đánh giá theo sân
exports.getReviewsByPitch = async (req, res) => {
  try {
    const reviews = await Review.getByPitchId(req.params.pitch_id);
    const stats = await Review.getAverageRating(req.params.pitch_id);
    res.json({ reviews, stats });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};