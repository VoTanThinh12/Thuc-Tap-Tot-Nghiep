const db = require('../config/database');

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Tổng số sân bóng
    const [fieldsCount] = await db.query('SELECT COUNT(*) as total FROM fields');
    
    // Đơn đặt hôm nay
    const [todayBookings] = await db.query(
      'SELECT COUNT(*) as total FROM bookings WHERE DATE(booking_date) = CURDATE()'
    );
    
    // Tổng khách hàng
    const [customersCount] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "customer"'
    );
    
    // Doanh thu tháng này
    const [monthRevenue] = await db.query(
      'SELECT SUM(total_price) as total FROM bookings WHERE MONTH(booking_date) = MONTH(CURDATE()) AND YEAR(booking_date) = YEAR(CURDATE()) AND status IN ("confirmed", "completed")'
    );

    // Đơn đặt gần đây
    const [recentBookings] = await db.query(`
      SELECT 
        b.booking_id,
        b.booking_code,
        u.full_name as customer_name,
        f.name as field_name,
        b.start_time,
        b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN fields f ON b.field_id = f.field_id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        totalFields: fieldsCount[0].total,
        todayBookings: todayBookings[0].total,
        totalCustomers: customersCount[0].total,
        monthRevenue: monthRevenue[0].total || 0
      },
      recentBookings
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get Revenue Chart Data
exports.getRevenueChart = async (req, res) => {
  try {
    const { period = '30days' } = req.query;

    let query;
    if (period === '7days') {
      query = `
        SELECT 
          DATE(booking_date) as date,
          SUM(total_price) as revenue,
          COUNT(*) as bookings
        FROM bookings
        WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND status IN ('confirmed', 'completed')
        GROUP BY DATE(booking_date)
        ORDER BY date
      `;
    } else {
      query = `
        SELECT 
          DATE(booking_date) as date,
          SUM(total_price) as revenue,
          COUNT(*) as bookings
        FROM bookings
        WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND status IN ('confirmed', 'completed')
        GROUP BY DATE(booking_date)
        ORDER BY date
      `;
    }

    const [chartData] = await db.query(query);

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};