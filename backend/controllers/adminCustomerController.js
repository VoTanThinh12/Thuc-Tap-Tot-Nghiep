const db = require('../config/database');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT 
        u.*,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_price) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'customer'
    `;
    let params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC';

    const [customers] = await db.query(query, params);

    res.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get customer statistics
exports.getCustomerStats = async (req, res) => {
  try {
    const [totalCustomers] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "customer"'
    );

    const [activeCustomers] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as total FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    const [totalRevenue] = await db.query(
      'SELECT SUM(total_price) as total FROM bookings WHERE status IN ("confirmed", "completed")'
    );

    const avgSpending = totalCustomers[0].total > 0 
      ? (totalRevenue[0].total || 0) / totalCustomers[0].total 
      : 0;

    res.json({
      success: true,
      stats: {
        totalCustomers: totalCustomers[0].total,
        activeCustomers: activeCustomers[0].total,
        totalRevenue: totalRevenue[0].total || 0,
        avgSpending: Math.round(avgSpending)
      }
    });

  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get customer detail
exports.getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [customers] = await db.query(
      'SELECT id, full_name, email, phone, created_at FROM users WHERE id = ? AND role = "customer"',
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      customer: customers[0],
      bookings
    });

  } catch (error) {
    console.error('Get customer detail error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};