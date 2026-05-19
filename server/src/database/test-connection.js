import prisma from "./prisma.js";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

async function main() {
  logger.info("Validated env.DATABASE_URL:", env.DATABASE_URL);
  logger.info("Process env.DATABASE_URL:", process.env.DATABASE_URL);
  try {
    logger.info("Attempting to query database...");
    const usersCount = await prisma.user.count();
    logger.info(`Connection successful! Total users in database: ${usersCount}`);
  } catch (error) {
    logger.error("Failed to query database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
