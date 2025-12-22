const User = require('../models/User');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, full_name, email, password, phone, address } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo user mới - xử lý cả name và full_name
    const userData = {
      full_name: full_name || name || 'User',
      email,
      password,
      phone: phone || null,
      address: address || null
    };

    const userId = await User.create(userData);

    res.status(201).json({ 
      message: 'Đăng ký thành công', 
      userId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thông tin user hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ 
      user: {
        ...user,
        name: user.full_name // Thêm name để tương thích với frontend
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
  try {
    await User.update(req.user.id, req.body);
    res.json({ message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu (client)
exports.changePassword = async (req, res) => {
  try {
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const userId = req.user?.id;
    const [[user]] = await db.query(
      'SELECT id, password FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [
      hashedPassword,
      userId,
    ]);

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};