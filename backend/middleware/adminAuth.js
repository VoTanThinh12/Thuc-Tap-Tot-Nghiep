const jwt = require("jsonwebtoken");
const db = require("../config/database");
const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra role admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập. Chỉ admin mới được phép.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports = adminAuth;
