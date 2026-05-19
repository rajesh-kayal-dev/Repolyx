import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

export const eventService = {
  async createEvent(repositoryId, type, message, metadata = null) {
    try {
      const event = await prisma.repositoryEvent.create({
        data: {
          repositoryId,
          type,
          message,
          metadata,
        },
      });

      logger.info(`Event created for repository ${repositoryId}: ${type} - ${message}`);
      return event;
    } catch (error) {
      logger.error("Error creating repository event:", error);
      throw error;
    }
  },

  async getEvents(repositoryId, limit = 20, offset = 0) {
    try {
      return await prisma.repositoryEvent.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      logger.error("Error fetching repository events:", error);
      throw error;
    }
  },

  async getEventTypes() {
    return [
      { type: "imported", label: "Imported", icon: "download" },
      { type: "indexed", label: "Indexed", icon: "scan" },
      { type: "analyzed", label: "Analyzed", icon: "search" },
      { type: "dependencies_scanned", label: "Dependencies Scanned", icon: "package" },
      { type: "auth_analyzed", label: "Auth Flow Analyzed", icon: "shield" },
      { type: "api_analyzed", label: "API Routes Analyzed", icon: "api" },
      { type: "docs_generated", label: "Documentation Generated", icon: "file-text" },
      { type: "summary_generated", label: "AI Summary Generated", icon: "sparkles" },
    ];
  },
};
