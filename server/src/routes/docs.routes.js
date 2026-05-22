import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { getRepositoryDocs, generateRepositoryDocs } from "../controllers/docs.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/:repositoryId", getRepositoryDocs);
router.post("/:repositoryId/generate", generateRepositoryDocs);

export default router;
