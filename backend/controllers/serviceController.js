const Service = require('../models/Service');

// Lấy tất cả dịch vụ
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.getAll();
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy dịch vụ theo category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.getByCategory(category);
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo dịch vụ mới (Admin)
exports.createService = async (req, res) => {
  try {
    const serviceId = await Service.create(req.body);
    res.status(201).json({ message: 'Tạo dịch vụ thành công', serviceId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật dịch vụ (Admin)
exports.updateService = async (req, res) => {
  try {
    await Service.update(req.params.id, req.body);
    res.json({ message: 'Cập nhật dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa dịch vụ (Admin)
exports.deleteService = async (req, res) => {
  try {
    await Service.delete(req.params.id);
    res.json({ message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};