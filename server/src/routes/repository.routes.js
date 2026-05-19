import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  fetchAvailableRepositories,
  getImportedRepositories,
  importRepository,
  importAndScanRepository,
  getRepositoryById,
  scanRepository,
  getFileTree,
  getFileContent,
  generateSummary,
  runAnalysis,
  getEvents,
  queryRepository,
  getAnalyses,
} from "../controllers/repository.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/github", fetchAvailableRepositories);
router.get("/imported", getImportedRepositories);
router.post("/import", importRepository);
router.post("/import-and-scan", importAndScanRepository);

router.get("/:id", getRepositoryById);
router.post("/:id/scan", scanRepository);
router.get("/:id/tree", getFileTree);
router.get("/:id/files/:fileId", getFileContent);
router.post("/:id/summary", generateSummary);
router.post("/:id/analyze", runAnalysis);
router.get("/:id/events", getEvents);
router.post("/:id/query", queryRepository);
router.get("/:id/analyses", getAnalyses);

export default router;
