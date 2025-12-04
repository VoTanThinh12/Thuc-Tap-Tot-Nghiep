const db = require("../config/database");

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(b.total_price), 0) as total_spent,
        MAX(b.booking_date) as last_booking_date
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id AND b.status IN ('confirmed', 'completed')
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      customers: customers,
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

// Lấy thống kê khách hàng
exports.getCustomerStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_customers,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_customers
      FROM users
      WHERE role = 'customer'
    `);

    res.json({
      success: true,
      stats: stats,
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

// Lấy chi tiết khách hàng
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[customer]] = await db.query(
      `
      SELECT 
        u.*,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(b.total_price), 0) as total_spent,
        MAX(b.booking_date) as last_booking_date
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.id = ? AND u.role = 'customer'
      GROUP BY u.id
    `,
      [id]
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng",
      });
    }

    res.json({
      success: true,
      customer: customer,
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
