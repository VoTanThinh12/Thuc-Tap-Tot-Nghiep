const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
// THAY ĐỔI DÒNG NÀY:
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// ===== CLIENT ROUTES =====
router.post("/", authenticate, ReviewController.createReview);
router.get("/pitch/:pitch_id", ReviewController.getReviewsByPitch);
router.get("/my-reviews", authenticate, ReviewController.getMyReviews);
router.put("/:id", authenticate, ReviewController.updateReview);
router.delete("/:id", authenticate, ReviewController.deleteReview);

// ===== ADMIN ROUTES =====
router.get(
  "/admin/all",
  authenticate,
  authorizeAdmin,
  ReviewController.getAllReviews
);
router.get(
  "/admin/stats/overall",
  authenticate,
  authorizeAdmin,
  ReviewController.getOverallStats
);
router.get(
  "/admin/:id",
  authenticate,
  authorizeAdmin,
  ReviewController.getReviewById
);
router.delete(
  "/admin/:id",
  authenticate,
  authorizeAdmin,
  ReviewController.deleteReviewAdmin
);
router.get(
  "/admin/stats/:pitch_id",
  authenticate,
  authorizeAdmin,
  ReviewController.getReviewStats
);

module.exports = router;
