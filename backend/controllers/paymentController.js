const Payment = require('../models/Payment');

// Tạo thanh toán
exports.createPayment = async (req, res) => {
  try {
    const paymentId = await Payment.create(req.body);
    res.status(201).json({ message: 'Tạo thanh toán thành công', paymentId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái thanh toán
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Payment.updateStatus(req.params.id, status);
    res.json({ message: 'Cập nhật trạng thái thanh toán thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thanh toán theo booking
exports.getPaymentByBooking = async (req, res) => {
  try {
    const payments = await Payment.getByBookingId(req.params.booking_id);
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tất cả thanh toán (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.getAll();
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};