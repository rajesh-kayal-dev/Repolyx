import { githubService } from '../services/github.service.js';
import { githubOrchestrator } from '../services/github-orchestrator.service.js';

export const githubController = {
  async connect(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'GitHub PAT is required' });
      }

      const result = await githubService.connect(req.user.id, token);
      return res.json(result);
    } catch (error) {
      if (error.message === 'Invalid GitHub token') {
        return res.status(401).json({ error: error.message });
      }
      console.error('[githubController.connect] Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async status(req, res) {
    try {
      const status = await githubService.getStatus(req.user.id);
      return res.json(status);
    } catch (error) {
      console.error('[githubController.status] Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async disconnect(req, res) {
    try {
      await githubService.disconnect(req.user.id);
      return res.json({ success: true, message: 'GitHub account disconnected successfully' });
    } catch (error) {
      console.error('[githubController.disconnect] Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async chat(req, res) {
    try {
      const { message, history, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await githubOrchestrator.processMessage(req.user.id, message, context);
      
      return res.json(result);

    } catch (error) {
      console.error('[githubController.chat] Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
