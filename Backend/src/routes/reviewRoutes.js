import { Router } from "express";
import { createReview, getReviewsByProduct, getFeaturedReviews } from "../controllers/reviewController.js";

const router = Router();

router.post("/", createReview);
router.get("/featured", getFeaturedReviews);
router.get("/:product_id", getReviewsByProduct);

export default router;
