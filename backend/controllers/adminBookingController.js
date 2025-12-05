const db = require("../config/database");

// Lấy tất cả bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id,
        b.booking_code,
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.total_price,
        b.status,
        b.created_at,
        b.updated_at,
        u.full_name as user_name,
        u.email as user_email,
        p.name as pitch_name,
        p.type as pitch_type,
        p.location as pitch_location
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN pitches p ON b.pitch_id = p.id
      ORDER BY b.created_at DESC
    `);

    res.json({
      success: true,
      bookings: bookings,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy thống kê booking
exports.getBookingStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END), 0) as total_revenue
      FROM bookings
    `);

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Check if booking exists
    const [existing] = await db.query("SELECT * FROM bookings WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt sân",
      });
    }

    // Update status
    await db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái",
      error: error.message,
    });
  }
};

// Lấy chi tiết booking
exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [[booking]] = await db.query(
      `
      SELECT 
        b.*,
        u.full_name, 
        u.email, 
        u.phone as user_phone,
        p.name as pitch_name, 
        p.type, 
        p.location, 
        p.address,
        p.price_per_hour
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN pitches p ON b.pitch_id = p.id
      WHERE b.id = ?
    `,
      [id]
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    res.json({
      success: true,
      booking: booking,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa booking (nếu cần)
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra booking tồn tại
    const [[booking]] = await db.query("SELECT * FROM bookings WHERE id = ?", [
      id,
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    // Chỉ cho phép xóa nếu trạng thái là pending hoặc cancelled
    if (!["pending", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xóa booking có trạng thái pending hoặc cancelled",
      });
    }

    await db.query("DELETE FROM bookings WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Xóa booking thành công",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
