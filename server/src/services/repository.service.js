import { Octokit } from "@octokit/rest";
import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

export const repositoryService = {
  /**
   * Fetch repositories for the authenticated GitHub user.
   */
  async fetchGithubRepositories(githubAccessToken) {
    if (!githubAccessToken) {
      throw new Error("Missing GitHub Access Token");
    }

    try {
      const octokit = new Octokit({ auth: githubAccessToken });
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: "all",
        sort: "updated",
        per_page: 50,
      });

      return data.map((repo) => ({
        id: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        visibility: repo.private ? "Private" : "Public",
        defaultBranch: repo.default_branch,
        language: repo.language || "Unknown",
        description: repo.description,
        cloneUrl: repo.clone_url,
        lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
        stack: repo.language ? `${repo.language} App` : "Application",
      }));
    } catch (error) {
      logger.error("Error fetching github repositories:", error);
      throw error;
    }
  },

  /**
   * Import a repository by saving it to the database
   */
  async importRepository(userId, repoData) {
    try {
      const existingRepo = await prisma.repository.findUnique({
        where: { githubRepoId: repoData.id },
      });

      if (existingRepo) {
        return existingRepo;
      }

      const importedRepo = await prisma.repository.create({
        data: {
          userId,
          githubRepoId: repoData.id,
          name: repoData.name,
          fullName: repoData.fullName,
          visibility: repoData.visibility,
          defaultBranch: repoData.defaultBranch,
          language: repoData.language,
          description: repoData.description,
          cloneUrl: repoData.cloneUrl,
          isIndexed: false,
        },
      });

      return importedRepo;
    } catch (error) {
      logger.error(`Error importing repository ${repoData.name}:`, error);
      throw error;
    }
  },

  /**
   * Get imported repositories for a user
   */
  async getImportedRepositories(userId) {
    try {
      return await prisma.repository.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
    } catch (error) {
      logger.error(`Error fetching imported repositories for user ${userId}:`, error);
      throw error;
    }
  }
};
