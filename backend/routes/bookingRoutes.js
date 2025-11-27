const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Admin routes
router.get('/all', authenticate, authorizeAdmin, bookingController.getAllBookings);
router.put('/:id/status', authenticate, authorizeAdmin, bookingController.updateBookingStatus);

module.exports = router;