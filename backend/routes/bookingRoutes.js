import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  addBooking,
  fetchMyBookings,
  fetchGuideOwnBookings,
  fetchUserBookings,
  fetchGuideBookings
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/add", authMiddleware, requireRole("user"), addBooking);
router.get("/my", authMiddleware, requireRole("user"), fetchMyBookings);
router.get("/guide/my", authMiddleware, requireRole("guide"), fetchGuideOwnBookings);

router.get("/user/:userId", authMiddleware, requireRole("admin"), fetchUserBookings);
router.get("/guide/:guideId", authMiddleware, requireRole("admin"), fetchGuideBookings);

export default router;