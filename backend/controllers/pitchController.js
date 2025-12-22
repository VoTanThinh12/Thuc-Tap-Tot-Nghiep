const Pitch = require("../models/Pitch");
const db = require("../config/database");

async function getImagesByPitchIds(pitchIds) {
  if (!pitchIds || pitchIds.length === 0) return {};

  const [rows] = await db.query(
    `SELECT pitch_id, image_url
     FROM pitch_images
     WHERE pitch_id IN (?)
     ORDER BY is_primary DESC, sort_order ASC, id ASC`,
    [pitchIds]
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.pitch_id]) map[row.pitch_id] = [];
    map[row.pitch_id].push(row.image_url);
  }

  return map;
}

// Lấy danh sách sân
exports.getAllPitches = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, type, location, address, description, 
             price_per_hour, average_rating, total_reviews, capacity, status, facilities, images, created_at 
       FROM pitches 
       WHERE status = 'active' 
       ORDER BY created_at DESC`
    );

    // Parse images safely
    let pitches = rows.map((pitch) => {
      try {
        return {
          ...pitch,
          images: pitch.images ? JSON.parse(pitch.images) : [],
          facilities: pitch.facilities ? JSON.parse(pitch.facilities) : [],
        };
      } catch (parseError) {
        console.error("Parse error for pitch:", pitch.id);
        return {
          ...pitch,
          images: [],
          facilities: [],
        };
      }
    });

    try {
      const imagesMap = await getImagesByPitchIds(pitches.map((p) => p.id));
      pitches = pitches.map((p) => ({
        ...p,
        images: imagesMap[p.id] || p.images || [],
      }));
    } catch (error) {
      // fallback to JSON images
    }

    res.json({
      success: true,
      pitches: pitches,
      count: pitches.length,
    });
  } catch (error) {
    console.error("❌ Error in getAllPitches:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách sân",
      error: error.message,
    });
  }
};

// Lấy chi tiết sân
exports.getPitchById = async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) {
      return res.status(404).json({ message: "Không tìm thấy sân" });
    }

    try {
      const [rows] = await db.query(
        `SELECT image_url
         FROM pitch_images
         WHERE pitch_id = ?
         ORDER BY is_primary DESC, sort_order ASC, id ASC`,
        [req.params.id]
      );
      pitch.images = rows.map((r) => r.image_url);
    } catch (error) {
      // keep JSON pitch.images
    }

    res.json({ pitch });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tìm kiếm sân
exports.searchPitches = async (req, res) => {
  try {
    const { type, location, maxPrice } = req.query;
    const pitches = await Pitch.search({ type, location, maxPrice });
    res.json({ pitches });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo sân mới (Admin)
exports.createPitch = async (req, res) => {
  try {
    const pitchData = req.body;
    const pitchId = await Pitch.create(pitchData);
    res.status(201).json({ message: "Tạo sân thành công", pitchId });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật sân (Admin)
exports.updatePitch = async (req, res) => {
  try {
    await Pitch.update(req.params.id, req.body);
    res.json({ message: "Cập nhật sân thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa sân (Admin)
exports.deletePitch = async (req, res) => {
  try {
    await Pitch.delete(req.params.id);
    res.json({ message: "Xóa sân thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
