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

    const [bookingTrend] = await db.query(`
      SELECT
        DATE(d.day) as booking_date,
        COALESCE(COUNT(b.id), 0) as total_bookings
      FROM (
        SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY) AS day
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        UNION ALL SELECT CURDATE()
      ) d
      LEFT JOIN bookings b ON DATE(b.booking_date) = DATE(d.day)
      GROUP BY DATE(d.day)
      ORDER BY booking_date
    `);

    const [revenue7Days] = await db.query(`
      SELECT
        DATE(d.day) as booking_date,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as revenue
      FROM (
        SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY) AS day
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
        UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        UNION ALL SELECT CURDATE()
      ) d
      LEFT JOIN bookings b ON DATE(b.booking_date) = DATE(d.day)
      GROUP BY DATE(d.day)
      ORDER BY booking_date
    `);

    const [statusDistributionRows] = await db.query(`
      SELECT status, COUNT(*) as total
      FROM bookings
      GROUP BY status
    `);

    const statusDistribution = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const row of statusDistributionRows) {
      if (statusDistribution[row.status] !== undefined) {
        statusDistribution[row.status] = Number(row.total || 0);
      }
    }

    res.json({
      success: true,
      stats: {
        totalFields: stats.totalFields || 0,
        todayBookings: stats.todayBookings || 0,
        totalCustomers: stats.totalCustomers || 0,
        monthRevenue: stats.monthRevenue || 0,
      },
      recentBookings: recentBookings,
      charts: {
        bookingTrend: bookingTrend,
        revenue7Days: revenue7Days,
        statusDistribution: statusDistribution,
      },
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

exports.getRecentBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.*,
        p.name as pitch_name
      FROM bookings b
      LEFT JOIN pitches p ON b.pitch_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      bookings: bookings,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải đơn đặt gần đây",
      error: error.message,
    });
  }
};
