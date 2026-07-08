import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

/**
 * Service handling database operations for User model
 */
export const userService = {
  /**
   * Find a user by their GitHub ID, or create a new user if not found.
   * @param {Object} profile - GitHub profile object from Passport
   * @param {string} accessToken - GitHub OAuth Access Token
   * @returns {Promise<Object>} The User record
   */
  async findOrCreateGitHubUser(profile, accessToken) {
    try {
      let user = await prisma.user.findUnique({
        where: {
          githubId: profile.id,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            githubId: profile.id,
            username: profile.username || "",
            avatarUrl: profile.photos?.[0]?.value || null,
            email: profile.emails?.[0]?.value || null,
            githubAccessToken: accessToken,
            workspace: {
              create: {
                name: `${profile.username || "My"}'s Workspace`
              }
            },
            appearance: { create: {} },
            notifications: { create: {} },
            aiPreference: { create: {} },
            githubIntegration: {
              create: {
                githubUsername: profile.username || "",
                avatarUrl: profile.photos?.[0]?.value || null,
              }
            }
          },
        });
        logger.info(`Created new user record for GitHub ID: ${profile.id}`);
      } else {
        // Update the access token and github integration if it changed
        const updateData = {};
        if (accessToken && user.githubAccessToken !== accessToken) {
          updateData.githubAccessToken = accessToken;
          updateData.githubIntegration = {
            upsert: {
              create: {
                githubUsername: profile.username || "",
                avatarUrl: profile.photos?.[0]?.value || null,
              },
              update: {
                githubUsername: profile.username || "",
                avatarUrl: profile.photos?.[0]?.value || null,
                lastSyncAt: new Date(),
              }
            }
          };
        }
        
        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      }

      return user;
    } catch (error) {
      logger.error(`Error in userService.findOrCreateGitHubUser for ID ${profile.id}:`, error);
      throw error;
    }
  },

  /**
   * Find a user by their unique database ID.
   * @param {string} id - Database user ID
   * @returns {Promise<Object|null>} The User record, or null
   */
  async getUserById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error in userService.getUserById for ID ${id}:`, error);
      throw error;
    }
  },
};
