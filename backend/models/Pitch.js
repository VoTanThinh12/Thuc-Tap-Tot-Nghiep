const db = require('../config/database');

class Pitch {
  // Tạo sân mới
  static async create(pitchData) {
    const { name, type, location, price_per_hour, description, images, facilities } = pitchData;
    
    const query = `
      INSERT INTO pitches (name, type, location, price_per_hour, description, images, facilities) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      name, 
      type, 
      location, 
      price_per_hour, 
      description,
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
      images: JSON.parse(pitch.images),
      facilities: JSON.parse(pitch.facilities)
    }));
  }

  // Lấy sân theo ID
  static async findById(id) {
    const query = 'SELECT * FROM pitches WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    
    if (rows[0]) {
      return {
        ...rows[0],
        images: JSON.parse(rows[0].images),
        facilities: JSON.parse(rows[0].facilities)
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
      images: JSON.parse(pitch.images),
      facilities: JSON.parse(pitch.facilities)
    }));
  }

  // Cập nhật sân
  static async update(id, pitchData) {
    const { name, type, location, price_per_hour, description, status } = pitchData;
    
    const query = `
      UPDATE pitches 
      SET name = ?, type = ?, location = ?, price_per_hour = ?, description = ?, status = ?
      WHERE id = ?
    `;
    
    await db.execute(query, [name, type, location, price_per_hour, description, status, id]);
  }

  // Xóa sân (soft delete)
  static async delete(id) {
    const query = 'UPDATE pitches SET status = "inactive" WHERE id = ?';
    await db.execute(query, [id]);
  }
}

module.exports = Pitch;