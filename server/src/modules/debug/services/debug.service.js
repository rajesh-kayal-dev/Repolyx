import prisma from "../../../database/prisma.js";
import { generateCompletion } from "../../ai/providers/index.js";
import logger from "../../../utils/logger.js";

// ─── AI Analysis ────────────────────────────────────────────────────────────

/**
 * Build a structured AI prompt for incident analysis.
 * Returns plain-English explanation + fix recommendation.
 */
function buildAnalysisPrompt(incident, logs) {
  const logSample = logs
    .slice(0, 20)
    .map((l) => `[${l.level.toUpperCase()}] ${l.source}: ${l.message}`)
    .join("\n");

  return `You are an expert debugging assistant. Analyze this production incident and explain it in simple, beginner-friendly language.

INCIDENT DETAILS:
- Title: ${incident.title}
- Service: ${incident.service || "unknown"}
- Severity: ${incident.severity}
- Deploy Version: ${incident.deployVersion || "unknown"}
- Error Rate: ${incident.errorRate || "unknown"}
- Impact: ${incident.impactStatement || "unknown"}

RECENT LOGS (most relevant):
${logSample || "No logs attached yet."}

Respond ONLY with a valid JSON object in exactly this format:
{
  "explanation": "Plain English explanation of what happened and why (2-4 sentences, understandable by a beginner). Do NOT use jargon like 'upstream' or 'connection pool' without explaining it.",
  "likelyCause": "One sentence summary of the most likely root cause.",
  "fixSuggestion": "Clear description of the recommended fix. Mention specific file names or env vars if relevant.",
  "riskLevel": "low|medium|high",
  "confidence": 85,
  "affectedFiles": ["file1.ts", "file2.js"],
  "timelineHint": "Brief note about what event likely triggered this."
}`;
}

function buildQuestionPrompt(incident, question) {
  return `You are a debugging assistant. A user is asking a question about this incident.

INCIDENT:
- Title: ${incident.title}
- Service: ${incident.service || "unknown"}
- AI Explanation: ${incident.aiExplanation || "Not yet analyzed"}
- AI Fix: ${incident.aiFixSuggestion || "Not yet generated"}
- Affected Files: ${JSON.stringify(incident.affectedFiles || [])}
- Related Commits: ${JSON.stringify(incident.relatedCommits || [])}

USER QUESTION: ${question}

Answer in 2-4 sentences using plain English. Be specific about files, commits, or env vars where known. If you don't know, say so honestly.`;
}

// ─── Service Methods ─────────────────────────────────────────────────────────

import { debugScanner } from "./debug.scanner.js";

export const debugService = {
  /**
   * Get repositories with debug health status.
   */
  async getRepositoriesWithHealth(userId) {
    const repos = await prisma.repository.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        fullName: true,
        language: true,
        lastScanAt: true,
        lastScanDuration: true,
        branchCount: true,
        dependencyCount: true,
        _count: {
          select: {
            debugIncidents: { where: { status: { not: "resolved" } } },
          },
        },
      },
      orderBy: { lastScanAt: { sort: "desc", nulls: "last" } },
    });
    return repos.map(r => {
      let healthScore = "Not Scanned";
      if (r.lastScanAt) {
        if (r._count.debugIncidents === 0) healthScore = "Clean";
        else if (r._count.debugIncidents < 3) healthScore = "Warning";
        else healthScore = "Critical";
      }

      return {
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        language: r.language,
        lastScanAt: r.lastScanAt,
        scanDuration: r.lastScanDuration,
        branchCount: r.branchCount,
        dependencyCount: r.dependencyCount,
        incidentCount: r._count.debugIncidents,
        scanStatus: r._count.debugIncidents > 0 ? "issues" : "clean",
        healthScore
      };
    });
  },

  /**
   * Auto-scan a repository for issues.
   */
  async scanRepository(repositoryId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });
    if (!user?.githubAccessToken) {
      throw new Error("GitHub access token not available.");
    }
    return debugScanner.autoScanRepository(repositoryId, userId, user.githubAccessToken);
  },

  /**
   * List all incidents for a user, most recent first.
   */
  async listIncidents(userId) {
    return prisma.debugIncident.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          orderBy: { loggedAt: "desc" },
          take: 5,
        },
      },
    });
  },

  /**
   * Get a single incident with all logs and full details.
   */
  async getIncident(incidentId, userId) {
    const incident = await prisma.debugIncident.findFirst({
      where: { id: incidentId, userId },
      include: {
        logs: {
          orderBy: { loggedAt: "desc" },
          take: 100,
        },
      },
    });
    if (!incident) throw new Error("Incident not found");
    return incident;
  },

  /**
   * Create a new incident manually.
   */
  async createIncident(userId, data) {
    const {
      title,
      impactStatement,
      severity = "medium",
      service,
      deployVersion,
      errorRate,
      affectedUsers,
      repositoryId,
    } = data;

    const incident = await prisma.debugIncident.create({
      data: {
        userId,
        title,
        impactStatement,
        severity,
        service,
        deployVersion,
        errorRate,
        affectedUsers,
        repositoryId: repositoryId || null,
        status: "investigating",
        timelineEvents: [
          {
            type: "event",
            title: "Incident created",
            detail: `Incident "${title}" was manually reported`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });

    return incident;
  },

  /**
   * Trigger AI analysis on an incident.
   * Generates: explanation, fix suggestion, confidence, affected files.
   */
  async analyzeIncident(incidentId, userId) {
    const incident = await prisma.debugIncident.findFirst({
      where: { id: incidentId, userId },
      include: { logs: { orderBy: { loggedAt: "desc" }, take: 30 } },
    });
    if (!incident) throw new Error("Incident not found");

    const prompt = buildAnalysisPrompt(incident, incident.logs);

    let parsed = null;
    try {
      const aiResult = await generateCompletion(
        [{ role: "user", content: prompt }],
        { heavy: false }
      );

      const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      logger.warn("AI analysis failed, using fallback:", err.message);
    }

    const explanation =
      parsed?.explanation ||
      `The ${incident.service || "service"} started failing after a recent change. ` +
        `Error rates increased significantly. The AI could not fully analyze this incident yet — try adding logs.`;

    const fixSuggestion =
      parsed?.fixSuggestion ||
      "Check recent deployments and compare configuration changes between versions.";

    const confidence = parsed?.confidence ?? 40;
    const riskLevel = parsed?.riskLevel || "medium";
    const affectedFiles = parsed?.affectedFiles || [];

    // Append AI analysis event to timeline
    const existingTimeline = Array.isArray(incident.timelineEvents)
      ? incident.timelineEvents
      : [];

    const updatedTimeline = [
      ...existingTimeline,
      {
        type: "finding",
        title: "AI analysis completed",
        detail: parsed?.likelyCause || "Root cause identified by AI",
        timestamp: new Date().toISOString(),
      },
      {
        type: "finding",
        title: "Fix recommendation generated",
        detail: fixSuggestion.slice(0, 80),
        timestamp: new Date().toISOString(),
      },
    ];

    const updated = await prisma.debugIncident.update({
      where: { id: incidentId },
      data: {
        aiExplanation: explanation,
        aiFixSuggestion: fixSuggestion,
        aiConfidence: Math.min(100, Math.max(0, Math.round(confidence))),
        riskLevel,
        affectedFiles,
        timelineEvents: updatedTimeline,
        status: "identified",
      },
      include: { logs: { orderBy: { loggedAt: "desc" }, take: 100 } },
    });

    return updated;
  },

  /**
   * Answer a specific question about an incident using AI.
   */
  async answerQuestion(incidentId, userId, question) {
    const incident = await prisma.debugIncident.findFirst({
      where: { id: incidentId, userId },
    });
    if (!incident) throw new Error("Incident not found");

    const prompt = buildQuestionPrompt(incident, question);

    try {
      const aiResult = await generateCompletion(
        [{ role: "user", content: prompt }],
        { heavy: false }
      );
      return { answer: aiResult.text.trim() };
    } catch (err) {
      logger.warn("AI Q&A failed:", err.message);
      return {
        answer:
          "I couldn't connect to the AI at the moment. Check the affected files and related commits for clues.",
      };
    }
  },

  /**
   * Get recent logs for a user, optionally filtered by level / service.
   */
  async getLogs(userId, { level, service, limit = 50, incidentId } = {}) {
    const where = { userId };
    if (level) where.level = level;
    if (service) where.service = service;
    if (incidentId) where.incidentId = incidentId;

    return prisma.debugLog.findMany({
      where,
      orderBy: { loggedAt: "desc" },
      take: Number(limit),
    });
  },

  /**
   * Append a log entry to an incident.
   */
  async addLog(userId, data) {
    const { incidentId, level, message, source, service, stackTrace, metadata, loggedAt } = data;
    return prisma.debugLog.create({
      data: {
        userId,
        incidentId: incidentId || null,
        level: level || "info",
        message,
        source: source || "unknown",
        service,
        stackTrace,
        metadata,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });
  },

  /**
   * Create a GitHub issue for an incident using the user's access token.
   */
  async createGitHubIssue(userId, incidentId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true, username: true },
    });
    if (!user?.githubAccessToken) {
      throw new Error("GitHub access token not available. Please reconnect your GitHub account.");
    }

    const incident = await prisma.debugIncident.findFirst({
      where: { id: incidentId, userId },
      include: { logs: { orderBy: { loggedAt: "desc" }, take: 10 } },
    });
    if (!incident) throw new Error("Incident not found");

    // Try to get the linked repository for the issue target
    let repoFullName = null;
    if (incident.repositoryId) {
      const repo = await prisma.repository.findUnique({
        where: { id: incident.repositoryId },
        select: { fullName: true },
      });
      repoFullName = repo?.fullName;
    }

    if (!repoFullName) {
      throw new Error(
        "No repository linked to this incident. Link a repository first to create a GitHub issue."
      );
    }

    const [owner, repo] = repoFullName.split("/");

    const logLines = incident.logs
      .slice(0, 8)
      .map((l) => `- \`[${l.level.toUpperCase()}]\` ${l.source}: ${l.message}`)
      .join("\n");

    const body = `## 🐛 Incident Report — ${incident.title}

**Severity:** ${incident.severity.toUpperCase()}
**Service:** ${incident.service || "Unknown"}
**Status:** ${incident.status}
**Deploy Version:** ${incident.deployVersion || "Unknown"}
**Error Rate:** ${incident.errorRate || "Unknown"}

---

## What Happened

${incident.impactStatement || "No impact statement provided."}

## AI Explanation

${incident.aiExplanation || "_Not yet analyzed. Run AI analysis first._"}

## Recommended Fix

${incident.aiFixSuggestion || "_No fix recommendation yet._"}

**Risk Level:** ${incident.riskLevel || "Unknown"} | **AI Confidence:** ${incident.aiConfidence}%

---

## Affected Files

${(incident.affectedFiles || []).map((f) => `- \`${f}\``).join("\n") || "_None identified yet._"}

## Recent Logs

${logLines || "_No logs attached._"}

---

*Generated by [Repolyx Debug Assistant](https://repolyx.com) on ${new Date().toLocaleString()}*`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title: `[Debug] ${incident.title}`,
          body,
          labels: ["bug", "debug-assistant", incident.severity],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `GitHub API error: ${response.status}`);
    }

    const issue = await response.json();

    // Save the GitHub issue URL to the incident timeline
    const existingTimeline = Array.isArray(incident.timelineEvents)
      ? incident.timelineEvents
      : [];

    await prisma.debugIncident.update({
      where: { id: incidentId },
      data: {
        timelineEvents: [
          ...existingTimeline,
          {
            type: "event",
            title: "GitHub issue created",
            detail: `Issue #${issue.number} created: ${issue.html_url}`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });

    return { issueUrl: issue.html_url, issueNumber: issue.number };
  },

  /**
   * Update an incident's status.
   */
  async updateStatus(incidentId, userId, status) {
    const incident = await prisma.debugIncident.findFirst({
      where: { id: incidentId, userId },
    });
    if (!incident) throw new Error("Incident not found");

    const data = { status };
    if (status === "resolved") data.resolvedAt = new Date();

    return prisma.debugIncident.update({ where: { id: incidentId }, data });
  },

  /**
   * Delete an incident.
   */
  async deleteIncident(incidentId, userId) {
    const incident = await prisma.debugIncident.findFirst({
      where: { id: incidentId, userId },
    });
    if (!incident) throw new Error("Incident not found");
    await prisma.debugIncident.delete({ where: { id: incidentId } });
    return { deleted: true };
  },
};
