const Pitch = require('../models/Pitch');

// Lấy danh sách sân
exports.getAllPitches = async (req, res) => {
  try {
    const pitches = await Pitch.getAll();
    res.json({ pitches });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết sân
exports.getPitchById = async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }
    res.json({ pitch });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tìm kiếm sân
exports.searchPitches = async (req, res) => {
  try {
    const { type, location, maxPrice } = req.query;
    const pitches = await Pitch.search({ type, location, maxPrice });
    res.json({ pitches });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo sân mới (Admin)
exports.createPitch = async (req, res) => {
  try {
    const pitchData = req.body;
    const pitchId = await Pitch.create(pitchData);
    res.status(201).json({ message: 'Tạo sân thành công', pitchId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật sân (Admin)
exports.updatePitch = async (req, res) => {
  try {
    await Pitch.update(req.params.id, req.body);
    res.json({ message: 'Cập nhật sân thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa sân (Admin)
exports.deletePitch = async (req, res) => {
  try {
    await Pitch.delete(req.params.id);
    res.json({ message: 'Xóa sân thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};