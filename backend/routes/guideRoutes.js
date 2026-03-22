import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  updatePortfolio,
  getPortfolio,
  earningsDashboard,
  guideBookings
} from "../controllers/guideController.js";

const router = express.Router();

router.post("/portfolio", authMiddleware, requireRole("guide"), updatePortfolio);
router.get("/portfolio/:guideId", getPortfolio);
router.get("/earnings/my", authMiddleware, requireRole("guide"), earningsDashboard);
router.get("/bookings/my", authMiddleware, requireRole("guide"), guideBookings);

export default router;