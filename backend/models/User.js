const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Tạo user mới
  static async create(userData) {
    const { full_name, email, password, phone, address, role = 'customer' } = userData;
    
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (full_name, email, password, phone, address, role) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // Xử lý null values
    const [result] = await db.execute(query, [
      full_name || 'User', 
      email, 
      hashedPassword, 
      phone || null, 
      address || null, 
      role
    ]);
    return result.insertId;
  }

  // Tìm user theo email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  // Tìm user theo ID
  static async findById(id) {
    const query = 'SELECT id, full_name, email, phone, address, role, avatar, created_at FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // So sánh mật khẩu
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Lấy danh sách tất cả khách hàng
  static async getAllCustomers() {
    const query = 'SELECT id, full_name, email, phone, address, created_at FROM users WHERE role = "customer"';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Cập nhật thông tin user
  static async update(id, userData) {
    const { full_name, phone, address, avatar } = userData;
    const query = `
      UPDATE users 
      SET full_name = ?, phone = ?, address = ?, avatar = ?
      WHERE id = ?
    `;
    await db.execute(query, [
      full_name || null, 
      phone || null, 
      address || null, 
      avatar || null, 
      id
    ]);
  }
}

module.exports = User;