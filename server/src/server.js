import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Triggering nodemon restart with updated Apify achievements scraper at 2026-05-22 v3