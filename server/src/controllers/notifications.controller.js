import { Octokit } from "@octokit/rest";
import logger from "../utils/logger.js";

export const getNotifications = async (req, res, next) => {
  try {
    const token = req.user.githubAccessToken;
    if (!token) {
      return res.json({ success: true, notifications: [] });
    }

    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.request("GET /notifications", {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    const notifications = data.map((n) => ({
      id: n.id,
      reason: n.reason,
      unread: n.unread,
      title: n.subject.title,
      type: n.subject.type,
      url: n.subject.url,
      latestCommentUrl: n.subject.latest_comment_url,
      repository: n.repository.full_name,
      repoUrl: n.repository.html_url,
      updatedAt: n.updated_at,
    }));

    res.json({ success: true, notifications });
  } catch (error) {
    logger.error(`Error fetching notifications: ${error.message}`);
    res.json({ success: true, notifications: [] });
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const token = req.user.githubAccessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No GitHub token" });
    }

    const octokit = new Octokit({ auth: token });
    await octokit.request(`PATCH /notifications/threads/{threadId}`, {
      threadId: parseInt(threadId),
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error(`Error marking notification read: ${error.message}`);
    res.json({ success: false, message: error.message });
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const token = req.user.githubAccessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No GitHub token" });
    }

    const octokit = new Octokit({ auth: token });
    await octokit.request("PUT /notifications", {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error(`Error marking all notifications read: ${error.message}`);
    res.json({ success: false, message: error.message });
  }
};
