import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { addReview, fetchReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/add", authMiddleware, requireRole("user"), addReview);
router.get("/:guideId", fetchReviews);

export default router;