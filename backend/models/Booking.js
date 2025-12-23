const db = require("../config/database");

function safeParseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

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
      notes,
    } = bookingData;

    // Tạo mã booking ngẫu nhiên
    const booking_code = "BK" + Date.now() + Math.floor(Math.random() * 1000);

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
      notes,
    ]);

    return { id: result.insertId, booking_code };
  }

  static async getById(id) {
    return Booking.findById(id);
  }

  // Lấy đơn đặt theo ID
  static async findById(id) {
    const query = `
      SELECT b.*, 
             u.full_name as user_name, u.phone as user_phone, u.email as user_email,
             p.name as pitch_name, p.location, p.address,
             b.booking_date as date, b.start_time, b.end_time
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      JOIN pitches p ON b.pitch_id = p.id
      WHERE b.id = ?
    `;

    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Lấy tất cả đơn đặt của user
  static async getByUserId(user_id, user_email = null) {
    const query = `
      SELECT b.*, p.name as pitch_name, p.location, 
             b.booking_date as date, b.start_time, b.end_time
      FROM bookings b
      JOIN pitches p ON b.pitch_id = p.id
      WHERE (
        b.user_id = ?
        OR (? IS NOT NULL AND b.customer_email = ?)
      )
      ORDER BY b.created_at DESC
    `;

    const [rows] = await db.execute(query, [user_id, user_email, user_email]);
    return rows;
  }

  // Lấy tất cả đơn đặt (cho admin)
  static async getAll() {
    const query = `
      SELECT b.*, 
             u.full_name as user_name, u.phone as user_phone,
             p.name as pitch_name, p.location,
             b.booking_date as date, b.start_time, b.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN pitches p ON b.pitch_id = p.id
      ORDER BY b.created_at DESC
    `;

    const [rows] = await db.execute(query);
    return rows;
  }

  // Cập nhật trạng thái đơn đặt
  static async updateStatus(id, status) {
    const query = "UPDATE bookings SET status = ? WHERE id = ?";
    await db.execute(query, [status, id]);
  }

  // Hủy đơn đặt
  static async cancel(id, cancellation_reason = null) {
    const query =
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ? WHERE id = ?';
    await db.execute(query, [cancellation_reason, id]);
  }

  // Lấy dịch vụ của booking từ bookings.services_json
  static async getServices(booking_id) {
    const [rows] = await db.execute(
      "SELECT services_json FROM bookings WHERE id = ? LIMIT 1",
      [booking_id]
    );
    const row = rows[0] || null;
    return safeParseJsonArray(row?.services_json);
  }
}

module.exports = Booking;
