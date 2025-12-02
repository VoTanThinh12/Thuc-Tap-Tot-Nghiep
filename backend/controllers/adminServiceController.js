const db = require('../config/database');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = 'SELECT * FROM services WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'Tất cả') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [services] = await db.query(query, params);

    res.json({
      success: true,
      services
    });

  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Create service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const [result] = await db.query(
      'INSERT INTO services (name, description, price, category, status) VALUES (?, ?, ?, ?, "active")',
      [name, description, price, category]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      serviceId: result.insertId
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, status } = req.body;

    await db.query(
      'UPDATE services SET name = ?, description = ?, price = ?, category = ?, status = ? WHERE service_id = ?',
      [name, description, price, category, status, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật dịch vụ thành công'
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM services WHERE service_id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa dịch vụ thành công'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};