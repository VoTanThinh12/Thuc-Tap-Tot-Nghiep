const db = require("../config/database");

// Lấy danh sách sân
exports.getAllFields = async (req, res) => {
  try {
    const [fields] = await db.query(`
      SELECT 
        id,
        name,
        type,
        location,
        address,
        description,
        capacity,
        price_per_hour,
        status,
        image_url,
        created_at,
        updated_at
      FROM pitches 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      fields: fields,
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

// Tạo sân mới
exports.createField = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      address,
      description,
      capacity,
      price_per_hour,
      status,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO pitches (name, type, location, address, description, capacity, price_per_hour, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        type,
        location,
        address,
        description,
        capacity,
        price_per_hour,
        status || "active",
      ]
    );

    res.json({
      success: true,
      message: "Tạo sân thành công",
      id: result.insertId,
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

// Cập nhật sân
exports.updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      location,
      address,
      description,
      capacity,
      price_per_hour,
      status,
    } = req.body;

    await db.query(
      `UPDATE pitches 
       SET name=?, type=?, location=?, address=?, description=?, capacity=?, price_per_hour=?, status=?, updated_at=NOW() 
       WHERE id=?`,
      [
        name,
        type,
        location,
        address,
        description,
        capacity,
        price_per_hour,
        status,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Cập nhật thành công",
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

// Xóa sân
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra có booking nào không
    const [[check]] = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE pitch_id = ?",
      [id]
    );

    if (check.count > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa sân đã có booking",
      });
    }

    await db.query("DELETE FROM pitches WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Xóa thành công",
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
