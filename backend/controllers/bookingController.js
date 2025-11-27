const Booking = require('../models/Booking');
const Timeslot = require('../models/Timeslot');
const User = require('../models/User');
const db = require('../config/database');

// Tạo đơn đặt sân
exports.createBooking = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { 
      pitch_id, 
      timeslot_id, 
      booking_date, 
      deposit_amount,
      notes,
      services // Mảng các dịch vụ: [{ service_id, quantity }]
    } = req.body;
    
    const user_id = req.user.id;

    // Lấy thông tin user
    const user = await User.findById(user_id);

    // Kiểm tra timeslot còn khả dụng không
    const [timeslots] = await connection.execute(
      'SELECT * FROM timeslots WHERE id = ? AND is_available = true FOR UPDATE',
      [timeslot_id]
    );

    if (timeslots.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Khung giờ này đã được đặt' });
    }

    const timeslot = timeslots[0];
    let total_price = parseFloat(timeslot.price);

    // Tính tiền dịch vụ nếu có
    let servicesTotal = 0;
    if (services && services.length > 0) {
      for (const service of services) {
        const [serviceRows] = await connection.execute(
          'SELECT price FROM services WHERE id = ?',
          [service.service_id]
        );
        if (serviceRows.length > 0) {
          servicesTotal += parseFloat(serviceRows[0].price) * service.quantity;
        }
      }
    }

    total_price += servicesTotal;

    // Tạo booking
    const booking_code = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
    const [result] = await connection.execute(
      `INSERT INTO bookings (
        booking_code, user_id, pitch_id, timeslot_id, booking_date, 
        start_time, end_time, total_price, deposit_amount,
        customer_name, customer_phone, customer_email, notes, status
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        booking_code,
        user_id, 
        pitch_id, 
        timeslot_id, 
        booking_date,
        timeslot.start_time,
        timeslot.end_time,
        total_price,
        deposit_amount || 0,
        user.full_name,
        user.phone,
        user.email,
        notes
      ]
    );

    const booking_id = result.insertId;

    // Thêm dịch vụ vào booking nếu có
    if (services && services.length > 0) {
      for (const service of services) {
        const [serviceRows] = await connection.execute(
          'SELECT price FROM services WHERE id = ?',
          [service.service_id]
        );
        if (serviceRows.length > 0) {
          const price = parseFloat(serviceRows[0].price);
          const total = price * service.quantity;
          await connection.execute(
            'INSERT INTO booking_services (booking_id, service_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
            [booking_id, service.service_id, service.quantity, price, total]
          );
        }
      }
    }

    // Đánh dấu timeslot đã đặt
    await connection.execute(
      'UPDATE timeslots SET is_available = false WHERE id = ?',
      [timeslot_id]
    );

    await connection.commit();

    res.status(201).json({ 
      message: 'Đặt sân thành công', 
      bookingId: booking_id,
      booking_code 
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
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

// Lấy chi tiết đơn đặt
exports.getBookingDetail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt' });
    }

    // Lấy dịch vụ của booking
    const services = await Booking.getServices(req.params.id);

    res.json({ booking, services });
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

    const { cancellation_reason } = req.body;

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
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ? WHERE id = ?',
      [cancellation_reason, req.params.id]
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