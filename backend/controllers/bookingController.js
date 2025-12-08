const Booking = require("../models/Booking");
const User = require("../models/User");
const db = require("../config/database");

// CHECK AVAILABILITY - API MỚI
exports.checkAvailability = async (req, res) => {
  try {
    const { pitch_id, booking_date, start_time, end_time } = req.body;

    if (!pitch_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // Check xem có booking nào đang pending/confirmed trong khoảng thời gian này không
    const [conflicts] = await db.execute(
      `SELECT id, booking_code, start_time, end_time, status
       FROM bookings
       WHERE pitch_id = ?
       AND booking_date = ?
       AND status IN ('pending', 'confirmed')
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        pitch_id,
        booking_date,
        end_time,
        start_time, // Overlap check 1
        end_time,
        end_time, // Overlap check 2
        start_time,
        end_time, // Contained within
      ]
    );

    res.json({
      success: true,
      available: conflicts.length === 0,
      conflicts: conflicts,
    });
  } catch (error) {
    console.error("❌ Error checking availability:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra khung giờ",
      error: error.message,
    });
  }
};

// TẠO ĐƠN ĐẶT SÂN - KHÔNG CẦN TIMESLOT_ID
exports.createBooking = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      pitch_id,
      booking_date,
      start_time,
      end_time,
      total_price,
      deposit_amount,
      notes,
      services, // Mảng các dịch vụ: [{ service_id, quantity }]
    } = req.body;

    const user_id = req.user.id;

    // Validate required fields
    if (
      !pitch_id ||
      !booking_date ||
      !start_time ||
      !end_time ||
      !total_price
    ) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // Lấy thông tin user
    const user = await User.findById(user_id);
    if (!user) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    // 🔥 CHECK CONFLICT - Double check
    const [conflicts] = await connection.execute(
      `SELECT id FROM bookings
       WHERE pitch_id = ?
       AND booking_date = ?
       AND status IN ('pending', 'confirmed')
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND end_time <= ?)
       )
       LIMIT 1`,
      [
        pitch_id,
        booking_date,
        end_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ]
    );

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "❌ Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác!",
      });
    }

    // Tính tổng tiền
    let finalTotalPrice = parseFloat(total_price);

    // Tính tiền dịch vụ nếu có
    let servicesTotal = 0;
    if (services && Array.isArray(services) && services.length > 0) {
      for (const service of services) {
        const [serviceRows] = await connection.execute(
          "SELECT price FROM services WHERE id = ?",
          [service.service_id]
        );
        if (serviceRows.length > 0) {
          servicesTotal += parseFloat(serviceRows[0].price) * service.quantity;
        }
      }
      finalTotalPrice += servicesTotal;
    }

    // Tạo booking
    const booking_code = "BK" + Date.now() + Math.floor(Math.random() * 10000);
    const [result] = await connection.execute(
      `INSERT INTO bookings (
        booking_code, user_id, pitch_id, booking_date, 
        start_time, end_time, total_price, deposit_amount,
        customer_name, customer_phone, customer_email, notes, status
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        booking_code,
        user_id,
        pitch_id,
        booking_date,
        start_time,
        end_time,
        finalTotalPrice,
        deposit_amount || 0,
        user.full_name,
        user.phone || "",
        user.email,
        notes || null,
      ]
    );

    const booking_id = result.insertId;

    // Thêm dịch vụ vào booking nếu có
    if (services && Array.isArray(services) && services.length > 0) {
      for (const service of services) {
        const [serviceRows] = await connection.execute(
          "SELECT price FROM services WHERE id = ?",
          [service.service_id]
        );
        if (serviceRows.length > 0) {
          const price = parseFloat(serviceRows[0].price);
          const total = price * service.quantity;
          await connection.execute(
            "INSERT INTO booking_services (booking_id, service_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)",
            [booking_id, service.service_id, service.quantity, price, total]
          );
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "✅ Đặt sân thành công! Chờ admin xác nhận.",
      booking: {
        id: booking_id,
        booking_code: booking_code,
        status: "pending",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Lấy đơn đặt của user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.getByUserId(req.user.id);
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy chi tiết đơn đặt
exports.getBookingDetail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt",
      });
    }

    // Lấy dịch vụ của booking
    const services = await Booking.getServices(req.params.id);

    res.json({ success: true, booking, services });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy tất cả đơn đặt (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái đơn đặt (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Booking.updateStatus(req.params.id, status);
    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
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
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt",
      });
    }

    const booking = bookings[0];

    // Kiểm tra có thể hủy không (chỉ hủy được pending)
    if (booking.status !== "pending") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy đơn đang chờ xác nhận",
      });
    }

    // Hủy booking
    await connection.execute(
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ? WHERE id = ?',
      [cancellation_reason || "Khách hủy", req.params.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Hủy đơn đặt thành công",
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = exports;
