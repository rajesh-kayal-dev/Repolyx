import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getDashboardStats,
  getDashboardSessions,
  getRepoHealth,
  getDashboardActions,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/stats", getDashboardStats);
router.get("/sessions", getDashboardSessions);
router.get("/repos", getRepoHealth);
router.get("/actions", getDashboardActions);

export default router;
