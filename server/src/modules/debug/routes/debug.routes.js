import { Router } from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import {
  getRepositories,
  scanRepository,
  listIncidents,
  getIncident,
  createIncident,
  analyzeIncident,
  askQuestion,
  updateIncidentStatus,
  deleteIncident,
  getLogs,
  addLog,
  createGitHubIssue,
} from "../controllers/debug.controller.js";

const router = Router();

router.use(isAuthenticated);

// ─── Repositories & Scanning ─────────────────────────────────────────────────
router.get("/repositories", getRepositories);
router.post("/scan/:id", scanRepository);

// ─── Incidents ───────────────────────────────────────────────────────────────
router.get("/incidents", listIncidents);
router.post("/incidents", createIncident);
router.get("/incidents/:id", getIncident);
router.patch("/incidents/:id/status", updateIncidentStatus);
router.delete("/incidents/:id", deleteIncident);

// ─── AI Actions ──────────────────────────────────────────────────────────────
router.post("/incidents/:id/analyze", analyzeIncident);
router.post("/incidents/:id/ask", askQuestion);

// ─── GitHub Integration ───────────────────────────────────────────────────────
router.post("/incidents/:id/github-issue", createGitHubIssue);

// ─── Logs ────────────────────────────────────────────────────────────────────
router.get("/logs", getLogs);
router.post("/logs", addLog);

export default router;
