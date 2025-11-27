const db = require('../config/database');

class Service {
  // Lấy tất cả dịch vụ
  static async getAll() {
    const query = 'SELECT * FROM services WHERE status = "active"';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Lấy dịch vụ theo category
  static async getByCategory(category) {
    const query = 'SELECT * FROM services WHERE category = ? AND status = "active"';
    const [rows] = await db.execute(query, [category]);
    return rows;
  }

  // Lấy dịch vụ theo ID
  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Tạo dịch vụ mới (Admin)
  static async create(serviceData) {
    const { name, description, price, unit, category, image } = serviceData;
    const query = `
      INSERT INTO services (name, description, price, unit, category, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, description, price, unit, category, image]);
    return result.insertId;
  }

  // Cập nhật dịch vụ (Admin)
  static async update(id, serviceData) {
    const { name, description, price, unit, category, status } = serviceData;
    const query = `
      UPDATE services
      SET name = ?, description = ?, price = ?, unit = ?, category = ?, status = ?
      WHERE id = ?
    `;
    await db.execute(query, [name, description, price, unit, category, status, id]);
  }

  // Xóa dịch vụ (soft delete)
  static async delete(id) {
    const query = 'UPDATE services SET status = "inactive" WHERE id = ?';
    await db.execute(query, [id]);
  }
}

module.exports = Service;