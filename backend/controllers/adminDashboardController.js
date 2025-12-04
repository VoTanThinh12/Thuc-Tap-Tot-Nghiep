const db = require("../config/database");

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Lấy thống kê
    const [[stats]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM pitches) as totalFields,
        (SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURDATE()) as todayBookings,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as totalCustomers,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings 
         WHERE MONTH(booking_date) = MONTH(CURDATE()) 
         AND YEAR(booking_date) = YEAR(CURDATE())
         AND status IN ('confirmed', 'completed')) as monthRevenue
    `);

    // Lấy booking gần đây
    const [recentBookings] = await db.query(`
      SELECT 
        b.booking_code,
        b.customer_name,
        b.start_time,
        b.status,
        p.name as pitch_name
      FROM bookings b
      JOIN pitches p ON b.pitch_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      stats,
      recentBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
