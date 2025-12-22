const PitchImage = require("../models/PitchImage");
const Pitch = require("../models/Pitch");
const upload = require("../middleware/upload");

async function syncPitchImagesToPitchJson(pitch_id) {
  const images = await PitchImage.getByPitchId(pitch_id);
  const urls = images.map((img) => img.image_url);
  await Pitch.updateImages(pitch_id, urls);
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
      const images = await PitchImage.getByPitchId(pitch_id);
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

      const existing = await PitchImage.getByPitchId(pitch_id);
      const shouldBePrimary = Boolean(is_primary) || existing.length === 0;

      const id = await PitchImage.create({
        pitch_id,
        image_url: normalizedUrl,
        is_primary: shouldBePrimary ? 1 : 0,
        sort_order: existing.length,
      });

      if (shouldBePrimary) {
        await PitchImage.setPrimary(id);
      }

      await syncPitchImagesToPitchJson(pitch_id);

      res.status(201).json({
        success: true,
        message: "Thêm ảnh bằng link thành công",
        data: { id, image_url: normalizedUrl },
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
      const filters = {
        pitch_id: req.query.pitch_id,
      };
      const images = await PitchImage.getAll(filters);
      res.json({ success: true, data: images });
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

      // If pitch has no images yet, make this primary
      const existing = await PitchImage.getByPitchId(pitch_id);
      const isPrimary = existing.length === 0;

      const id = await PitchImage.create({
        pitch_id,
        image_url: imageUrl,
        is_primary: isPrimary ? 1 : 0,
        sort_order: existing.length,
      });

      await syncPitchImagesToPitchJson(pitch_id);

      res.status(201).json({
        success: true,
        message: "Upload ảnh thành công",
        data: { id, image_url: imageUrl },
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
      const image = await PitchImage.getById(id);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh",
        });
      }
      const ok = await PitchImage.setPrimary(id);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh",
        });
      }

      await syncPitchImagesToPitchJson(image.pitch_id);
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

      const image = await PitchImage.getById(id);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh hoặc không có dữ liệu cập nhật",
        });
      }

      const ok = await PitchImage.update(id, { sort_order });
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh hoặc không có dữ liệu cập nhật",
        });
      }

      await syncPitchImagesToPitchJson(image.pitch_id);

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
      const image = await PitchImage.getById(id);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy ảnh",
        });
      }

      const ok = await PitchImage.delete(id);
      if (!ok) {
        return res.status(500).json({
          success: false,
          message: "Không thể xóa ảnh",
        });
      }

      // If deleted primary, promote first remaining as primary
      if (image.is_primary) {
        const remaining = await PitchImage.getByPitchId(image.pitch_id);
        if (remaining.length > 0) {
          await PitchImage.setPrimary(remaining[0].id);
        }
      }

      await syncPitchImagesToPitchJson(image.pitch_id);

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
