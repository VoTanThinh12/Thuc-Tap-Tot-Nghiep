const db = require("../config/database");

class Review {
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
      comment || "",
    ]);
    return result.insertId;
  }

  static async getByPitchId(pitch_id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT r.*, 
             u.fullname as user_name, 
             u.email, 
             u.avatar,
             DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i') as formatted_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.pitch_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.execute(query, [pitch_id, limit, offset]);

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

  static async getAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    if (filters.pitch_id) {
      whereConditions.push("r.pitch_id = ?");
      queryParams.push(filters.pitch_id);
    }
    if (filters.rating) {
      whereConditions.push("r.rating = ?");
      queryParams.push(filters.rating);
    }
    if (filters.search) {
      whereConditions.push(
        "(u.fullname LIKE ? OR p.name LIKE ? OR r.comment LIKE ?)"
      );
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    const query = `
      SELECT r.*, 
             u.fullname as user_name, 
             u.email,
             u.phone,
             p.name as pitch_name,
             p.type as pitch_type,
             DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i') as formatted_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN pitches p ON r.pitch_id = p.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const [rows] = await db.execute(query, queryParams);

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN pitches p ON r.pitch_id = p.id
      ${whereClause}
    `;
    const [countResult] = await db.execute(
      countQuery,
      queryParams.slice(0, -2)
    );

    return {
      reviews: rows,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  static async getAverageRating(pitch_id) {
    const query = `
    SELECT 
      COALESCE(ROUND(AVG(rating), 1), 0) as average_rating, 
      COALESCE(COUNT(*), 0) as total_reviews,
      COALESCE(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END), 0) as five_star,
      COALESCE(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END), 0) as four_star,
      COALESCE(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END), 0) as three_star,
      COALESCE(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END), 0) as two_star,
      COALESCE(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END), 0) as one_star
    FROM reviews
    WHERE pitch_id = ?
  `;
    const [rows] = await db.execute(query, [pitch_id]);

    // Đảm bảo luôn trả về dữ liệu hợp lệ
    return {
      average_rating: rows[0]?.average_rating || 0,
      total_reviews: rows[0]?.total_reviews || 0,
      five_star: rows[0]?.five_star || 0,
      four_star: rows[0]?.four_star || 0,
      three_star: rows[0]?.three_star || 0,
      two_star: rows[0]?.two_star || 0,
      one_star: rows[0]?.one_star || 0,
    };
  }

  static async checkUserReviewed(booking_id, user_id) {
    const query = "SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?";
    const [rows] = await db.execute(query, [booking_id, user_id]);
    return rows.length > 0;
  }

  static async getByUserId(user_id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT r.*, 
             p.name as pitch_name, 
             p.type as pitch_type,
             p.location,
             DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i') as formatted_date
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

  static async update(id, user_id, reviewData) {
    const fields = [];
    const values = [];

    if (reviewData.rating !== undefined) {
      fields.push("rating = ?");
      values.push(reviewData.rating);
    }
    if (reviewData.comment !== undefined) {
      fields.push("comment = ?");
      values.push(reviewData.comment);
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");

    const query = `
      UPDATE reviews 
      SET ${fields.join(", ")}
      WHERE id = ? AND user_id = ?
    `;

    values.push(id, user_id);
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

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

  static async getById(id) {
    const query = `
      SELECT r.*, 
             u.fullname as user_name,
             u.email,
             u.phone,
             p.name as pitch_name,
             p.type as pitch_type,
             p.location,
             DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i') as formatted_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN pitches p ON r.pitch_id = p.id
      WHERE r.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Thống kê tổng quan
  static async getOverallStats() {
    const query = `
      SELECT 
        COUNT(DISTINCT pitch_id) as reviewed_pitches,
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 1) as overall_rating,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) / COUNT(*) * 100 as positive_percentage
      FROM reviews
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }
}

module.exports = Review;
