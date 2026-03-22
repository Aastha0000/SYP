import { createReview, getReviewsByGuide } from "../models/reviewModel.js";

export const addReview = async (req, res) => {
  try {
    const { guideId, rating, feedback } = req.body;
    const userId = req.user.id;

    if (!guideId || !rating) {
      return res.status(400).json({ message: "guideId and rating are required" });
    }

    await createReview(userId, guideId, rating, feedback || "");

    res.status(201).json({
      message: "Review submitted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchReviews = async (req, res) => {
  try {
    const { guideId } = req.params;
    const reviews = await getReviewsByGuide(guideId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};