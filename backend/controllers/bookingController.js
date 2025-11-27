const Booking = require('../models/Booking');
const Timeslot = require('../models/Timeslot');
const db = require('../config/database');

// Tạo đơn đặt sân
exports.createBooking = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { pitch_id, timeslot_id, booking_date, total_price } = req.body;
    const user_id = req.user.id;

    // Kiểm tra timeslot còn khả dụng không
    const [timeslots] = await connection.execute(
      'SELECT * FROM timeslots WHERE id = ? AND is_available = true FOR UPDATE',
      [timeslot_id]
    );

    if (timeslots.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Khung giờ này đã được đặt' });
    }

    // Tạo booking
    const bookingData = { user_id, pitch_id, timeslot_id, booking_date, total_price };
    const [result] = await connection.execute(
      `INSERT INTO bookings (user_id, pitch_id, timeslot_id, booking_code, booking_date, total_price, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, pitch_id, timeslot_id, 'BK' + Date.now(), booking_date, total_price]
    );

    // Đánh dấu timeslot đã đặt
    await connection.execute(
      'UPDATE timeslots SET is_available = false WHERE id = ?',
      [timeslot_id]
    );

    await connection.commit();

    res.status(201).json({ 
      message: 'Đặt sân thành công', 
      bookingId: result.insertId 
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  } finally {
    connection.release();
  }
};

// Lấy đơn đặt của user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.getByUserId(req.user.id);
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tất cả đơn đặt (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái đơn đặt (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Booking.updateStatus(req.params.id, status);
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Hủy đơn đặt
exports.cancelBooking = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Lấy thông tin booking
    const [bookings] = await connection.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt' });
    }

    // Hủy booking
    await connection.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    // Trả lại timeslot
    await connection.execute(
      'UPDATE timeslots SET is_available = true WHERE id = ?',
      [bookings[0].timeslot_id]
    );

    await connection.commit();

    res.json({ message: 'Hủy đơn đặt thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  } finally {
    connection.release();
  }
};