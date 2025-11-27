const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, paymentController.createPayment);
router.get('/booking/:booking_id', authenticate, paymentController.getPaymentByBooking);

// Admin routes
router.get('/all', authenticate, authorizeAdmin, paymentController.getAllPayments);
router.put('/:id/status', authenticate, authorizeAdmin, paymentController.updatePaymentStatus);

module.exports = router;