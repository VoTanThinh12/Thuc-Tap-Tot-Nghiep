const db = require('../config/database');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { search, status, date } = req.query;
    
    let query = `
      SELECT 
        b.*,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        f.name as field_name
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN fields f ON b.field_id = f.field_id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (b.booking_code LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'Tất cả') {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(b.booking_date) = ?';
      params.push(date);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await db.query(query, params);

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get booking statistics
exports.getBookingStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM bookings
    `);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    await db.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM bookings WHERE booking_id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa đơn đặt thành công'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};