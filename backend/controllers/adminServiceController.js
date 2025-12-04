const db = require("../config/database");

// Lấy danh sách dịch vụ
exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.query(
      "SELECT * FROM services ORDER BY created_at DESC"
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo dịch vụ
exports.createService = async (req, res) => {
  try {
    const { name, description, price, unit, category } = req.body;

    const [result] = await db.query(
      "INSERT INTO services (name, description, price, unit, category) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, unit, category]
    );

    res.json({ message: "Tạo dịch vụ thành công", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, unit, category, status } = req.body;

    await db.query(
      "UPDATE services SET name=?, description=?, price=?, unit=?, category=?, status=? WHERE id=?",
      [name, description, price, unit, category, status, id]
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM services WHERE id = ?", [id]);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
