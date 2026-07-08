import logger from "../utils/logger.js";
import { env } from "../config/env.js";
import { signToken } from "../utils/jwt.js";
import prisma from "../database/prisma.js";

export const githubCallback = async (req, res) => {
  logger.info(`User ${req.user.username} logged in successfully via GitHub.`);

  const frontendUrl = env.FRONTEND_URL.split(",")[0].trim();
  const token = signToken(req.user.id);
  
  // Record session
  const userAgent = req.headers['user-agent'] || 'Unknown';
  // simple parser for UI
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Desktop";
  
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) { os = "iOS"; device = "Mobile"; }
  else if (userAgent.includes("Android")) { os = "Android"; device = "Mobile"; }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    await prisma.userSession.create({
      data: {
        userId: req.user.id,
        device,
        browser,
        os,
        ip,
        location: "Auto-detected",
        isCurrent: true,
      }
    });
  } catch(e) {
    logger.error("Failed to track session", e);
  }

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
