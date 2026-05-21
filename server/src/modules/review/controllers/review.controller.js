import { reviewService } from "../services/review.service.js";
import { createReviewSchema, getReviewSchema, deleteReviewSchema } from "../validators/index.js";
import logger from "../../../utils/logger.js";

export const listPrs = async (req, res, next) => {
  try {
    const { repositoryId } = req.params;
    if (!repositoryId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const userId = req.user.id;
    const prs = await reviewService.listPrs(userId, repositoryId);

    res.json({ success: true, prs });
  } catch (error) {
    logger.error("Error in listPrs controller:", error);
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { repositoryId, prUrl, diffContent, title } = createReviewSchema.parse(req.body);
    const userId = req.user.id;

    const session = await reviewService.create(userId, repositoryId, { prUrl, diffContent, title });

    res.status(201).json({ success: true, session });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message })),
      });
    }
    logger.error("Error in createReview controller:", error);
    next(error);
  }
};

export const listReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = await reviewService.list(userId);

    res.json({ success: true, sessions });
  } catch (error) {
    logger.error("Error in listReviews controller:", error);
    next(error);
  }
};

export const getReview = async (req, res, next) => {
  try {
    const { id } = getReviewSchema.parse(req.params);
    const userId = req.user.id;

    const session = await reviewService.get(id, userId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Review session not found" });
    }

    res.json({ success: true, session, files: session.files, suggestions: session.suggestions });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message })),
      });
    }
    logger.error("Error in getReview controller:", error);
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = deleteReviewSchema.parse(req.params);
    const userId = req.user.id;

    await reviewService.delete(id, userId);

    res.json({ success: true, message: "Review session deleted successfully" });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message })),
      });
    }
    logger.error("Error in deleteReview controller:", error);
    next(error);
  }
};

export const analyzeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Review id is required" });
    }

    const { provider, model } = req.body || {};
    const userId = req.user.id;

    const session = await reviewService.analyze(id, userId, { provider, model });

    res.json({
      success: true,
      session,
      files: session.files,
      suggestions: session.suggestions,
    });
  } catch (error) {
    logger.error("Error in analyzeReview controller:", error);
    next(error);
  }
};
