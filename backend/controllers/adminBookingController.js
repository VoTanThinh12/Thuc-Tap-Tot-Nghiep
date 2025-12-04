const db = require("../config/database");

// Lấy tất cả bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.*,
        u.full_name as user_name,
        p.name as pitch_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN pitches p ON b.pitch_id = p.id
      ORDER BY b.created_at DESC
    `);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy chi tiết booking
exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [[booking]] = await db.query(
      `
      SELECT 
        b.*,
        u.full_name, u.email, u.phone as user_phone,
        p.name as pitch_name, p.type, p.location
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN pitches p ON b.pitch_id = p.id
      WHERE b.id = ?
    `,
      [id]
    );

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
