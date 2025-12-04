const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// Đăng nhập admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user với role = 'admin'
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const user = users[0];

    // Kiểm tra phải là admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Tài khoản không có quyền admin" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy thông tin admin đang đăng nhập
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật profile admin
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const userId = req.user.id;

    await db.query("UPDATE users SET full_name = ?, phone = ? WHERE id = ?", [
      full_name,
      phone,
      userId,
    ]);

    res.json({ message: "Cập nhật thông tin thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Lấy user hiện tại
    const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
