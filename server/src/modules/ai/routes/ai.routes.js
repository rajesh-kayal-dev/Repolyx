import { Router } from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import {
  createSession,
  listSessions,
  getSession,
  deleteSession,
  chat,
  getPrompts,
} from "../controllers/ai.controller.js";

const router = Router();

router.use(isAuthenticated);

router.post("/sessions", createSession);
router.get("/sessions/repository/:repositoryId", listSessions);
router.get("/sessions/:id", getSession);
router.delete("/sessions/:id", deleteSession);
router.post("/chat", chat);
router.get("/prompts/:repositoryId", getPrompts);

export default router;
