const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra xem có phải admin không
    if (!decoded.adminId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    // Lưu thông tin admin vào request
    req.admin = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};