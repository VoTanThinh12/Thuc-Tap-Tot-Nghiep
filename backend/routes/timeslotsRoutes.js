const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET /api/timeslots?pitch_id=1&date=2025-12-25
router.get("/", async (req, res) => {
  try {
    const { pitch_id, date } = req.query;

    if (!pitch_id || !date) {
      return res.status(400).json({
        success: false,
        message: "Thiếu pitch_id hoặc date",
      });
    }

    // Lấy timeslots từ database
    const [timeslots] = await db.query(
      `SELECT id, start_time, end_time, price, is_available
       FROM timeslots
       WHERE pitch_id = ? AND date = ?
       ORDER BY start_time`,
      [pitch_id, date]
    );

    // Nếu chưa có timeslots cho ngày này, tạo mới tự động
    if (timeslots.length === 0) {
      await createTimeslotsForDate(pitch_id, date);

      // Query lại sau khi tạo
      const [newTimeslots] = await db.query(
        `SELECT id, start_time, end_time, price, is_available
         FROM timeslots
         WHERE pitch_id = ? AND date = ?
         ORDER BY start_time`,
        [pitch_id, date]
      );

      return res.json({
        success: true,
        timeslots: newTimeslots,
        message: "Đã tạo khung giờ tự động",
      });
    }

    res.json({
      success: true,
      timeslots: timeslots,
    });
  } catch (error) {
    console.error("❌ Error in GET /api/timeslots:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải khung giờ",
      error: error.message,
    });
  }
});

// Hàm tạo timeslots tự động cho 1 ngày
async function createTimeslotsForDate(pitch_id, date) {
  try {
    // Lấy giá sân
    const [pitch] = await db.query(
      "SELECT price_per_hour FROM pitches WHERE id = ?",
      [pitch_id]
    );

    if (pitch.length === 0) {
      throw new Error("Không tìm thấy sân");
    }

    const basePrice = parseFloat(pitch[0].price_per_hour);
    const slots = [];

    // Tạo slots từ 6h sáng đến 22h tối, mỗi slot 2 tiếng
    for (let hour = 6; hour < 22; hour += 2) {
      const startTime = `${hour.toString().padStart(2, "0")}:00:00`;
      const endTime = `${(hour + 2).toString().padStart(2, "0")}:00:00`;

      // Giờ vàng (17h-22h) tăng giá 20%
      const price = hour >= 17 ? basePrice * 1.2 : basePrice;

      slots.push([pitch_id, date, startTime, endTime, price, 1]);
    }

    // Insert tất cả slots cùng lúc
    await db.query(
      `INSERT INTO timeslots (pitch_id, date, start_time, end_time, price, is_available)
       VALUES ?`,
      [slots]
    );

    console.log(
      `✅ Đã tạo ${slots.length} timeslots cho pitch_id=${pitch_id}, date=${date}`
    );
  } catch (error) {
    console.error("❌ Error creating timeslots:", error);
    throw error;
  }
}

module.exports = router;
