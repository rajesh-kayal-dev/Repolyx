import { Router } from "express";
import passport from "passport";
import { getCurrentUser, githubCallback, logout } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.js";
import { env } from "../config/env.js";

const router = Router();

// Start GitHub OAuth process
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user", "user:email", "repo"]
  })
);

// GitHub OAuth callback (no session — JWT-based)
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login`
  }),
  githubCallback
);

// Get current authenticated user profile
router.get("/me", isAuthenticated, getCurrentUser);

// Logout user session
router.post("/logout", isAuthenticated, logout);

export default router;