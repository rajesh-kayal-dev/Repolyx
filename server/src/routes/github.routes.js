import { Router } from 'express';
import { githubController } from '../controllers/github.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

// All github workspace routes require authentication
router.use(isAuthenticated);

router.post('/connect', githubController.connect);
router.get('/status', githubController.status);
router.delete('/disconnect', githubController.disconnect);
router.post('/chat', githubController.chat);

export default router;
