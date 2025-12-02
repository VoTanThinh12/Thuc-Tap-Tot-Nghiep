const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');

// Import controllers
const adminAuthController = require('../controllers/adminAuthController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminFieldController = require('../controllers/adminFieldController');
const adminBookingController = require('../controllers/adminBookingController');
const adminCustomerController = require('../controllers/adminCustomerController');
const adminServiceController = require('../controllers/adminServiceController');
const adminReportController = require('../controllers/adminReportController');

// Multer config cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ============ AUTHENTICATION ROUTES ============
router.post('/auth/login', adminAuthController.adminLogin);
router.get('/auth/profile', adminAuth, adminAuthController.getAdminProfile);
router.put('/auth/change-password', adminAuth, adminAuthController.changePassword);

// ============ DASHBOARD ROUTES ============
router.get('/dashboard/stats', adminAuth, adminDashboardController.getDashboardStats);
router.get('/dashboard/revenue-chart', adminAuth, adminDashboardController.getRevenueChart);

// ============ FIELD MANAGEMENT ROUTES ============
router.get('/fields', adminAuth, adminFieldController.getAllFields);
router.post('/fields', adminAuth, upload.single('image'), adminFieldController.createField);
router.put('/fields/:id', adminAuth, upload.single('image'), adminFieldController.updateField);
router.delete('/fields/:id', adminAuth, adminFieldController.deleteField);

// ============ BOOKING MANAGEMENT ROUTES ============
router.get('/bookings', adminAuth, adminBookingController.getAllBookings);
router.get('/bookings/stats', adminAuth, adminBookingController.getBookingStats);
router.put('/bookings/:id/status', adminAuth, adminBookingController.updateBookingStatus);
router.delete('/bookings/:id', adminAuth, adminBookingController.deleteBooking);

// ============ CUSTOMER MANAGEMENT ROUTES ============
router.get('/customers', adminAuth, adminCustomerController.getAllCustomers);
router.get('/customers/stats', adminAuth, adminCustomerController.getCustomerStats);
router.get('/customers/:id', adminAuth, adminCustomerController.getCustomerDetail);

// ============ SERVICE MANAGEMENT ROUTES ============
router.get('/services', adminAuth, adminServiceController.getAllServices);
router.post('/services', adminAuth, adminServiceController.createService);
router.put('/services/:id', adminAuth, adminServiceController.updateService);
router.delete('/services/:id', adminAuth, adminServiceController.deleteService);

// ============ REPORT ROUTES ============
router.get('/reports/revenue-by-field', adminAuth, adminReportController.getRevenueByField);
router.get('/reports/monthly-stats', adminAuth, adminReportController.getMonthlyStats);
router.get('/reports/top-customers', adminAuth, adminReportController.getTopCustomers);

module.exports = router;