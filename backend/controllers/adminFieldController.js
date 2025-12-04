const db = require("../config/database");

// Get all fields
exports.getAllFields = async (req, res) => {
  try {
    const [fields] = await db.query(`
      SELECT * FROM pitches 
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
      message: "Lỗi khi tải danh sách sân",
      error: error.message,
    });
  }
};

// Create new field
exports.createField = async (req, res) => {
  try {
    const { name, location, type, price_per_hour, status, description } =
      req.body;

    // Validation
    if (!name || !location || !price_per_hour) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Insert vào database
    const [result] = await db.query(
      `
      INSERT INTO pitches (name, location, type, price_per_hour, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        name,
        location,
        type,
        price_per_hour,
        status || "active",
        description || "",
      ]
    );

    res.json({
      success: true,
      message: "Thêm sân thành công",
      field: {
        id: result.insertId,
        name,
        location,
        type,
        price_per_hour,
        status: status || "active",
        description,
      },
    });
  } catch (error) {
    console.error("Error creating field:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm sân",
      error: error.message,
    });
  }
};

// Update field
exports.updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, type, price_per_hour, status, description } =
      req.body;

    // Check if field exists
    const [existing] = await db.query("SELECT * FROM pitches WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sân",
      });
    }

    // Update
    await db.query(
      `
      UPDATE pitches 
      SET name = ?, location = ?, type = ?, price_per_hour = ?, status = ?, description = ?
      WHERE id = ?
    `,
      [name, location, type, price_per_hour, status, description, id]
    );

    res.json({
      success: true,
      message: "Cập nhật sân thành công",
    });
  } catch (error) {
    console.error("Error updating field:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật sân",
      error: error.message,
    });
  }
};

// Delete field
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if field exists
    const [existing] = await db.query("SELECT * FROM pitches WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sân",
      });
    }

    // Delete
    await db.query("DELETE FROM pitches WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Xóa sân thành công",
    });
  } catch (error) {
    console.error("Error deleting field:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sân",
      error: error.message,
    });
  }
};
