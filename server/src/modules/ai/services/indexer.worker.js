import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import prisma from "../../../database/prisma.js";
import { contextEngine } from "../context/context.engine.js";
import logger from "../../../utils/logger.js";

// Optional redis connection (will gracefully fail if Redis isn't running)
let redisConnection = null;
try {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  const isSecure = redisUrl.startsWith("rediss://");
  
  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    ...(isSecure ? { tls: { rejectUnauthorized: false } } : {}),
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 times to prevent infinite connection loops
      }
      return Math.min(times * 50, 2000);
    }
  });
  
  redisConnection.on('error', (err) => {
    logger.warn(`Redis connection error: ${err.message}`);
  });
} catch (err) {
  logger.warn(`Could not initialize Redis: ${err.message}`);
}

export const indexingQueue = redisConnection ? new Queue("RepositoryIndexing", { connection: redisConnection }) : null;

export const queueRepositoryIndex = async (repositoryId, githubAccessToken, owner, repoName, branch) => {
  if (!indexingQueue) {
    logger.warn("Indexing queue unavailable, running index synchronously...");
    return contextEngine.buildFileIndexAsync(repositoryId, githubAccessToken, owner, repoName, branch);
  }
  logger.info(`Queuing repository ${repositoryId} for background indexing.`);
  await indexingQueue.add("IndexRepository", {
    repositoryId, githubAccessToken, owner, repoName, branch
  });
};

export const startIndexingWorker = () => {
  if (!redisConnection) {
    logger.warn("Redis unavailable, indexing worker not started.");
    return null;
  }

  const worker = new Worker("RepositoryIndexing", async (job) => {
    const { repositoryId, githubAccessToken, owner, repoName, branch } = job.data;
    logger.info(`Processing indexing job for repository ${repositoryId}...`);
    
    try {
      const fileIndex = await contextEngine.buildFileIndexAsync(repositoryId, githubAccessToken, owner, repoName, branch);
      
      // We can also store the dependency graph in Prisma for persistent querying
      await prisma.repositoryAnalysis.create({
        data: {
          repositoryId,
          type: "dependency_graph",
          summary: `Graph generated with ${fileIndex.files.length} files.`,
          data: fileIndex
        }
      });
      
      logger.info(`Successfully completed indexing job for repository ${repositoryId}.`);
    } catch (err) {
      logger.error(`Indexing job failed for repository ${repositoryId}: ${err.message}`);
      throw err;
    }
  }, { connection: redisConnection });

  worker.on('completed', job => {
    logger.info(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
  });

  return worker;
};
