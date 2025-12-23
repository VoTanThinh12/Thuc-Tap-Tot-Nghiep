const db = require("../config/database");
const Pitch = require("../models/Pitch");
const upload = require("../middleware/upload");

function toImageObjects(pitch_id, urls = []) {
  const pid = Number(pitch_id);
  const list = Array.isArray(urls) ? urls : [];
  return list.map((url, idx) => ({
    id: `${pid}:${idx}`,
    pitch_id: pid,
    image_url: url,
    is_primary: idx === 0 ? 1 : 0,
    sort_order: idx,
    created_at: null,
  }));
}

function parseImageId(id) {
  const raw = String(id || "");
  const parts = raw.split(":");
  if (parts.length !== 2) return null;
  const pitch_id = Number(parts[0]);
  const index = Number(parts[1]);
  if (!Number.isFinite(pitch_id) || !Number.isFinite(index)) return null;
  if (index < 0) return null;
  return { pitch_id, index };
}

function moveItem(arr, fromIndex, toIndex) {
  const list = Array.isArray(arr) ? [...arr] : [];
  if (fromIndex < 0 || fromIndex >= list.length) return list;
  const to = Math.max(0, Math.min(list.length - 1, toIndex));
  const [item] = list.splice(fromIndex, 1);
  list.splice(to, 0, item);
  return list;
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return "";
  const trimmed = String(imageUrl).trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

function isAllowedImageExt(url) {
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  const clean = String(url).split("?")[0].split("#")[0].toLowerCase();
  return allowed.some((ext) => clean.endsWith(ext));
}

class PitchImageController {
  // Public: get images by pitch id
  static async getByPitch(req, res) {
    try {
      const { pitch_id } = req.params;
      const pitch = await Pitch.findById(pitch_id);
      if (!pitch) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      const images = toImageObjects(pitch_id, pitch.images || []);
      res.json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách ảnh sân",
        error: error.message,
      });
    }
  }

  // Admin: create by url (http/https or /uploads/...)
  static async createByUrl(req, res) {
    try {
      const { pitch_id, image_url, is_primary } = req.body;
      if (!pitch_id) {
        return res.status(400).json({
          success: false,
          message: "Thiếu pitch_id",
        });
      }

      let normalizedUrl = normalizeImageUrl(image_url);
      if (!normalizedUrl) {
        return res.status(400).json({
          success: false,
          message: "Thiếu image_url",
        });
      }

      // If admin pastes just a filename like "a.webp" -> treat as /uploads/a.webp
      if (
        normalizedUrl.startsWith("/") &&
        !normalizedUrl.startsWith("/uploads/") &&
        normalizedUrl.indexOf("/", 1) === -1 &&
        isAllowedImageExt(normalizedUrl)
      ) {
        normalizedUrl = `/uploads${normalizedUrl}`;
      }

      const isHttp =
        normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://");
      const isUploadPath = normalizedUrl.startsWith("/uploads/");
      if (!isHttp && !isUploadPath) {
        return res.status(400).json({
          success: false,
          message: "image_url chỉ hỗ trợ link website (http/https) hoặc đường dẫn /uploads/...",
        });
      }

      if (isUploadPath && !isAllowedImageExt(normalizedUrl)) {
        return res.status(400).json({
          success: false,
          message:
            "Đường dẫn /uploads chỉ hỗ trợ đuôi ảnh: .jpg, .jpeg, .png, .gif, .webp, .bmp, .svg",
        });
      }

      const pitch = await Pitch.findById(pitch_id);
      if (!pitch) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      const currentUrls = Array.isArray(pitch.images) ? [...pitch.images] : [];
      const hasExisting = currentUrls.includes(normalizedUrl);

      const shouldBePrimary = Boolean(is_primary) || currentUrls.length === 0;

      let nextUrls = currentUrls;
      if (!hasExisting) {
        nextUrls = [...currentUrls, normalizedUrl];
      }

      const index = nextUrls.indexOf(normalizedUrl);
      if (shouldBePrimary && index > 0) {
        nextUrls = moveItem(nextUrls, index, 0);
      }

      await Pitch.updateImages(pitch_id, nextUrls);

      const finalIndex = nextUrls.indexOf(normalizedUrl);

      res.status(201).json({
        success: true,
        message: "Thêm ảnh bằng link thành công",
        data: { id: `${Number(pitch_id)}:${finalIndex}`, image_url: normalizedUrl },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm ảnh bằng link",
        error: error.message,
      });
    }
  }

  // Admin: list all images (optional filter by pitch_id)
  static async getAll(req, res) {
    try {
      const pitchId = req.query.pitch_id;
      if (pitchId) {
        const pitch = await Pitch.findById(pitchId);
        if (!pitch) {
          return res.json({ success: true, data: [] });
        }
        const images = toImageObjects(pitchId, pitch.images || []).map((img) => ({
          ...img,
          pitch_name: pitch.name,
          pitch_location: pitch.location,
        }));
        return res.json({ success: true, data: images });
      }

      const [pitches] = await db.query(
        "SELECT id, name, location, images FROM pitches ORDER BY id ASC"
      );

      const allImages = [];
      for (const p of pitches) {
        let urls = [];
        try {
          urls = JSON.parse(p.images || "[]");
        } catch (e) {
          urls = [];
        }

        const rows = toImageObjects(p.id, urls).map((img) => ({
          ...img,
          pitch_name: p.name,
          pitch_location: p.location,
        }));
        allImages.push(...rows);
      }

      res.json({ success: true, data: allImages });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách ảnh",
        error: error.message,
      });
    }
  }

  // Admin: upload new image for pitch
  static async uploadImage(req, res) {
    try {
      const { pitch_id } = req.body;
      if (!pitch_id) {
        return res.status(400).json({
          success: false,
          message: "Thiếu pitch_id",
        });
      }

      const pitch = await Pitch.findById(pitch_id);
      if (!pitch) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Thiếu file ảnh",
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const currentUrls = Array.isArray(pitch.images) ? [...pitch.images] : [];
      const nextUrls = [...currentUrls, imageUrl];
      await Pitch.updateImages(pitch_id, nextUrls);

      res.status(201).json({
        success: true,
        message: "Upload ảnh thành công",
        data: { id: `${Number(pitch_id)}:${nextUrls.length - 1}`, image_url: imageUrl },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi upload ảnh",
        error: error.message,
      });
    }
  }

  // Admin: set primary
  static async setPrimary(req, res) {
    try {
      const { id } = req.params;
      const parsed = parseImageId(id);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: "ID ảnh không hợp lệ",
        });
      }

      const pitch = await Pitch.findById(parsed.pitch_id);
      if (!pitch) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      const urls = Array.isArray(pitch.images) ? [...pitch.images] : [];
      if (parsed.index >= urls.length) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh",
        });
      }

      const nextUrls = moveItem(urls, parsed.index, 0);
      await Pitch.updateImages(parsed.pitch_id, nextUrls);
      res.json({ success: true, message: "Đặt ảnh chính thành công" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi đặt ảnh chính",
        error: error.message,
      });
    }
  }

  // Admin: update (sort_order)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { sort_order } = req.body;

      const parsed = parseImageId(id);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: "ID ảnh không hợp lệ",
        });
      }

      const pitch = await Pitch.findById(parsed.pitch_id);
      if (!pitch) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      const urls = Array.isArray(pitch.images) ? [...pitch.images] : [];
      if (parsed.index >= urls.length || sort_order === undefined || sort_order === null) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh hoặc không có dữ liệu cập nhật",
        });
      }

      const toIndex = Number(sort_order);
      if (!Number.isFinite(toIndex)) {
        return res.status(400).json({
          success: false,
          message: "sort_order không hợp lệ",
        });
      }

      const nextUrls = moveItem(urls, parsed.index, toIndex);
      await Pitch.updateImages(parsed.pitch_id, nextUrls);
      res.json({ success: true, message: "Cập nhật ảnh thành công" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật ảnh",
        error: error.message,
      });
    }
  }

  // Admin: delete
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const parsed = parseImageId(id);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: "ID ảnh không hợp lệ",
        });
      }

      const pitch = await Pitch.findById(parsed.pitch_id);
      if (!pitch) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      const urls = Array.isArray(pitch.images) ? [...pitch.images] : [];
      if (parsed.index >= urls.length) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh",
        });
      }

      urls.splice(parsed.index, 1);
      await Pitch.updateImages(parsed.pitch_id, urls);

      res.json({ success: true, message: "Xóa ảnh thành công" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa ảnh",
        error: error.message,
      });
    }
  }
}

module.exports = { PitchImageController, upload };
