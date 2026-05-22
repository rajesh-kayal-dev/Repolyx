import { debugService } from "../services/debug.service.js";
import logger from "../../../utils/logger.js";

export const getRepositories = async (req, res) => {
  try {
    const repos = await debugService.getRepositoriesWithHealth(req.user.id);
    return res.json({ success: true, repositories: repos });
  } catch (err) {
    logger.error("getRepositories error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const scanRepository = async (req, res) => {
  try {
    const result = await debugService.scanRepository(req.params.id, req.user.id);
    return res.json({ success: true, ...result });
  } catch (err) {
    logger.error("scanRepository error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Incidents ───────────────────────────────────────────────────────────────

export const listIncidents = async (req, res) => {
  try {
    const incidents = await debugService.listIncidents(req.user.id);
    return res.json({ success: true, incidents });
  } catch (err) {
    logger.error("listIncidents error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getIncident = async (req, res) => {
  try {
    const incident = await debugService.getIncident(req.params.id, req.user.id);
    return res.json({ success: true, incident });
  } catch (err) {
    logger.error("getIncident error:", err);
    const status = err.message === "Incident not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const createIncident = async (req, res) => {
  try {
    const incident = await debugService.createIncident(req.user.id, req.body);
    return res.status(201).json({ success: true, incident });
  } catch (err) {
    logger.error("createIncident error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const analyzeIncident = async (req, res) => {
  try {
    const incident = await debugService.analyzeIncident(req.params.id, req.user.id);
    return res.json({ success: true, incident });
  } catch (err) {
    logger.error("analyzeIncident error:", err);
    const status = err.message === "Incident not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }
    const result = await debugService.answerQuestion(req.params.id, req.user.id, question);
    return res.json({ success: true, ...result });
  } catch (err) {
    logger.error("askQuestion error:", err);
    const status = err.message === "Incident not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["investigating", "identified", "monitoring", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
    }
    const incident = await debugService.updateStatus(req.params.id, req.user.id, status);
    return res.json({ success: true, incident });
  } catch (err) {
    logger.error("updateIncidentStatus error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    await debugService.deleteIncident(req.params.id, req.user.id);
    return res.json({ success: true, message: "Incident deleted" });
  } catch (err) {
    logger.error("deleteIncident error:", err);
    const status = err.message === "Incident not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ─── Logs ────────────────────────────────────────────────────────────────────

export const getLogs = async (req, res) => {
  try {
    const { level, service, limit, incidentId } = req.query;
    const logs = await debugService.getLogs(req.user.id, { level, service, limit, incidentId });
    return res.json({ success: true, logs });
  } catch (err) {
    logger.error("getLogs error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addLog = async (req, res) => {
  try {
    const log = await debugService.addLog(req.user.id, req.body);
    return res.status(201).json({ success: true, log });
  } catch (err) {
    logger.error("addLog error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GitHub ──────────────────────────────────────────────────────────────────

export const createGitHubIssue = async (req, res) => {
  try {
    const result = await debugService.createGitHubIssue(req.user.id, req.params.id);
    return res.json({ success: true, ...result });
  } catch (err) {
    logger.error("createGitHubIssue error:", err);
    const status = err.message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message: err.message });
  }
};
