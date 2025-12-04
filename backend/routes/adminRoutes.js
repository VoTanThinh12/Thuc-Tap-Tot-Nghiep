const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

const authController = require("../controllers/adminAuthController");
const dashboardController = require("../controllers/adminDashboardController");
const fieldController = require("../controllers/adminFieldController");
const bookingController = require("../controllers/adminBookingController");
const customerController = require("../controllers/adminCustomerController");
const serviceController = require("../controllers/adminServiceController");
const reportController = require("../controllers/adminReportController");

// === AUTH ROUTES (KHÔNG CẦN ĐĂNG NHẬP) ===
router.post("/auth/login", authController.login);

// === PROTECTED ROUTES (CẦN ĐĂNG NHẬP) ===

// Auth
router.get("/auth/profile", adminAuth, authController.getProfile);
router.put("/auth/profile", adminAuth, authController.updateProfile);
router.post("/auth/change-password", adminAuth, authController.changePassword);

// Dashboard
router.get(
  "/dashboard/stats",
  adminAuth,
  dashboardController.getDashboardStats
);
router.get(
  "/dashboard/revenue-chart",
  adminAuth,
  dashboardController.getRevenueChart
);

// Fields (Sân)
router.get("/fields", adminAuth, fieldController.getAllFields);
router.post("/fields", adminAuth, fieldController.createField);
router.put("/fields/:id", adminAuth, fieldController.updateField);
router.delete("/fields/:id", adminAuth, fieldController.deleteField);

// Bookings
router.get("/bookings", adminAuth, bookingController.getAllBookings);
router.get("/bookings/stats", adminAuth, bookingController.getBookingStats);
router.get("/bookings/:id", adminAuth, bookingController.getBookingDetails);
router.put(
  "/bookings/:id/status",
  adminAuth,
  bookingController.updateBookingStatus
);
router.delete("/bookings/:id", adminAuth, bookingController.deleteBooking);

// Customers
router.get("/customers", adminAuth, customerController.getAllCustomers);
router.get("/customers/stats", adminAuth, customerController.getCustomerStats);
router.get("/customers/:id", adminAuth, customerController.getCustomerById);

// Services
router.get("/services", adminAuth, serviceController.getAllServices);
router.post("/services", adminAuth, serviceController.createService);
router.put("/services/:id", adminAuth, serviceController.updateService);
router.delete("/services/:id", adminAuth, serviceController.deleteService);

// Reports
router.get("/reports/revenue", adminAuth, reportController.getRevenueReport);
router.get("/reports/fields", adminAuth, reportController.getFieldReport);

module.exports = router;
