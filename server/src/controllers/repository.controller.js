import { repositoryService } from "../services/repository.service.js";
import logger from "../utils/logger.js";

/**
 * GET /api/repositories/github
 * Fetch all GitHub repos for the authenticated user.
 * Also marks which ones have already been imported to Repolyx.
 */
export const fetchAvailableRepositories = async (req, res, next) => {
  try {
    if (!req.user || !req.user.githubAccessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub access token not found. Please reconnect your GitHub account.",
      });
    }

    const [githubRepos, importedRepos] = await Promise.all([
      repositoryService.fetchGithubRepositories(req.user.githubAccessToken),
      repositoryService.getImportedRepositories(req.user.id),
    ]);

    const importedGithubIds = new Set(importedRepos.map((r) => r.githubRepoId));

    // Mark which GitHub repos are already imported
    const annotatedRepos = githubRepos.map((r) => ({
      ...r,
      isImported: importedGithubIds.has(r.id),
    }));

    res.json({
      success: true,
      repositories: annotatedRepos,
      importedRepositories: importedRepos,
    });
  } catch (error) {
    logger.error("Error in fetchAvailableRepositories:", error);
    next(error);
  }
};

/**
 * GET /api/repositories/imported
 * Return only the repositories that the user has imported to Repolyx from the database.
 */
export const getImportedRepositories = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const repos = await repositoryService.getImportedRepositories(req.user.id);
    res.json({ success: true, repositories: repos });
  } catch (error) {
    logger.error("Error in getImportedRepositories:", error);
    next(error);
  }
};

/**
 * POST /api/repositories/import
 * Save a GitHub repository to the Repolyx database.
 */
export const importRepository = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { repoData } = req.body;

    if (!repoData || !repoData.id) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body. Expected { repoData: { id, name, ... } }",
      });
    }

    const savedRepo = await repositoryService.importRepository(req.user.id, repoData);
    res.json({ success: true, repository: savedRepo });
  } catch (error) {
    logger.error("Error in importRepository:", error);
    next(error);
  }
};
