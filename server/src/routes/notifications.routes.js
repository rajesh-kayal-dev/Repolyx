import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/notifications.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/", getNotifications);
router.patch("/:threadId/read", markNotificationRead);
router.patch("/read-all", markAllRead);

export default router;
