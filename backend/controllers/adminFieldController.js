const db = require('../config/database');

// Get all fields (pitches)
exports.getAllFields = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = 'SELECT * FROM pitches WHERE 1=1';
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

// Create field (pitch)
exports.createField = async (req, res) => {
  try {
    const { name, location, address, type, price_per_hour, description, capacity, facilities } = req.body;

    if (!name || !location || !address || !type || !price_per_hour || !capacity) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const images = req.files ? JSON.stringify(req.files.map(f => `/uploads/${f.filename}`)) : null;
    const facilitiesJson = facilities ? JSON.stringify(JSON.parse(facilities)) : null;

    const [result] = await db.query(
      'INSERT INTO pitches (name, location, address, type, price_per_hour, description, capacity, images, facilities, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "active")',
      [name, location, address, type, price_per_hour, description, capacity, images, facilitiesJson]
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

// Update field (pitch)
exports.updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, address, type, price_per_hour, description, capacity, facilities, status } = req.body;

    let query = 'UPDATE pitches SET name = ?, location = ?, address = ?, type = ?, price_per_hour = ?, description = ?, capacity = ?, status = ?';
    let params = [name, location, address, type, price_per_hour, description, capacity, status];

    if (facilities) {
      query += ', facilities = ?';
      params.push(JSON.stringify(JSON.parse(facilities)));
    }

    if (req.files && req.files.length > 0) {
      const images = JSON.stringify(req.files.map(f => `/uploads/${f.filename}`));
      query += ', images = ?';
      params.push(images);
    }

    query += ' WHERE id = ?';
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

// Delete field (pitch)
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM pitches WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa sân bóng thành công'
    });

  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};