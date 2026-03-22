import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  verifyGuide,
  allUsers,
  allGuides,
  allBookings,
  allPayments
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.post("/verify-guide", verifyGuide);
router.get("/users", allUsers);
router.get("/guides", allGuides);
router.get("/bookings", allBookings);
router.get("/payments", allPayments);

export default router;