const jwt = require("jsonwebtoken");
const db = require("../config/database");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra trong bảng users với role = 'admin'
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = "admin" AND is_active = 1',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Không có quyền admin" });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = adminAuth;
