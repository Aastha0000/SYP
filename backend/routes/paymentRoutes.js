import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  initiateEsewaPayment,
  esewaSuccess,
  esewaFailure,
  getPaymentByBooking
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/esewa/initiate",
  authMiddleware,
  requireRole("user"),
  initiateEsewaPayment
);

router.get("/esewa/success", esewaSuccess);
router.get("/esewa/failure", esewaFailure);

router.get(
  "/booking/:bookingId",
  authMiddleware,
  getPaymentByBooking
);

export default router;