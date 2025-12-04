const db = require("../config/database");

// Lấy danh sách dịch vụ
exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT 
        id,
        name,
        description,
        price,
        unit,
        category,
        status,
        created_at,
        updated_at
      FROM services 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      services: services,
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

// Tạo dịch vụ
exports.createService = async (req, res) => {
  try {
    const { name, description, price, unit, category } = req.body;

    const [result] = await db.query(
      `INSERT INTO services (name, description, price, unit, category, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [name, description, price, unit, category]
    );

    res.json({
      success: true,
      message: "Tạo dịch vụ thành công",
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

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, unit, category, status } = req.body;

    await db.query(
      `UPDATE services 
       SET name=?, description=?, price=?, unit=?, category=?, status=?, updated_at=NOW() 
       WHERE id=?`,
      [name, description, price, unit, category, status, id]
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

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM services WHERE id = ?", [id]);

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
