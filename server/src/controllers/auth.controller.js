import logger from "../utils/logger.js";
import { env } from "../config/env.js";

export const githubCallback = (req, res) => {
  logger.info(`User ${req.user.username} logged in successfully via GitHub.`);
  
  // Redirect to the frontend application dashboard or home page
  res.redirect(`${env.FRONTEND_URL}/dashboard`);
};

export const logout = (req, res, next) => {
  const username = req.user?.username;
  
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    
    logger.info(`User ${username} logged out.`);
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
};

export const getCurrentUser = (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }
};
