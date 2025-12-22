const express = require("express");
const router = express.Router();

const { authenticate, authorizeAdmin } = require("../middleware/auth");
const {
  PitchImageController,
  upload,
} = require("../controllers/pitchImageController");

// Public
router.get("/pitch/:pitch_id", PitchImageController.getByPitch);

// Admin
router.get(
  "/admin/all",
  authenticate,
  authorizeAdmin,
  PitchImageController.getAll
);
router.post(
  "/admin/upload",
  authenticate,
  authorizeAdmin,
  upload.single("image"),
  PitchImageController.uploadImage
);
router.put(
  "/admin/:id/primary",
  authenticate,
  authorizeAdmin,
  PitchImageController.setPrimary
);
router.put(
  "/admin/:id",
  authenticate,
  authorizeAdmin,
  PitchImageController.update
);
router.delete(
  "/admin/:id",
  authenticate,
  authorizeAdmin,
  PitchImageController.delete
);

module.exports = router;
