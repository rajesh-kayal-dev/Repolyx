import logger from "../utils/logger.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - Error caught by handler:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || err.statusText || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { details: err.errors }),
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
