import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  getGithubIntegration,
  disconnectGithub,
  getAppearance,
  updateAppearance,
  getNotifications,
  updateNotifications,
  getAIPreferences,
  updateAIPreferences,
  getSecurity,
  deleteSession,
  deleteAllOtherSessions,
  listAccessTokens,
  createAccessToken,
  revokeAccessToken,
  deleteAccessToken,
} from "../controllers/settings.controller.js";

const router = Router();

// Apply auth middleware to all settings routes
router.use(isAuthenticated);

// Profile
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// GitHub Integration
router.get("/github", getGithubIntegration);
router.delete("/github", disconnectGithub);

// Appearance
router.get("/appearance", getAppearance);
router.patch("/appearance", updateAppearance);

// Notifications
router.get("/notifications", getNotifications);
router.patch("/notifications", updateNotifications);

// AI Preferences
router.get("/ai-preferences", getAIPreferences);
router.patch("/ai-preferences", updateAIPreferences);

// Security - Sessions
router.get("/security", getSecurity);
router.delete("/sessions", deleteAllOtherSessions);
router.delete("/sessions/:id", deleteSession);

// Security - Access Tokens
router.get("/access-tokens", listAccessTokens);
router.post("/access-tokens", createAccessToken);
router.patch("/access-tokens/:id/revoke", revokeAccessToken);
router.delete("/access-tokens/:id", deleteAccessToken);

export default router;
