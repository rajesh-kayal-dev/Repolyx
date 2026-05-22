import { aiService } from "../services/ai.service.js";
import {
  createSessionSchema,
  chatSchema,
  getPromptsSchema,
} from "../validators/index.js";
import logger from "../../../utils/logger.js";

export const createSession = async (req, res, next) => {
  try {
    const { repositoryId, title } = createSessionSchema.parse(req.body);
    const userId = req.user.id;

    const session = await aiService.createSession(userId, repositoryId, title);

    res.status(201).json({ success: true, session });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message })),
      });
    }
    logger.error("Error in createSession controller:", error);
    next(error);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const { repositoryId } = req.params;
    if (!repositoryId) {
      return res.status(400).json({ success: false, message: "repositoryId is required" });
    }

    const userId = req.user.id;
    const sessions = await aiService.listSessions(userId, repositoryId);

    res.json({ success: true, sessions });
  } catch (error) {
    logger.error("Error in listSessions controller:", error);
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Session id is required" });
    }

    const userId = req.user.id;
    const session = await aiService.getSession(id, userId);

    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    res.json({ success: true, session, messages: session.messages });
  } catch (error) {
    logger.error("Error in getSession controller:", error);
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Session id is required" });
    }

    const userId = req.user.id;
    await aiService.deleteSession(id, userId);

    res.json({ success: true, message: "Chat session deleted successfully" });
  } catch (error) {
    logger.error("Error in deleteSession controller:", error);
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { sessionId, message, activeFile, provider, model, mode, contextScope } = chatSchema.parse(req.body);
    const userId = req.user.id;
    const githubAccessToken = req.user.githubAccessToken;

    if (!githubAccessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub token not found. Please connect your GitHub account.",
      });
    }

    const result = await aiService.queryChat(
      sessionId, message, activeFile, userId, githubAccessToken, provider, model, mode, contextScope
    );

    res.json({
      success: true,
      userMessage: result.userMessage,
      aiMessage: result.aiMessage,
      title: result.title,
      analysis: result.analysis,
    });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message })),
      });
    }
    logger.error("Error in chat controller:", error);
    next(error);
  }
};

export const getPrompts = async (req, res, next) => {
  try {
    const { repositoryId } = getPromptsSchema.parse(req.params);

    const prompts = await aiService.generateSuggestedPrompts(repositoryId);
    res.json({ success: true, prompts });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message })),
      });
    }
    logger.error("Error in getPrompts controller:", error);
    next(error);
  }
};
