import { env } from "../config/env.js";

const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
  },
  error: (message, error, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || "", ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
    }
  }
};

export default logger;
