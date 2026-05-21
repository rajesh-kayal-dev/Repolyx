import { Octokit } from "@octokit/rest";
import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";
import { apifyService } from "../services/apify.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [repos, sessions, events, analysisCount] = await Promise.all([
      prisma.repository.findMany({ where: { userId } }),
      prisma.chatSession.findMany({ where: { userId } }),
      prisma.repositoryEvent.findMany({
        where: { repository: { userId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { repository: { select: { name: true } } },
      }),
      prisma.repositoryAnalysis.count({
        where: { repository: { userId } },
      }),
    ]);

    const totalRepos = repos.length;
    const indexedRepos = repos.filter((r) => r.isIndexed).length;
    const totalFiles = repos.reduce((sum, r) => sum + r.fileCount, 0);
    const totalDeps = repos.reduce((sum, r) => sum + r.dependencyCount, 0);
    const activeSessions = sessions.length;

    const scannedRepos = repos.filter(
      (r) => r.scanStatus === "completed" || r.scanStatus === "scanning"
    );
    const healthyRepos = repos.filter(
      (r) => r.scanStatus === "completed"
    ).length;
    const warningRepos = repos.filter(
      (r) => r.scanStatus === "failed"
    ).length;

    res.json({
      success: true,
      stats: {
        repositories: totalRepos,
        indexedRepositories: indexedRepos,
        activeSessions,
        totalFiles,
        totalDependencies: totalDeps,
        totalAnalyses: analysisCount,
        healthyRepos,
        warningRepos,
      },
      recentActivity: events.map((e) => ({
        id: e.id,
        type: mapEventType(e.type),
        title: e.message,
        repo: e.repository.name,
        timestamp: e.createdAt,
      })),
    });
  } catch (error) {
    logger.error("Error in getDashboardStats:", error);
    next(error);
  }
};

export const getDashboardSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        repository: { select: { name: true, fullName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const mapped = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      repo: s.repository.fullName || s.repository.name,
      repoId: s.repositoryId,
      status: "idle",
      detail: s.messages[0]
        ? `${s.messages[0].role === "user" ? "You" : "AI"}: ${truncate(s.messages[0].content, 60)}`
        : "No messages yet",
      updatedAt: s.updatedAt,
    }));

    res.json({ success: true, sessions: mapped });
  } catch (error) {
    logger.error("Error in getDashboardSessions:", error);
    next(error);
  }
};

export const getRepoHealth = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const repos = await prisma.repository.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const mapped = repos.map((r) => ({
      id: r.id,
      name: r.fullName,
      language: r.language || "Unknown",
      defaultBranch: r.defaultBranch || "main",
      status: r.scanStatus === "completed" ? "healthy" : r.scanStatus === "failed" ? "error" : "warning",
      isIndexed: r.isIndexed,
      fileCount: r.fileCount,
      dependencyCount: r.dependencyCount,
      updatedAt: r.updatedAt,
    }));

    res.json({ success: true, repositories: mapped });
  } catch (error) {
    logger.error("Error in getRepoHealth:", error);
    next(error);
  }
};

export const getDashboardActions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const repos = await prisma.repository.findMany({ where: { userId } });

    const actions = [];

    const unindexedRepos = repos.filter((r) => !r.isIndexed);
    if (unindexedRepos.length > 0) {
      actions.push({
        label: `Index ${unindexedRepos.length} pending repositor${unindexedRepos.length > 1 ? "ies" : "y"}`,
        description: `${unindexedRepos.map((r) => r.name).join(", ")} need${unindexedRepos.length === 1 ? "s" : ""} initial scan`,
        icon: "RefreshCw",
        priority: "high",
      });
    }

    const failedRepos = repos.filter((r) => r.scanStatus === "failed");
    if (failedRepos.length > 0) {
      actions.push({
        label: `Re-scan ${failedRepos.length} failed repositor${failedRepos.length > 1 ? "ies" : "y"}`,
        description: `${failedRepos.map((r) => r.name).join(", ")} ${failedRepos.length === 1 ? "has" : "have"} scan errors`,
        icon: "AlertTriangle",
        priority: "high",
      });
    }

    const indexedRepos = repos.filter((r) => r.isIndexed);
    if (indexedRepos.length > 0 && repos.length > 0) {
      actions.push({
        label: "Analyze repository architecture",
        description: `Run AI-powered analysis on ${indexedRepos.length} indexed repositor${indexedRepos.length > 1 ? "ies" : "y"}`,
        icon: "Search",
        priority: "medium",
      });
    }

    actions.push({
      label: "View documentation",
      description: "Learn about Repolyx features and API",
      icon: "FileText",
      priority: "low",
    });

    res.json({ success: true, actions });
  } catch (error) {
    logger.error("Error in getDashboardActions:", error);
    next(error);
  }
};

export const getGithubProfile = async (req, res, next) => {
  try {
    const token = req.user.githubAccessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No GitHub token - please re-login" });
    }

    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.users.getAuthenticated();

    let totalStars = 0;
    try {
      const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
        visibility: "all",
        per_page: 100,
      });
      totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    } catch {
      // non-critical
    }

    res.json({
      success: true,
      profile: {
        login: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        location: data.location,
        company: data.company,
        blog: data.blog,
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
        totalStars,
        htmlUrl: data.html_url,
      },
    });
  } catch (error) {
    logger.error("Error in getGithubProfile:", {
      message: error.message,
      status: error.status,
      stack: error.stack,
    });
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        message: "GitHub token expired or invalid - please re-login",
      });
    }
    next(error);
  }
};

export const getContributions = async (req, res, next) => {
  const login = req.user.username;
  if (!login) {
    return res.status(400).json({ success: false, message: "GitHub username not found" });
  }

  try {
    const token = req.user.githubAccessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No GitHub token" });
    }

    const octokit = new Octokit({ auth: token });
    const now = new Date();
    const from = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString();
    const to = now.toISOString();

    const result = await octokit.graphql({
      query: `
        query($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    color
                  }
                }
              }
            }
          }
        }
      `,
      login,
      from,
      to,
    });

    const user = result.user;
    if (!user || !user.contributionsCollection) {
      return res.json({
        success: true,
        contributions: { weeks: [], totalContributions: 0, activeDays: 0, longestStreak: 0 },
      });
    }

    const cal = user.contributionsCollection.contributionCalendar;
    const weeks = cal.weeks.map((w) => ({
      days: w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: Math.min(Math.floor(d.contributionCount / 5), 4),
      })),
    }));

    const days = weeks.flatMap((w) => w.days);
    const activeDays = days.filter((d) => d.count > 0).length;
    let longestStreak = 0;
    let currentStreak = 0;
    for (const d of days) {
      if (d.count > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return res.json({
      success: true,
      contributions: {
        weeks,
        totalContributions: cal.totalContributions,
        activeDays,
        longestStreak,
      },
    });
  } catch (error) {
    const graphqlErrors = error.errors ? JSON.stringify(error.errors) : "";
    logger.error("GraphQL contributions error, falling back to Apify scraper:", {
      message: error.message,
      status: error.status,
      graphqlErrors,
    });

    const apifyData = await apifyService.fetchGitHubContributions(login);
    if (apifyData) {
      return res.json({ success: true, contributions: apifyData, source: "apify" });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contributions",
      ...(graphqlErrors && { details: graphqlErrors }),
    });
  }
};

export const getAchievements = async (req, res, next) => {
  const username = req.user.username;
  if (!username) {
    return res.status(400).json({ success: false, message: "GitHub username not found" });
  }

  try {
    const achievements = await apifyService.fetchGitHubAchievements(username);
    const totalEarned = achievements.length;
    res.json({
      success: true,
      achievements,
      totalEarned,
      source: "apify",
    });
  } catch (error) {
    logger.error("Error in getAchievements:", error.message, error.stack);
    res.json({ success: true, achievements: [], totalEarned: 0 });
  }
};

export const getReadme = async (req, res, next) => {
  try {
    const token = req.user.githubAccessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No GitHub token - please re-login" });
    }

    const octokit = new Octokit({ auth: token });

    try {
      const { data } = await octokit.rest.repos.getReadme({
        owner: req.user.username,
        repo: req.user.username,
      });
      const readme = Buffer.from(data.content, "base64").toString("utf-8");
      return res.json({ success: true, readme, htmlUrl: data.html_url });
    } catch (err) {
      if (err.status === 404) {
        const { data } = await octokit.rest.repos.getReadme({
          owner: req.user.username,
          repo: ".github",
        });
        const readme = Buffer.from(data.content, "base64").toString("utf-8");
        return res.json({ success: true, readme, htmlUrl: data.html_url });
      }
      throw err;
    }
  } catch (error) {
    if (error.status === 404) {
      return res.json({ success: true, readme: null, htmlUrl: null });
    }
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        message: "GitHub token expired or invalid - please re-login",
      });
    }
    logger.error("Error in getReadme:", error);
    next(error);
  }
};
function mapEventType(type) {
  const map = {
    imported: "import",
    indexed: "scan",
    analyzed: "analysis",
    summary_generated: "ai",
    dependencies_scanned: "dependency",
    auth_analyzed: "security",
    api_analyzed: "api",
    docs_generated: "docs",
  };
  return map[type] || "info";
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}
