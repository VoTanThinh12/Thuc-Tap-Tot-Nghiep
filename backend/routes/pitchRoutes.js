const express = require('express');
const router = express.Router();
const pitchController = require('../controllers/pitchController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', pitchController.getAllPitches);
router.get('/search', pitchController.searchPitches);
router.get('/:id', pitchController.getPitchById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, pitchController.createPitch);
router.put('/:id', authenticate, authorizeAdmin, pitchController.updatePitch);
router.delete('/:id', authenticate, authorizeAdmin, pitchController.deletePitch);

module.exports = router;