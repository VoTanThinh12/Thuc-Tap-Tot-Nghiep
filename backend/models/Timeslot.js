const db = require('../config/database');

class Timeslot {
  // Tạo khung giờ mới
  static async create(timeslotData) {
    const { pitch_id, date, start_time, end_time, price } = timeslotData;
    
    const query = `
      INSERT INTO timeslots (pitch_id, date, start_time, end_time, price, is_available) 
      VALUES (?, ?, ?, ?, ?, true)
    `;
    
    const [result] = await db.execute(query, [pitch_id, date, start_time, end_time, price]);
    return result.insertId;
  }

  // Kiểm tra khung giờ có khả dụng không
  static async checkAvailability(pitch_id, date, start_time) {
    const query = `
      SELECT * FROM timeslots 
      WHERE pitch_id = ? AND date = ? AND start_time = ? AND is_available = true
    `;
    
    const [rows] = await db.execute(query, [pitch_id, date, start_time]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Lấy danh sách khung giờ theo sân và ngày
  static async getByPitchAndDate(pitch_id, date) {
    const query = `
      SELECT * FROM timeslots 
      WHERE pitch_id = ? AND date = ? 
      ORDER BY start_time
    `;
    
    const [rows] = await db.execute(query, [pitch_id, date]);
    return rows;
  }

  // Đánh dấu khung giờ đã đặt
  static async markAsBooked(id) {
    const query = 'UPDATE timeslots SET is_available = false WHERE id = ?';
    await db.execute(query, [id]);
  }

  // Hủy đặt - đánh dấu lại khả dụng
  static async markAsAvailable(id) {
    const query = 'UPDATE timeslots SET is_available = true WHERE id = ?';
    await db.execute(query, [id]);
  }
}

module.exports = Timeslot;