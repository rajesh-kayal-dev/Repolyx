import logger from "../utils/logger.js";
import { env } from "../config/env.js";
import { signToken } from "../utils/jwt.js";

export const githubCallback = (req, res) => {
  logger.info(`User ${req.user.username} logged in successfully via GitHub.`);

  const frontendUrl = env.FRONTEND_URL.split(",")[0].trim();
  const token = signToken(req.user.id);
  res.redirect(`${frontendUrl}/overview?token=${token}`);
};

export const logout = (req, res) => {
  const username = req.user?.username;
  logger.info(`User ${username} logged out.`);
  res.json({
    success: true,
    message: "Logged out successfully"
  });
};

export const getCurrentUser = (req, res) => {
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
};
