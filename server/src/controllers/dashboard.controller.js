import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

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
