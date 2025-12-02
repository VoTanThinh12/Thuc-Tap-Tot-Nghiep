const db = require('../config/database');

// Get all fields
exports.getAllFields = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = 'SELECT * FROM fields WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (name LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [fields] = await db.query(query, params);

    res.json({
      success: true,
      fields
    });

  } catch (error) {
    console.error('Get all fields error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Create field
exports.createField = async (req, res) => {
  try {
    const { name, location, type, price_per_hour, description, amenities } = req.body;

    if (!name || !location || !type || !price_per_hour) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO fields (name, location, type, price_per_hour, description, amenities, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, "active")',
      [name, location, type, price_per_hour, description, amenities, imageUrl]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo sân bóng thành công',
      fieldId: result.insertId
    });

  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Update field
exports.updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, type, price_per_hour, description, amenities, status } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    let query = 'UPDATE fields SET name = ?, location = ?, type = ?, price_per_hour = ?, description = ?, amenities = ?, status = ?';
    let params = [name, location, type, price_per_hour, description, amenities, status];

    if (imageUrl) {
      query += ', image_url = ?';
      params.push(imageUrl);
    }

    query += ' WHERE field_id = ?';
    params.push(id);

    await db.query(query, params);

    res.json({
      success: true,
      message: 'Cập nhật sân bóng thành công'
    });

  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Delete field
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM fields WHERE field_id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa sân bóng thành công'
    });

  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};