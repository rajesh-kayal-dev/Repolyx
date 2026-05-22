import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { startIndexingWorker } from "./modules/ai/services/indexer.worker.js";

const PORT = env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  
  // Start the background indexing worker
  startIndexingWorker();
});

// Triggering nodemon restart with updated Apify achievements scraper at 2026-05-22 v3