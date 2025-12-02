const db = require('../config/database');

// Get revenue by pitch
exports.getRevenueByField = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        p.name as pitch_name,
        COUNT(b.id) as total_bookings,
        SUM(b.total_price) as total_revenue,
        ROUND((COUNT(b.id) * 100.0 / (SELECT COUNT(*) FROM bookings)), 2) as usage_percentage
      FROM pitches p
      LEFT JOIN bookings b ON p.id = b.pitch_id AND b.status IN ('confirmed', 'completed')
      GROUP BY p.id
      ORDER BY total_revenue DESC
    `);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get revenue by field error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get monthly statistics
exports.getMonthlyStats = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        COUNT(*) as total_bookings,
        SUM(total_price) as total_revenue
      FROM bookings
      WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      AND status IN ('confirmed', 'completed')
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get top customers
exports.getTopCustomers = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        u.full_name,
        u.email,
        COUNT(b.id) as total_bookings,
        SUM(b.total_price) as total_spent
      FROM users u
      JOIN bookings b ON u.id = b.user_id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};