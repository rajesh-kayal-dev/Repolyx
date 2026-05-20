import prisma from "../../../database/prisma.js";
import logger from "../../../utils/logger.js";

export const chatMemory = {
  async createSession(userId, repositoryId, title = "New AI Conversation") {
    try {
      return await prisma.chatSession.create({
        data: { userId, repositoryId, title },
      });
    } catch (error) {
      logger.error("Error creating ChatSession:", error);
      throw error;
    }
  },

  async listSessions(userId, repositoryId) {
    try {
      return await prisma.chatSession.findMany({
        where: { userId, repositoryId },
        orderBy: { updatedAt: "desc" },
      });
    } catch (error) {
      logger.error("Error listing ChatSessions:", error);
      throw error;
    }
  },

  async getSession(sessionId, userId) {
    try {
      return await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });
    } catch (error) {
      logger.error("Error getting ChatSession:", error);
      throw error;
    }
  },

  async deleteSession(sessionId, userId) {
    try {
      await prisma.chatMessage.deleteMany({
        where: { sessionId, session: { userId } },
      });
      await prisma.chatSession.deleteMany({
        where: { id: sessionId, userId },
      });
      return true;
    } catch (error) {
      logger.error("Error deleting ChatSession:", error);
      throw error;
    }
  },

  async saveUserMessage(sessionId, content) {
    try {
      return await prisma.chatMessage.create({
        data: { sessionId, role: "user", content },
      });
    } catch (error) {
      logger.error("Error saving user message:", error);
      throw error;
    }
  },

  async saveAiMessage(sessionId, content, provider, model) {
    try {
      return await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "assistant",
          content,
          provider: provider || "freemodel",
          model: model || "claude-sonnet-4-6",
        },
      });
    } catch (error) {
      logger.error("Error saving AI message:", error);
      throw error;
    }
  },

  async getMessageHistory(sessionId, limit = 12) {
    try {
      return await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        take: limit,
      });
    } catch (error) {
      logger.error("Error getting message history:", error);
      throw error;
    }
  },

  async updateSessionTitle(sessionId, title) {
    try {
      return await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title, updatedAt: new Date() },
      });
    } catch (error) {
      logger.error("Error updating session title:", error);
      throw error;
    }
  },

  async updateSessionTimestamp(sessionId) {
    try {
      return await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      logger.error("Error updating session timestamp:", error);
      throw error;
    }
  },
};
