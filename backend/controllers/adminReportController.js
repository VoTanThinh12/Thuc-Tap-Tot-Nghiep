const db = require("../config/database");

// Báo cáo doanh thu theo khoảng thời gian
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [revenue] = await db.query(
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
      [startDate || "2020-01-01", endDate || "2099-12-31"]
    );

    res.json({
      success: true,
      data: revenue,
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

// Báo cáo theo sân
exports.getFieldReport = async (req, res) => {
  try {
    const [report] = await db.query(`
      SELECT 
        p.name as pitch_name,
        COUNT(b.id) as total_bookings,
        SUM(b.total_price) as revenue
      FROM pitches p
      LEFT JOIN bookings b ON p.id = b.pitch_id AND b.status IN ('confirmed', 'completed')
      GROUP BY p.id
      ORDER BY revenue DESC
    `);

    res.json({
      success: true,
      data: report,
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

// Doanh thu theo sân (cho Reports page)
exports.getRevenueByField = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        p.id,
        p.name as pitch_name,
        p.type,
        p.location,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_revenue,
        ROUND(
          (COUNT(b.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM bookings), 0)), 
          2
        ) as usage_percentage
      FROM pitches p
      LEFT JOIN bookings b ON p.id = b.pitch_id
      GROUP BY p.id, p.name, p.type, p.location
      ORDER BY total_revenue DESC
    `);

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

// Thống kê theo tháng (12 tháng gần nhất)
exports.getMonthlyStats = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        DATE_FORMAT(b.booking_date, '%Y-%m') as month,
        DATE_FORMAT(b.booking_date, '%m/%Y') as month_display,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as revenue,
        COUNT(DISTINCT b.user_id) as unique_customers
      FROM bookings b
      WHERE b.booking_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      data: data.reverse(), // Đảo ngược để tháng cũ nhất ở đầu
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

// Top khách hàng (Top 10)
exports.getTopCustomers = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_spent,
        MAX(b.booking_date) as last_booking_date,
        DATEDIFF(CURDATE(), MAX(b.booking_date)) as days_since_last_booking
      FROM users u
      INNER JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.full_name, u.email, u.phone
      ORDER BY total_spent DESC
      LIMIT 10
    `);

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

// Tổng hợp báo cáo (cho PDF/Excel)
exports.getFullReport = async (req, res) => {
  try {
    // Thống kê tổng quan
    const [[overview]] = await db.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_fields,
        COUNT(DISTINCT u.id) as total_customers,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE NULL END), 0) as avg_booking_value
      FROM bookings b
      LEFT JOIN pitches p ON b.pitch_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
    `);

    // Doanh thu theo sân
    const [fieldRevenue] = await db.query(`
      SELECT 
        p.name as pitch_name,
        p.type,
        p.location,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_revenue
      FROM pitches p
      LEFT JOIN bookings b ON p.id = b.pitch_id
      GROUP BY p.id
      ORDER BY total_revenue DESC
    `);

    // Top khách hàng
    const [topCustomers] = await db.query(`
      SELECT 
        u.full_name,
        u.email,
        u.phone,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_spent
      FROM users u
      INNER JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    // Thống kê theo tháng
    const [monthlyStats] = await db.query(`
      SELECT 
        DATE_FORMAT(b.booking_date, '%m/%Y') as month,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as revenue
      FROM bookings b
      WHERE b.booking_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
      ORDER BY DATE_FORMAT(b.booking_date, '%Y-%m') DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      report: {
        overview,
        fieldRevenue,
        topCustomers,
        monthlyStats: monthlyStats.reverse(),
        generatedAt: new Date().toISOString(),
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
