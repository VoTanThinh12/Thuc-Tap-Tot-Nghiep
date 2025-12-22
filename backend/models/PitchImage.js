const db = require("../config/database");

class PitchImage {
  static async getByPitchId(pitch_id) {
    const [rows] = await db.query(
      `SELECT id, pitch_id, image_url, is_primary, sort_order, created_at
       FROM pitch_images
       WHERE pitch_id = ?
       ORDER BY is_primary DESC, sort_order ASC, id ASC`,
      [pitch_id]
    );
    return rows;
  }

  static async getAll(filters = {}) {
    const where = [];
    const params = [];

    if (filters.pitch_id) {
      where.push("pi.pitch_id = ?");
      params.push(filters.pitch_id);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT pi.id, pi.pitch_id, pi.image_url, pi.is_primary, pi.sort_order, pi.created_at,
              p.name as pitch_name, p.location as pitch_location
       FROM pitch_images pi
       JOIN pitches p ON p.id = pi.pitch_id
       ${whereClause}
       ORDER BY pi.pitch_id ASC, pi.is_primary DESC, pi.sort_order ASC, pi.id ASC`,
      params
    );

    return rows;
  }

  static async create({ pitch_id, image_url, is_primary = 0, sort_order = 0 }) {
    const [result] = await db.query(
      `INSERT INTO pitch_images (pitch_id, image_url, is_primary, sort_order)
       VALUES (?, ?, ?, ?)`,
      [pitch_id, image_url, is_primary ? 1 : 0, sort_order]
    );
    return result.insertId;
  }

  static async getById(id) {
    const [rows] = await db.query(
      `SELECT id, pitch_id, image_url, is_primary, sort_order, created_at
       FROM pitch_images
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async setPrimary(id) {
    const image = await PitchImage.getById(id);
    if (!image) return false;

    const pitch_id = image.pitch_id;

    await db.query(
      "UPDATE pitch_images SET is_primary = 0 WHERE pitch_id = ?",
      [pitch_id]
    );

    const [result] = await db.query(
      "UPDATE pitch_images SET is_primary = 1 WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  }

  static async update(id, data = {}) {
    const fields = [];
    const params = [];

    if (data.sort_order !== undefined) {
      fields.push("sort_order = ?");
      params.push(data.sort_order);
    }

    if (fields.length === 0) return false;

    params.push(id);

    const [result] = await db.query(
      `UPDATE pitch_images SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query("DELETE FROM pitch_images WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = PitchImage;
