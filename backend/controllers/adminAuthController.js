const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Tìm admin trong database
    const [admins] = await db.query(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, username]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    const admin = admins[0];

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    // Kiểm tra trạng thái admin
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { 
        adminId: admin.admin_id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Cập nhật last_login
    await db.query(
      'UPDATE admins SET last_login = NOW() WHERE admin_id = ?',
      [admin.admin_id]
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    const [admins] = await db.query(
      'SELECT admin_id, username, email, full_name, role, phone, created_at, last_login FROM admins WHERE admin_id = ?',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }

    res.json({
      success: true,
      admin: admins[0]
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Lấy thông tin admin
    const [admins] = await db.query(
      'SELECT password FROM admins WHERE admin_id = ?',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(oldPassword, admins[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await db.query(
      'UPDATE admins SET password = ? WHERE admin_id = ?',
      [hashedPassword, adminId]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};