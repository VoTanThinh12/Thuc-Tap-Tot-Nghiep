const db = require("../config/database");

// Lấy danh sách sân
exports.getAllFields = async (req, res) => {
  try {
    const [fields] = await db.query(
      "SELECT * FROM pitches ORDER BY created_at DESC"
    );
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
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
      "INSERT INTO pitches (name, type, location, address, description, capacity, price_per_hour, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
      message: "Tạo sân thành công",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
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
      "UPDATE pitches SET name=?, type=?, location=?, address=?, description=?, capacity=?, price_per_hour=?, status=? WHERE id=?",
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

    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa sân
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pitches WHERE id = ?", [id]);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
