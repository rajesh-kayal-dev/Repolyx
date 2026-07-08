import prisma from '../../prisma/client.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export const githubService = {
  /**
   * Validate token against GitHub API and return user details
   */
  async validateToken(token) {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid GitHub token');
    }

    return response.json();
  },

  /**
   * Connect and store GitHub PAT
   */
  async connect(userId, token) {
    // 1. Validate token with GitHub
    const githubUser = await this.validateToken(token);
    
    // 2. Encrypt token
    const encryptedToken = encrypt(token);

    // 3. Store in database (upsert to allow reconnecting)
    const connection = await prisma.githubConnection.upsert({
      where: { userId },
      update: {
        githubId: String(githubUser.id),
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        encryptedToken,
        updatedAt: new Date(),
      },
      create: {
        userId,
        githubId: String(githubUser.id),
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        encryptedToken,
      },
    });

    return {
      connected: true,
      username: connection.username,
      avatar: connection.avatar,
      connectedAt: connection.connectedAt,
    };
  },

  /**
   * Get current connection status for a user
   */
  async getStatus(userId) {
    const connection = await prisma.githubConnection.findUnique({
      where: { userId },
      select: {
        username: true,
        avatar: true,
        connectedAt: true,
      },
    });

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: true,
      username: connection.username,
      avatar: connection.avatar,
      connectedAt: connection.connectedAt,
    };
  },

  /**
   * Disconnect and delete PAT
   */
  async disconnect(userId) {
    try {
      await prisma.githubConnection.delete({
        where: { userId },
      });
      return { success: true };
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return { success: true };
      }
      throw error;
    }
  },

  /**
   * INTERNAL: Get decrypted token for MCP tools
   */
  async getDecryptedToken(userId) {
    const connection = await prisma.githubConnection.findUnique({
      where: { userId },
    });

    if (!connection) {
      throw new Error('GitHub account not connected');
    }

    return decrypt(connection.encryptedToken);
  }
};
