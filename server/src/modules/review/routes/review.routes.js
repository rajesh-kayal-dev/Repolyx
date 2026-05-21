import { Router } from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import {
  listPrs,
  createReview,
  listReviews,
  getReview,
  deleteReview,
  analyzeReview,
} from "../controllers/review.controller.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", createReview);
router.get("/", listReviews);
router.get("/prs/:repositoryId", listPrs);
router.get("/:id", getReview);
router.delete("/:id", deleteReview);
router.post("/:id/analyze", analyzeReview);

export default router;
