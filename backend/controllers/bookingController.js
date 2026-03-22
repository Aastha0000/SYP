import { createBooking, getUserBookings, getGuideBookings } from "../models/bookingModel.js";

export const addBooking = async (req, res) => {
  try {
    const { guideId, destination, dateFrom, dateTo } = req.body;
    const userId = req.user.id;

    if (!guideId || !destination || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await createBooking(userId, guideId, destination, dateFrom, dateTo);

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchMyBookings = async (req, res) => {
  try {
    const bookings = await getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchGuideOwnBookings = async (req, res) => {
  try {
    const bookings = await getGuideBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchGuideBookings = async (req, res) => {
  try {
    const { guideId } = req.params;
    const bookings = await getGuideBookings(guideId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};