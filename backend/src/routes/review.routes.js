import express from "express";
import { createReview, deleteReview, getAllReviews, getRatingSummary, getUserAverageRating, getUserReviews, toggleReviewReaction } from "../controllers/review.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/:gameId", protectRoute, createReview);
router.get("/:gameId", getAllReviews);
router.delete("/:reviewId", protectRoute, deleteReview);
router.get('/:gameId/summary',protectRoute,getRatingSummary);
router.get('/user/average', protectRoute, getUserAverageRating);
router.get('/user/reviews', protectRoute, getUserReviews);
router.post("/:reviewId/:action", protectRoute, toggleReviewReaction);


export default router;
