import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { getActivityFeed } from "../controllers/activity.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/", getActivityFeed);

export default router;
