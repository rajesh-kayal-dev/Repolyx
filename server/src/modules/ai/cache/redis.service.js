import Redis from "ioredis";
import logger from "../../../utils/logger.js";

let redisClient = null;
let isRedisAvailable = false;

const DEFAULT_TTL = {
  aiResponse: 60 * 60,
  fileContent: 15 * 60,
  rateLimit: 60,
  session: 30 * 60,
};

const PREFIXES = {
  aiResponse: "ai:resp:",
  fileContent: "file:cont:",
  rateLimit: "ratelimit:",
  fileIndex: "file:idx:",
  scanLock: "scan:lock:",
};

function createRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  const isSecure = redisUrl.startsWith("rediss://");

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
      ...(isSecure ? { tls: { rejectUnauthorized: false } } : {}),
    });

    redisClient.on("error", (err) => {
      logger.warn(`Redis: ${err.message}`);
    });

    redisClient.on("ready", () => {
      isRedisAvailable = true;
      logger.info("Redis connection established");
    });

    redisClient.on("close", () => {
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (err) {
    logger.warn(`Redis init failed: ${err.message}`);
    return null;
  }
}

async function ensureConnection() {
  if (isRedisAvailable) return true;
  if (!redisClient) return false;

  try {
    await redisClient.connect();
    return true;
  } catch {
    return false;
  }
}

export const redisCache = {
  async get(key) {
    if (!await ensureConnection()) return null;
    try {
      const raw = await redisClient.get(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      logger.warn(`Redis get error: ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    if (!await ensureConnection()) return false;
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch (err) {
      logger.warn(`Redis set error: ${err.message}`);
      return false;
    }
  },

  async del(key) {
    if (!await ensureConnection()) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch {
      return false;
    }
  },

  async getOrSet(key, fetchFn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null) return cached;

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  },

  async acquireLock(lockKey, ttlSeconds = 30) {
    if (!await ensureConnection()) return null;
    try {
      const result = await redisClient.set(
        lockKey,
        Date.now().toString(),
        "EX",
        ttlSeconds,
        "NX"
      );
      return result === "OK" ? lockKey : null;
    } catch {
      return null;
    }
  },

  async releaseLock(lockKey) {
    await this.del(lockKey);
  },

  buildAiCacheKey(repositoryId, message, mode) {
    const normalized = message.toLowerCase().trim().substring(0, 100);
    return `${PREFIXES.aiResponse}${repositoryId}:${Buffer.from(normalized).toString("base64")}:${mode}`;
  },

  buildFileCacheKey(repositoryId, filePath, branch) {
    return `${PREFIXES.fileContent}${repositoryId}:${Buffer.from(`${filePath}:${branch}`).toString("base64")}`;
  },

  buildScanLockKey(repositoryId) {
    return `${PREFIXES.scanLock}${repositoryId}`;
  },

  isAvailable() {
    return isRedisAvailable;
  },

  async ping() {
    if (!redisClient) return false;
    try {
      const result = await redisClient.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  },

  async incrementRateLimit(key, maxRequests, windowSeconds) {
    if (!await ensureConnection()) return { allowed: true, remaining: maxRequests };
    try {
      const fullKey = `${PREFIXES.rateLimit}${key}`;
      const current = await redisClient.incr(fullKey);
      if (current === 1) {
        await redisClient.expire(fullKey, windowSeconds);
      }
      const ttl = await redisClient.ttl(fullKey);
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetIn: ttl,
      };
    } catch {
      return { allowed: true, remaining: maxRequests };
    }
  },
};

createRedisClient();
