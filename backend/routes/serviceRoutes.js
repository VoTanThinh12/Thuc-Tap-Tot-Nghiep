const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', serviceController.getAllServices);
router.get('/category/:category', serviceController.getServicesByCategory);

// Admin routes
router.post('/', authenticate, authorizeAdmin, serviceController.createService);
router.put('/:id', authenticate, authorizeAdmin, serviceController.updateService);
router.delete('/:id', authenticate, authorizeAdmin, serviceController.deleteService);

module.exports = router;