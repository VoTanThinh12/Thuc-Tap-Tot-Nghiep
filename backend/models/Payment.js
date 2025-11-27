const db = require('../config/database');

class Payment {
  // Tạo thanh toán mới
  static async create(paymentData) {
    const { booking_id, payment_method, amount, transaction_id, notes } = paymentData;
    
    const query = `
      INSERT INTO payments (booking_id, payment_method, amount, transaction_id, status, notes)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `;
    
    const [result] = await db.execute(query, [booking_id, payment_method, amount, transaction_id, notes]);
    return result.insertId;
  }

  // Cập nhật trạng thái thanh toán
  static async updateStatus(id, status) {
    const query = 'UPDATE payments SET status = ? WHERE id = ?';
    await db.execute(query, [status, id]);
  }

  // Lấy thanh toán theo booking
  static async getByBookingId(booking_id) {
    const query = 'SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC';
    const [rows] = await db.execute(query, [booking_id]);
    return rows;
  }

  // Lấy tất cả thanh toán
  static async getAll() {
    const query = `
      SELECT p.*, b.booking_code, u.full_name as customer_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      ORDER BY p.payment_date DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
}

module.exports = Payment;