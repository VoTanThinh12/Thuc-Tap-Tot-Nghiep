const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const pitchRoutes = require("./routes/pitchRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const timeslotsRoutes = require("./routes/timeslotsRoutes");
const pitchImageRoutes = require("./routes/pitchImageRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const bootstrapSchema = require("./utils/schemaBootstrap");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh (ảnh uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/pitches", pitchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/pitch-images", pitchImageRoutes);
app.use("/api/admin", adminRoutes);

// Đăng ký route
app.use("/api/timeslots", timeslotsRoutes);

// Route test
app.get("/", (req, res) => {
  res.json({
    message: "API Mini Football Booking System",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      pitches: "/api/pitches",
      bookings: "/api/bookings",
      services: "/api/services",
      payments: "/api/payments",
      reviews: "/api/reviews",
      admin: "/api/admin",
    },
  });
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: "Route không tồn tại" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  bootstrapSchema();
});
