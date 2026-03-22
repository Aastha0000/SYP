import crypto from "crypto";
import axios from "axios";
import { getBookingById, updateBookingPaymentStatus } from "../models/bookingModel.js";
import {
  createPaymentRecord,
  getPaymentByBookingId,
  updatePaymentStatus
} from "../models/paymentModel.js";

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_FORM_URL = process.env.ESEWA_FORM_URL;
const ESEWA_STATUS_URL = process.env.ESEWA_STATUS_URL;
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL;
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL;

const signEsewa = ({ total_amount, transaction_uuid, product_code }) => {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
};

const verifyEsewaResponseSignature = (payload) => {
  const signedFieldNames = payload.signed_field_names.split(",");
  const message = signedFieldNames
    .map((field) => `${field}=${payload[field]}`)
    .join(",");

  const expected = crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

  return expected === payload.signature;
};

// 1. Start eSewa payment
export const initiateEsewaPayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user.id;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: "bookingId and amount are required" });
    }

    const booking = await getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({ message: "You cannot pay for this booking" });
    }

    const transactionUuid = `BOOK-${bookingId}-${Date.now()}`;
    const taxAmount = 0;
    const serviceCharge = 0;
    const deliveryCharge = 0;
    const totalAmount = Number(amount) + taxAmount + serviceCharge + deliveryCharge;

    await createPaymentRecord(
      bookingId,
      booking.user_id,
      booking.guide_id,
      amount,
      transactionUuid
    );

    const signature = signEsewa({
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE
    });

    return res.status(200).json({
      message: "eSewa form data generated",
      paymentUrl: ESEWA_FORM_URL,
      formData: {
        amount: String(amount),
        tax_amount: String(taxAmount),
        total_amount: String(totalAmount),
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: String(serviceCharge),
        product_delivery_charge: String(deliveryCharge),
        success_url: ESEWA_SUCCESS_URL,
        failure_url: ESEWA_FAILURE_URL,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. Success callback from eSewa
export const esewaSuccess = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).send("Missing eSewa response data");
    }

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    const isValidSignature = verifyEsewaResponseSignature(decoded);

    if (!isValidSignature) {
      return res.status(400).send("Invalid eSewa signature");
    }

    const statusResponse = await axios.get(ESEWA_STATUS_URL, {
      params: {
        product_code: decoded.product_code,
        total_amount: decoded.total_amount,
        transaction_uuid: decoded.transaction_uuid
      }
    });

    const verifiedStatus = statusResponse.data?.status;

    if (verifiedStatus !== "COMPLETE") {
      return res.status(400).send(`Payment not complete. Status: ${verifiedStatus}`);
    }

    // Extract bookingId from BOOK-<bookingId>-<timestamp>
    const parts = decoded.transaction_uuid.split("-");
    const bookingId = Number(parts[1]);

    await updatePaymentStatus(bookingId, "paid");
    await updateBookingPaymentStatus(bookingId, "paid");

    return res.send("Payment verified and marked as paid successfully.");
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// 3. Failure callback from eSewa
export const esewaFailure = async (req, res) => {
  try {
    return res.status(200).send("Payment failed or was cancelled.");
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// 4. Get payment by booking
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const payment = await getPaymentByBookingId(bookingId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};