const db = require('../config/database');

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT 
        u.*,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.total_price), 0) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thống kê khách hàng
exports.getCustomerStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.total_price), 0) as total_spent,
        MAX(b.booking_date) as last_booking
      FROM bookings b
      WHERE b.user_id = ?
    `, [id]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
