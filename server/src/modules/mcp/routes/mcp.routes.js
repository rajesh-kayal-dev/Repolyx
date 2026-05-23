import { Router } from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import {
  getWorkspaceStatus,
  getProjectInfo,
  getHealthChecks,
  getPrePushValidation,
  runValidation,
} from "../controllers/mcp.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/workspace", getWorkspaceStatus);
router.get("/project", getProjectInfo);
router.get("/health", getHealthChecks);
router.get("/validation", getPrePushValidation);
router.post("/validation/run", runValidation);

export default router;
