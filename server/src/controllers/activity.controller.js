import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

const EVENT_TITLE = {
  imported: "Repository Imported",
  indexed: "Repository Scanned",
  analyzed: "AI Analysis Completed",
  summary_generated: "AI Summary Generated",
  dependencies_scanned: "Dependencies Checked",
  auth_analyzed: "Auth Flow Analyzed",
  api_analyzed: "API Routes Mapped",
  docs_generated: "Documentation Generated",
};

const EVENT_CATEGORY = {
  imported: "success",
  indexed: "success",
  analyzed: "info",
  summary_generated: "info",
  dependencies_scanned: "warning",
  auth_analyzed: "warning",
  api_analyzed: "info",
  docs_generated: "success",
};

const QUICK_FILTER_MAP = {
  imported: "Repository Imports",
  indexed: "AI Scans",
  analyzed: "AI Scans",
  summary_generated: "AI Suggestions",
  dependencies_scanned: "Security Alerts",
  auth_analyzed: "Security Alerts",
  api_analyzed: "Documentation Updates",
  docs_generated: "Documentation Updates",
};

function humanize(type, message, metadata, repoName) {
  const meta = metadata || {};
  switch (type) {
    case "imported":
      return `Repository "${repoName}" has been added to your workspace and is ready for analysis.`;
    case "indexed":
      return `Scanned ${meta.fileCount || 0} files and identified ${meta.dependencyCount || 0} dependencies across ${meta.branchCount || 1} branches in ${repoName}.`;
    case "analyzed":
      return `AI analysis completed for ${repoName}. New insights are available.`;
    case "summary_generated":
      return `AI generated a comprehensive summary of ${repoName}, including architecture overview, tech stack, and key components.`;
    case "dependencies_scanned":
      return meta.vulnerabilities
        ? `Found ${meta.vulnerabilities} vulnerabilities across ${meta.dependencyCount || 0} dependencies in ${repoName}.`
        : `All ${meta.dependencyCount || 0} dependencies in ${repoName} are up to date with no known vulnerabilities.`;
    case "auth_analyzed":
      return meta.risks
        ? `Auth flow analysis detected ${meta.risks} potential security concerns in ${repoName}.`
        : `Authentication flows in ${repoName} have been verified and appear secure.`;
    case "api_analyzed":
      return `Mapped and analyzed ${meta.routeCount || "all"} API routes in ${repoName}.`;
    case "docs_generated":
      return `Auto-generated documentation is now available for ${repoName}.`;
    default:
      return message;
  }
}

function getAction(type, repositoryId) {
  const actions = {
    imported: { label: "Open Repository", href: `/repositories/${repositoryId}` },
    indexed: { label: "View Files", href: `/repositories/${repositoryId}` },
    analyzed: { label: "View Analysis", href: `/repositories/${repositoryId}` },
    summary_generated: { label: "View Summary", href: `/repositories/${repositoryId}` },
    dependencies_scanned: { label: "Review Dependencies", href: `/repositories/${repositoryId}` },
    auth_analyzed: { label: "Review Security", href: `/repositories/${repositoryId}` },
    api_analyzed: { label: "View API Routes", href: `/repositories/${repositoryId}` },
    docs_generated: { label: "View Documentation", href: `/repositories/${repositoryId}` },
  };
  return actions[type] || { label: "View Details", href: `/repositories/${repositoryId}` };
}

export const getActivityFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, repo: repoFilter, time, search, limit = 50, offset = 0 } = req.query;

    const repos = await prisma.repository.findMany({
      where: { userId },
      select: { id: true, name: true, fullName: true, scanStatus: true },
    });

    const repoIds = repos.map((r) => r.id);
    const repoMap = Object.fromEntries(repos.map((r) => [r.id, r.name || r.fullName]));

    const where = { repositoryId: { in: repoIds } };

    if (type && type !== "all") {
      const typeToEventType = {
        "Repository Imports": "imported",
        "AI Scans": ["indexed", "analyzed"],
        "Security Alerts": ["dependencies_scanned", "auth_analyzed"],
        "Documentation Updates": ["api_analyzed", "docs_generated"],
        "AI Suggestions": "summary_generated",
      };
      const match = typeToEventType[type];
      if (match) {
        where.type = Array.isArray(match) ? { in: match } : match;
      }
    }

    if (repoFilter && repoFilter !== "all") {
      where.repositoryId = repoFilter;
    }

    if (time && time !== "all") {
      const now = new Date();
      let since;
      if (time === "today") since = new Date(now.setHours(0, 0, 0, 0));
      else if (time === "week") since = new Date(now.setDate(now.getDate() - 7));
      else if (time === "month") since = new Date(now.setMonth(now.getMonth() - 1));
      if (since) where.createdAt = { gte: since };
    }

    const dbEvents = await prisma.repositoryEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: { repository: { select: { name: true, fullName: true } } },
    });

    const totalCount = await prisma.repositoryEvent.count({ where });

    const eventRepositoryIds = [...new Set(dbEvents.map((e) => e.repositoryId))];

    const [analyses, allFiles, reviewSessions] = await Promise.all([
      prisma.repositoryAnalysis.findMany({
        where: { repositoryId: { in: eventRepositoryIds } },
        orderBy: { createdAt: "desc" },
        select: { repositoryId: true, type: true, summary: true, createdAt: true },
      }),
      prisma.repositoryFile.findMany({
        where: { repositoryId: { in: eventRepositoryIds }, isImportant: true },
        select: { repositoryId: true, path: true, modulePurpose: true },
        take: 200,
      }),
      prisma.reviewSession.findMany({
        where: { repositoryId: { in: eventRepositoryIds } },
        orderBy: { createdAt: "desc" },
        select: { id: true, repositoryId: true, title: true, riskLevel: true, status: true, createdAt: true },
      }),
    ]);

    const analysesByRepo = {};
    analyses.forEach((a) => {
      if (!analysesByRepo[a.repositoryId]) analysesByRepo[a.repositoryId] = [];
      analysesByRepo[a.repositoryId].push(a);
    });

    const filesByRepo = {};
    allFiles.forEach((f) => {
      if (!filesByRepo[f.repositoryId]) filesByRepo[f.repositoryId] = [];
      filesByRepo[f.repositoryId].push(f);
    });

    const reviewsByRepo = {};
    reviewSessions.forEach((r) => {
      if (!reviewsByRepo[r.repositoryId]) reviewsByRepo[r.repositoryId] = [];
      reviewsByRepo[r.repositoryId].push(r);
    });

    const events = dbEvents.map((e) => {
      const meta = e.metadata || {};
      const repoName = e.repository?.name || repoMap[e.repositoryId] || "unknown";
      const titleText = EVENT_TITLE[e.type] || e.message;
      const explanation = humanize(e.type, e.message, meta, repoName);
      const category = EVENT_CATEGORY[e.type] || "info";
      const action = getAction(e.type, e.repositoryId);
      const filterLabel = QUICK_FILTER_MAP[e.type] || "All";

      const repoAnalyses = analysesByRepo[e.repositoryId] || [];
      const repoFiles = filesByRepo[e.repositoryId] || [];
      const repoReviews = reviewsByRepo[e.repositoryId] || [];

      let aiExplanation = null;
      if (e.type === "summary_generated" || e.type === "analyzed") {
        const latestAnalysis = repoAnalyses.find(
          (a) => a.type === (e.type === "summary_generated" ? "summary" : "architecture")
        );
        if (latestAnalysis?.summary) {
          aiExplanation = latestAnalysis.summary.slice(0, 300);
        }
      }

      const relatedFiles = repoFiles.length > 0
        ? repoFiles.slice(0, 5).map((f) => ({
            path: f.path,
            purpose: f.modulePurpose || "Key file",
          }))
        : null;

      const relatedReviews = repoReviews.length > 0
        ? repoReviews.slice(0, 3).map((r) => ({
            id: r.id,
            title: r.title,
            risk: r.riskLevel || "unknown",
            status: r.status,
          }))
        : null;

      const suggestedFix =
        meta.vulnerabilities
          ? `Review ${meta.dependencyCount || 0} dependencies and update vulnerable packages.`
          : null;

      return {
        id: e.id,
        type: titleText,
        filterLabel,
        category,
        explanation,
        repo: repoName,
        repoId: e.repositoryId,
        timestamp: e.createdAt,
        action,
        live: false,
        expandable: {
          aiExplanation,
          suggestedFix,
          relatedFiles,
          relatedReviews,
        },
      };
    });

    const liveScans = repos
      .filter((r) => r.scanStatus === "scanning" || r.scanStatus === "summarizing" || r.scanStatus === "importing")
      .map((r) => ({
        repo: r.name || r.fullName,
        status: r.scanStatus,
        steps: [
          { label: "Importing repository", done: r.scanStatus !== "importing" },
          { label: "Scanning file structure", done: r.scanStatus === "summarizing" || r.scanStatus === "completed" },
          { label: "Analyzing dependencies", done: false },
          { label: "Generating AI summary", done: false },
        ],
      }));

    const enrichedEvents = events;

    const reposScanned = repos.filter((r) => r.scanStatus === "completed" || r.scanStatus === "scanning").length;
    const failedCount = repos.filter((r) => r.scanStatus === "failed").length;
    const healthScore = repos.length > 0 ? Math.round(((repos.length - failedCount) / repos.length) * 100) : 100;

    const insights = {
      repositoriesScanned: reposScanned,
      healthScore,
      activeIssues: failedCount > 0 ? failedCount : 0,
      securityRisks: dbEvents.filter((e) => e.type === "dependencies_scanned" && e.metadata?.vulnerabilities).length,
      recommendedActions: [
        ...(failedCount > 0 ? [{ text: `Re-scan ${failedCount} failed repositori${failedCount > 1 ? "es" : "y"}`, priority: "high" }] : []),
        ...(repos.filter((r) => !r.scanStatus || r.scanStatus === "pending").length > 0
          ? [{ text: `Scan ${repos.filter((r) => !r.scanStatus || r.scanStatus === "pending").length} pending repositori${repos.filter((r) => !r.scanStatus || r.scanStatus === "pending").length > 1 ? "es" : "y"}`, priority: "medium" }]
          : []),
        ...(reposScanned > 0 ? [{ text: "Review latest AI insights across your workspace", priority: "low" }] : [{ text: "Import your first repository to get started", priority: "high" }]),
      ],
    };

    res.json({
      success: true,
      events: enrichedEvents,
      total: totalCount,
      repositories: repos.map((r) => ({ id: r.id, name: r.name || r.fullName })),
      insights,
      liveScans,
    });
  } catch (error) {
    logger.error(`Error in getActivityFeed: ${error.message}`);
    next(error);
  }
};
