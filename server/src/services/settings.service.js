import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";
import crypto from "crypto";

export const settingsService = {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true },
    });
    return {
      displayName: user.displayName || user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      workspaceName: user.workspace?.name || "My Workspace",
    };
  },

  async updateProfile(userId, data) {
    const { displayName, workspaceName } = data;
    await prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });
    
    await prisma.workspace.upsert({
      where: { userId },
      create: { userId, name: workspaceName },
      update: { name: workspaceName },
    });

    await this.createAuditLog(userId, "UPDATE_PROFILE", { displayName, workspaceName });
  },

  async getGithubIntegration(userId) {
    const integration = await prisma.githubIntegration.findUnique({
      where: { userId },
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    return {
      connected: !!user.githubAccessToken,
      githubUsername: integration?.githubUsername || user.username,
      organization: integration?.organization || "N/A",
      avatarUrl: integration?.avatarUrl || user.avatarUrl,
      installationId: integration?.installationId || "N/A",
      connectedAt: integration?.connectedAt || user.createdAt,
      lastSyncAt: integration?.lastSyncAt || user.createdAt,
      repositoryCount: integration?.repositoryCount || 0,
    };
  },

  async disconnectGithub(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { githubAccessToken: null },
    });
    
    try {
      await prisma.githubIntegration.delete({ where: { userId } });
    } catch (e) {
      // Ignore if doesn't exist
    }

    await this.createAuditLog(userId, "DISCONNECT_GITHUB", {});
  },

  async getAppearance(userId) {
    let app = await prisma.appearancePreference.findUnique({ where: { userId } });
    if (!app) {
      app = await prisma.appearancePreference.create({ data: { userId } });
    }
    return app;
  },

  async updateAppearance(userId, data) {
    const app = await prisma.appearancePreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    await this.createAuditLog(userId, "UPDATE_APPEARANCE", data);
    return app;
  },

  async getNotifications(userId) {
    let notif = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!notif) {
      notif = await prisma.notificationPreference.create({ data: { userId } });
    }
    return notif;
  },

  async updateNotifications(userId, data) {
    const notif = await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    await this.createAuditLog(userId, "UPDATE_NOTIFICATIONS", data);
    return notif;
  },

  async getAIPreferences(userId) {
    let ai = await prisma.aIPreference.findUnique({ where: { userId } });
    if (!ai) {
      ai = await prisma.aIPreference.create({ data: { userId } });
    }
    return ai;
  },

  async updateAIPreferences(userId, data) {
    const ai = await prisma.aIPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    await this.createAuditLog(userId, "UPDATE_AI_PREFERENCES", data);
    return ai;
  },

  async getSessions(userId) {
    return prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
    });
  },

  async deleteSession(userId, sessionId) {
    await prisma.userSession.deleteMany({
      where: { id: sessionId, userId },
    });
    await this.createAuditLog(userId, "DELETE_SESSION", { sessionId });
  },

  async deleteAllOtherSessions(userId, currentSessionId) {
    await prisma.userSession.deleteMany({
      where: { userId, id: { not: currentSessionId } },
    });
    await this.createAuditLog(userId, "DELETE_OTHER_SESSIONS", {});
  },

  async listAccessTokens(userId) {
    const tokens = await prisma.accessToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return tokens;
  },

  async createAccessToken(userId, data) {
    const rawToken = "rp_" + crypto.randomBytes(24).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const tokenPrefix = rawToken.substring(0, 10) + "...";
    
    let expiresAt = null;
    if (data.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
    }

    const token = await prisma.accessToken.create({
      data: {
        userId,
        name: data.name,
        tokenHash,
        tokenPrefix,
        expiresAt,
      },
    });

    await this.createAuditLog(userId, "CREATE_ACCESS_TOKEN", { name: data.name });
    
    return {
      token: rawToken,
      ...token,
    };
  },

  async deleteAccessToken(userId, tokenId) {
    await prisma.accessToken.deleteMany({
      where: { id: tokenId, userId },
    });
    await this.createAuditLog(userId, "DELETE_ACCESS_TOKEN", { tokenId });
  },

  async revokeAccessToken(userId, tokenId) {
    await prisma.accessToken.updateMany({
      where: { id: tokenId, userId },
      data: { revokedAt: new Date() },
    });
    await this.createAuditLog(userId, "REVOKE_ACCESS_TOKEN", { tokenId });
  },

  async createAuditLog(userId, action, details) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity: "Settings",
          details,
        },
      });
    } catch (e) {
      logger.error("Failed to create audit log:", e);
    }
  },
};
