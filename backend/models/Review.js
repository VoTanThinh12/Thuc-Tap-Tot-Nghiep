const db = require('../config/database');

class Review {
  // Tạo đánh giá mới
  static async create(reviewData) {
    const { booking_id, user_id, pitch_id, rating, comment } = reviewData;
    
    const query = `
      INSERT INTO reviews (booking_id, user_id, pitch_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [booking_id, user_id, pitch_id, rating, comment]);
    return result.insertId;
  }

  // Lấy đánh giá theo sân
  static async getByPitchId(pitch_id) {
    const query = `
      SELECT r.*, u.full_name as user_name, u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.pitch_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [pitch_id]);
    return rows;
  }

  // Lấy điểm trung bình của sân
  static async getAverageRating(pitch_id) {
    const query = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE pitch_id = ?
    `;
    const [rows] = await db.execute(query, [pitch_id]);
    return rows[0];
  }

  // Kiểm tra user đã đánh giá booking chưa
  static async checkUserReviewed(booking_id, user_id) {
    const query = 'SELECT * FROM reviews WHERE booking_id = ? AND user_id = ?';
    const [rows] = await db.execute(query, [booking_id, user_id]);
    return rows.length > 0;
  }
}

module.exports = Review;