const db = require('../config/database');

class Booking {
  // Tạo đơn đặt sân mới
  static async create(bookingData) {
    const { 
      user_id, 
      pitch_id, 
      timeslot_id, 
      booking_date, 
      start_time,
      end_time,
      total_price,
      deposit_amount = 0,
      customer_name,
      customer_phone,
      customer_email,
      notes
    } = bookingData;
    
    // Tạo mã booking ngẫu nhiên
    const booking_code = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
    
    const query = `
      INSERT INTO bookings (
        booking_code, user_id, pitch_id, timeslot_id, booking_date, 
        start_time, end_time, total_price, deposit_amount,
        customer_name, customer_phone, customer_email, notes, status
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const [result] = await db.execute(query, [
      booking_code,
      user_id, 
      pitch_id, 
      timeslot_id, 
      booking_date,
      start_time,
      end_time,
      total_price,
      deposit_amount,
      customer_name,
      customer_phone,
      customer_email,
      notes
    ]);
    
    return { id: result.insertId, booking_code };
  }

  // Lấy đơn đặt theo ID
  static async findById(id) {
    const query = `
      SELECT b.*, 
             u.full_name as user_name, u.phone as user_phone, u.email as user_email,
             p.name as pitch_name, p.location, p.address,
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
      SELECT b.*, 
             u.full_name as user_name, u.phone as user_phone,
             p.name as pitch_name, p.location,
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
  static async cancel(id, cancellation_reason = null) {
    const query = 'UPDATE bookings SET status = "cancelled", cancellation_reason = ? WHERE id = ?';
    await db.execute(query, [cancellation_reason, id]);
  }

  // Thêm dịch vụ vào booking
  static async addService(booking_id, service_id, quantity, price) {
    const total = quantity * price;
    const query = `
      INSERT INTO booking_services (booking_id, service_id, quantity, price, total)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [booking_id, service_id, quantity, price, total]);
  }

  // Lấy dịch vụ của booking
  static async getServices(booking_id) {
    const query = `
      SELECT bs.*, s.name as service_name, s.unit
      FROM booking_services bs
      JOIN services s ON bs.service_id = s.id
      WHERE bs.booking_id = ?
    `;
    const [rows] = await db.execute(query, [booking_id]);
    return rows;
  }
}

module.exports = Booking;