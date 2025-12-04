const db = require("../config/database");

// Báo cáo doanh thu
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
      [startDate, endDate]
    );

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
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

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
