const db = require("../config/database");

class Review {
  // Tạo đánh giá mới
  static async create(reviewData) {
    const { booking_id, user_id, pitch_id, rating, comment } = reviewData;

    const query = `
      INSERT INTO reviews (booking_id, user_id, pitch_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      booking_id,
      user_id,
      pitch_id,
      rating,
      comment,
    ]);
    return result.insertId;
  }

  // Lấy đánh giá theo sân (với phân trang)
  static async getByPitchId(pitch_id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.*, u.full_name as user_name, u.email, u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.pitch_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.execute(query, [pitch_id, limit, offset]);

    // Đếm tổng số reviews
    const [countResult] = await db.execute(
      "SELECT COUNT(*) as total FROM reviews WHERE pitch_id = ?",
      [pitch_id]
    );

    return {
      reviews: rows,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Lấy tất cả đánh giá (Admin)
  static async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.*, 
             u.full_name as user_name, 
             u.email,
             p.name as pitch_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN pitches p ON r.pitch_id = p.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.execute(query, [limit, offset]);

    const [countResult] = await db.execute(
      "SELECT COUNT(*) as total FROM reviews"
    );

    return {
      reviews: rows,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Lấy điểm trung bình của sân
  static async getAverageRating(pitch_id) {
    const query = `
      SELECT 
        ROUND(AVG(rating), 1) as average_rating, 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE pitch_id = ?
    `;
    const [rows] = await db.execute(query, [pitch_id]);
    return rows[0];
  }

  // Kiểm tra user đã đánh giá booking chưa
  static async checkUserReviewed(booking_id, user_id) {
    const query = "SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?";
    const [rows] = await db.execute(query, [booking_id, user_id]);
    return rows.length > 0;
  }

  // Lấy đánh giá của user
  static async getByUserId(user_id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.*, p.name as pitch_name, p.image
      FROM reviews r
      JOIN pitches p ON r.pitch_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.execute(query, [user_id, limit, offset]);

    const [countResult] = await db.execute(
      "SELECT COUNT(*) as total FROM reviews WHERE user_id = ?",
      [user_id]
    );

    return {
      reviews: rows,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Cập nhật đánh giá
  static async update(id, user_id, reviewData) {
    const { rating, comment } = reviewData;

    const query = `
      UPDATE reviews 
      SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await db.execute(query, [rating, comment, id, user_id]);
    return result.affectedRows > 0;
  }

  // Xóa đánh giá (Admin hoặc chủ review)
  static async delete(id, user_id = null, isAdmin = false) {
    let query = "DELETE FROM reviews WHERE id = ?";
    let params = [id];

    if (!isAdmin && user_id) {
      query += " AND user_id = ?";
      params.push(user_id);
    }

    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }

  // Lấy review theo ID
  static async getById(id) {
    const query = `
      SELECT r.*, u.full_name as user_name, p.name as pitch_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN pitches p ON r.pitch_id = p.id
      WHERE r.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
}

module.exports = Review;
