const db = require("../config/database");

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT 1 as ok
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function tableExists(tableName) {
  const [rows] = await db.query(
    `SELECT 1 as ok
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
     LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
}

async function indexExists(tableName, indexName) {
  const [rows] = await db.query(
    `SELECT 1 as ok
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );
  return rows.length > 0;
}

async function ensurePitchRatingColumns() {
  const hasAverageRating = await columnExists("pitches", "average_rating");
  const hasTotalReviews = await columnExists("pitches", "total_reviews");

  if (!hasAverageRating) {
    await db.query(
      "ALTER TABLE pitches ADD COLUMN average_rating DECIMAL(3,1) NOT NULL DEFAULT 0 AFTER price_per_hour"
    );
  }

  if (!hasTotalReviews) {
    await db.query(
      "ALTER TABLE pitches ADD COLUMN total_reviews INT NOT NULL DEFAULT 0 AFTER average_rating"
    );
  }
}

async function syncPitchJsonImagesFromPitchImages() {
  const exists = await tableExists("pitch_images");
  if (!exists) return;

  const [rows] = await db.query(
    `SELECT pitch_id, image_url
     FROM pitch_images
     ORDER BY pitch_id ASC, is_primary DESC, sort_order ASC, id ASC`
  );

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.pitch_id)) map.set(row.pitch_id, []);
    map.get(row.pitch_id).push(row.image_url);
  }

  for (const [pitchId, urls] of map.entries()) {
    await db.query("UPDATE pitches SET images = ? WHERE id = ?", [
      JSON.stringify(urls || []),
      pitchId,
    ]);
  }
}

async function ensurePitchImagesTable() {
  const exists = await tableExists("pitch_images");
  if (exists) return;

  await db.query(`
    CREATE TABLE pitch_images (
      id INT(11) NOT NULL AUTO_INCREMENT,
      pitch_id INT(11) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      is_primary TINYINT(1) NOT NULL DEFAULT 0,
      sort_order INT(11) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_pitch_images_pitch_id (pitch_id),
      CONSTRAINT pitch_images_ibfk_1 FOREIGN KEY (pitch_id) REFERENCES pitches (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function ensureReviewsSchema() {
  const exists = await tableExists("reviews");
  if (!exists) return;

  const hasUpdatedAt = await columnExists("reviews", "updated_at");
  if (!hasUpdatedAt) {
    await db.query(
      "ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
    );
  }

  const uniqueIndexName = "uniq_reviews_booking_user";
  const hasUnique = await indexExists("reviews", uniqueIndexName);
  if (!hasUnique) {
    await db.query(
      `ALTER TABLE reviews
       ADD UNIQUE KEY ${uniqueIndexName} (booking_id, user_id)`
    );
  }
}

async function backfillPitchRatingStats() {
  // Only run if columns exist
  const hasAverageRating = await columnExists("pitches", "average_rating");
  const hasTotalReviews = await columnExists("pitches", "total_reviews");
  if (!hasAverageRating || !hasTotalReviews) return;

  await db.query(`
    UPDATE pitches p
    LEFT JOIN (
      SELECT pitch_id,
             COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
             COALESCE(COUNT(*), 0) AS total_reviews
      FROM reviews
      GROUP BY pitch_id
    ) r ON r.pitch_id = p.id
    SET p.average_rating = COALESCE(r.avg_rating, 0),
        p.total_reviews = COALESCE(r.total_reviews, 0)
  `);
}

async function migratePitchImagesFromJson() {
  // If pitch_images doesn't exist, nothing to do
  const exists = await tableExists("pitch_images");
  if (!exists) return;

  const [pitches] = await db.query("SELECT id, images FROM pitches");

  for (const pitch of pitches) {
    const [countRows] = await db.query(
      "SELECT COUNT(*) as cnt FROM pitch_images WHERE pitch_id = ?",
      [pitch.id]
    );
    const existingCount = countRows?.[0]?.cnt || 0;
    if (existingCount > 0) continue;

    let images = [];
    try {
      images = pitch.images ? JSON.parse(pitch.images) : [];
    } catch (e) {
      images = [];
    }

    if (!Array.isArray(images) || images.length === 0) continue;

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      if (!url) continue;
      await db.query(
        "INSERT INTO pitch_images (pitch_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)",
        [pitch.id, url, i === 0 ? 1 : 0, i]
      );
    }
  }
}

async function bootstrapSchema() {
  try {
    await ensurePitchImagesTable();
    await ensurePitchRatingColumns();
    await ensureReviewsSchema();
    await backfillPitchRatingStats();
    await migratePitchImagesFromJson();
    await syncPitchJsonImagesFromPitchImages();
    console.log("✅ Schema bootstrap completed");
  } catch (err) {
    console.error("❌ Schema bootstrap failed:", err.message);
  }
}

module.exports = bootstrapSchema;
