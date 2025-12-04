const db = require("../config/database");

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Lấy thống kê
    const [[stats]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM pitches WHERE status = 'active') as totalFields,
        (SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURDATE()) as todayBookings,
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND is_active = 1) as totalCustomers,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings 
         WHERE MONTH(booking_date) = MONTH(CURDATE()) 
         AND YEAR(booking_date) = YEAR(CURDATE())
         AND status IN ('confirmed', 'completed')) as monthRevenue
    `);

    // Lấy booking gần đây
    const [recentBookings] = await db.query(`
      SELECT 
        b.id,
        b.booking_code,
        b.customer_name,
        b.start_time,
        b.end_time,
        b.status,
        b.total_price,
        p.name as pitch_name
      FROM bookings b
      LEFT JOIN pitches p ON b.pitch_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        totalFields: stats.totalFields || 0,
        todayBookings: stats.todayBookings || 0,
        totalCustomers: stats.totalCustomers || 0,
        monthRevenue: stats.monthRevenue || 0,
      },
      recentBookings: recentBookings,
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

// Revenue chart data
exports.getRevenueChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [data] = await db.query(
      `
      SELECT 
        DATE(booking_date) as date,
        COUNT(*) as total_bookings,
        SUM(total_price) as revenue
      FROM bookings
      WHERE booking_date BETWEEN ? AND ?
      AND status IN ('confirmed', 'completed')
      GROUP BY DATE(booking_date)
      ORDER BY date
    `,
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: data,
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
