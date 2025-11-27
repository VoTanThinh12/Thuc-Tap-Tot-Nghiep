const db = require('../config/database');

class Booking {
  // Tạo đơn đặt sân mới
  static async create(bookingData) {
    const { user_id, pitch_id, timeslot_id, booking_date, total_price } = bookingData;
    
    // Tạo mã booking ngẫu nhiên
    const booking_code = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
    
    const query = `
      INSERT INTO bookings (user_id, pitch_id, timeslot_id, booking_code, booking_date, total_price, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const [result] = await db.execute(query, [
      user_id, 
      pitch_id, 
      timeslot_id, 
      booking_code, 
      booking_date, 
      total_price
    ]);
    
    return { id: result.insertId, booking_code };
  }

  // Lấy đơn đặt theo ID
  static async findById(id) {
    const query = `
      SELECT b.*, u.name as customer_name, u.phone, p.name as pitch_name, 
             t.date, t.start_time, t.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN pitches p ON b.pitch_id = p.id
      JOIN timeslots t ON b.timeslot_id = t.id
      WHERE b.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Lấy đơn đặt theo mã booking
  static async findByCode(booking_code) {
    const query = `
      SELECT b.*, u.name as customer_name, p.name as pitch_name, 
             t.date, t.start_time, t.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN pitches p ON b.pitch_id = p.id
      JOIN timeslots t ON b.timeslot_id = t.id
      WHERE b.booking_code = ?
    `;
    
    const [rows] = await db.execute(query, [booking_code]);
    return rows[0];
  }

  // Lấy tất cả đơn đặt của user
  static async getByUserId(user_id) {
    const query = `
      SELECT b.*, p.name as pitch_name, p.location, 
             t.date, t.start_time, t.end_time
      FROM bookings b
      JOIN pitches p ON b.pitch_id = p.id
      JOIN timeslots t ON b.timeslot_id = t.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [user_id]);
    return rows;
  }

  // Lấy tất cả đơn đặt (cho admin)
  static async getAll() {
    const query = `
      SELECT b.*, u.name as customer_name, u.phone, p.name as pitch_name, 
             t.date, t.start_time, t.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN pitches p ON b.pitch_id = p.id
      JOIN timeslots t ON b.timeslot_id = t.id
      ORDER BY b.created_at DESC
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Cập nhật trạng thái đơn đặt
  static async updateStatus(id, status) {
    const query = 'UPDATE bookings SET status = ? WHERE id = ?';
    await db.execute(query, [status, id]);
  }

  // Hủy đơn đặt
  static async cancel(id) {
    const query = 'UPDATE bookings SET status = "cancelled" WHERE id = ?';
    await db.execute(query, [id]);
  }
}

module.exports = Booking;