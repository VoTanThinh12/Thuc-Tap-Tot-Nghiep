const db = require('../config/database');

class Pitch {
  // Tạo sân mới
  static async create(pitchData) {
    const { name, type, location, address, description, capacity, price_per_hour, images, facilities } = pitchData;
    
    const query = `
      INSERT INTO pitches (name, type, location, address, description, capacity, price_per_hour, images, facilities) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      name, 
      type, 
      location,
      address,
      description,
      capacity,
      price_per_hour,
      JSON.stringify(images || []),
      JSON.stringify(facilities || [])
    ]);
    
    return result.insertId;
  }

  // Lấy tất cả sân
  static async getAll() {
    const query = 'SELECT * FROM pitches WHERE status = "active"';
    const [rows] = await db.execute(query);
    
    // Parse JSON fields
    return rows.map(pitch => ({
      ...pitch,
      images: JSON.parse(pitch.images || '[]'),
      facilities: JSON.parse(pitch.facilities || '[]')
    }));
  }

  // Lấy sân theo ID
  static async findById(id) {
    const query = 'SELECT * FROM pitches WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    
    if (rows[0]) {
      return {
        ...rows[0],
        images: JSON.parse(rows[0].images || '[]'),
        facilities: JSON.parse(rows[0].facilities || '[]')
      };
    }
    return null;
  }

  // Tìm kiếm sân theo tiêu chí
  static async search(filters) {
    let query = 'SELECT * FROM pitches WHERE status = "active"';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.location) {
      query += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.maxPrice) {
      query += ' AND price_per_hour <= ?';
      params.push(filters.maxPrice);
    }

    const [rows] = await db.execute(query, params);
    
    return rows.map(pitch => ({
      ...pitch,
      images: JSON.parse(pitch.images || '[]'),
      facilities: JSON.parse(pitch.facilities || '[]')
    }));
  }

  // Cập nhật sân
  static async update(id, pitchData) {
    const { name, type, location, address, description, capacity, price_per_hour, status } = pitchData;
    
    const query = `
      UPDATE pitches 
      SET name = ?, type = ?, location = ?, address = ?, description = ?, capacity = ?, price_per_hour = ?, status = ?
      WHERE id = ?
    `;
    
    await db.execute(query, [name, type, location, address, description, capacity, price_per_hour, status, id]);
  }

  // Xóa sân (soft delete)
  static async delete(id) {
    const query = 'UPDATE pitches SET status = "inactive" WHERE id = ?';
    await db.execute(query, [id]);
  }

  // Lấy đánh giá của sân
  static async getReviews(pitch_id) {
    const query = `
      SELECT r.*, u.full_name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.pitch_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [pitch_id]);
    return rows;
  }
}

module.exports = Pitch;