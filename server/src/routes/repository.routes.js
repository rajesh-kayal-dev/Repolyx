import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  fetchAvailableRepositories,
  getImportedRepositories,
  importRepository,
} from "../controllers/repository.controller.js";

const router = Router();

// All repository routes require the user to be logged in
router.use(isAuthenticated);

// GET /api/repositories/github — fetch GitHub repos + mark which are imported
router.get("/github", fetchAvailableRepositories);

// GET /api/repositories/imported — fetch only repos saved to our database
router.get("/imported", getImportedRepositories);

// POST /api/repositories/import — save a repo to the database
router.post("/import", importRepository);

export default router;
