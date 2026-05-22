import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

const typeDisplayMap = {
  imported: "scan",
  indexed: "scan",
  analyzed: "analysis",
  summary_generated: "ai",
  dependencies_scanned: "dependency",
  auth_analyzed: "security",
  api_analyzed: "api",
  docs_generated: "docs",
};

const typeCategoryMap = {
  imported: "Import",
  indexed: "Scan",
  analyzed: "AI Analysis",
  summary_generated: "AI Analysis",
  dependencies_scanned: "Alerts",
  auth_analyzed: "Security",
  api_analyzed: "API",
  docs_generated: "Docs",
};

function getEventStatus(type, metadata) {
  if (type === "indexed" && metadata?.fileCount === 0) return "warning";
  if (type === "analyzed") return "completed";
  if (type === "imported") return "completed";
  if (type === "summary_generated") return "completed";
  return "completed";
}

function getEventSeverity(type) {
  if (type === "dependencies_scanned") return "warning";
  if (type === "auth_analyzed") return "warning";
  return "info";
}

function getQuickActions(type) {
  const actions = [];
  if (type === "indexed") actions.push("View Files");
  if (type === "analyzed") actions.push("View Analysis");
  if (type === "summary_generated") actions.push("View Summary");
  if (type === "imported") actions.push("Open Repo");
  return actions;
}

function getEventDetails(type, metadata) {
  const details = [];
  if (metadata?.fileCount != null) details.push(`${metadata.fileCount} files`);
  if (metadata?.dependencyCount != null) details.push(`${metadata.dependencyCount} dependencies`);
  if (metadata?.branchCount != null) details.push(`${metadata.branchCount} branches`);
  if (metadata?.type) details.push(`Type: ${metadata.type}`);
  if (metadata?.duration != null) details.push(`${metadata.duration}s`);
  return details;
}

function getEventDescription(type, message, metadata) {
  if (type === "indexed" && metadata?.fileCount != null)
    return `Scanned ${metadata.fileCount} files with ${metadata.dependencyCount || 0} dependencies across ${metadata.branchCount || 1} branches`;
  if (type === "imported") return "Repository imported successfully";
  if (type === "analyzed") return `Analysis completed: ${message}`;
  if (type === "summary_generated") return "AI repository summary generated";
  return message;
}

export const getActivityFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, limit = 50, offset = 0 } = req.query;

    const repos = await prisma.repository.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const repoIds = repos.map((r) => r.id);
    const repoMap = Object.fromEntries(repos.map((r) => [r.id, r.name]));

    const where = { repositoryId: { in: repoIds } };
    if (type && type !== "all") {
      const reverseMap = Object.entries(typeDisplayMap).reduce((acc, [k, v]) => {
        if (v === type) acc.push(k);
        return acc;
      }, []);
      if (reverseMap.length > 0) {
        where.type = { in: reverseMap };
      }
    }

    const [events, totalCount] = await Promise.all([
      prisma.repositoryEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: { repository: { select: { name: true } } },
      }),
      prisma.repositoryEvent.count({ where }),
    ]);

    const activityEvents = events.map((e) => {
      const metadata = e.metadata || {};
      const displayType = typeDisplayMap[e.type] || "sync";
      return {
        id: e.id,
        type: displayType,
        repo: e.repository?.name || repoMap[e.repositoryId] || "unknown",
        title: e.message,
        description: getEventDescription(e.type, e.message, metadata),
        timestamp: e.createdAt,
        status: getEventStatus(e.type, metadata),
        severity: getEventSeverity(e.type),
        details: getEventDetails(e.type, metadata),
        quickActions: getQuickActions(e.type),
        live: false,
      };
    });

    const typeCounts = {};
    const categoryUnread = {};
    events.forEach((e) => {
      const dt = typeDisplayMap[e.type] || "sync";
      typeCounts[dt] = (typeCounts[dt] || 0) + 1;
      const cat = typeCategoryMap[e.type] || "Other";
      categoryUnread[cat] = (categoryUnread[cat] || 0) + 1;
    });

    const filterItems = [
      { label: "All", count: totalCount, unread: 0, active: true },
      { label: "Scan", count: (typeCounts["scan"] || 0) + (typeCounts["import"] || 0), unread: 0 },
      { label: "AI Analysis", count: typeCounts["ai"] || 0, unread: 0 },
      { label: "Alerts", count: typeCounts["dependency"] || 0, unread: 0 },
      { label: "Security", count: typeCounts["security"] || 0, unread: 0 },
      { label: "Docs", count: typeCounts["docs"] || 0, unread: 0 },
    ];

    const indexedCount = repos.length;
    const healthyCount = repos.length;

    const insights = [
      {
        title: "Repositories Indexed",
        value: String(indexedCount),
        detail: `${indexedCount} total repositories`,
        badge: indexedCount > 0 ? "Good" : "Alert",
      },
      {
        title: "Scan Velocity",
        value: `${events.length}`,
        detail: "Events in current view",
        badge: events.length > 0 ? "Active" : "Idle",
      },
      {
        title: "Health Score",
        value: `${Math.round((healthyCount / Math.max(indexedCount, 1)) * 100)}%`,
        detail: `${healthyCount} healthy, ${indexedCount - healthyCount} warnings`,
        badge: healthyCount === indexedCount ? "Good" : "Alert",
      },
    ];

    const suggestions = [];

    if (totalCount === 0) {
      suggestions.push({
        title: "Import Your First Repository",
        description: "Get started by importing repositories to track activity and AI analysis.",
        action: "Import",
      });
    }

    suggestions.push({
      title: "Explore Repository Insights",
      description: "View detailed analysis and summaries for your indexed repositories.",
      action: "Explore",
    });

    suggestions.push({
      title: "Review AI Analysis",
      description: `Across ${repos.length} repositories, the AI has generated insights and summaries.`,
      action: "View",
    });

    res.json({
      success: true,
      events: activityEvents,
      total: totalCount,
      filters: filterItems,
      insights,
      suggestions,
    });
  } catch (error) {
    logger.error(`Error in getActivityFeed: ${error.message}`);
    next(error);
  }
};
