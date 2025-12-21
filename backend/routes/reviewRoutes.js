const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ===== CLIENT ROUTES =====
router.post("/", verifyToken, ReviewController.createReview);
router.get("/pitch/:pitch_id", ReviewController.getReviewsByPitch); // Public
router.get("/my-reviews", verifyToken, ReviewController.getMyReviews);
router.put("/:id", verifyToken, ReviewController.updateReview);
router.delete("/:id", verifyToken, ReviewController.deleteReview);

// ===== ADMIN ROUTES =====
router.get("/admin/all", verifyToken, isAdmin, ReviewController.getAllReviews);
router.delete(
  "/admin/:id",
  verifyToken,
  isAdmin,
  ReviewController.deleteReviewAdmin
);
router.get(
  "/admin/stats/:pitch_id",
  verifyToken,
  isAdmin,
  ReviewController.getReviewStats
);

module.exports = router;
