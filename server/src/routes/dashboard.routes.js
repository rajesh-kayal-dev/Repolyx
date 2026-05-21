import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getDashboardStats,
  getDashboardSessions,
  getRepoHealth,
  getDashboardActions,
  getGithubProfile,
  getContributions,
  getAchievements,
  getReadme,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/stats", getDashboardStats);
router.get("/sessions", getDashboardSessions);
router.get("/repos", getRepoHealth);
router.get("/actions", getDashboardActions);
router.get("/github-profile", getGithubProfile);
router.get("/contributions", getContributions);
router.get("/achievements", getAchievements);
router.get("/readme", getReadme);

export default router;
