import prisma from "../../../database/prisma.js";
import { generateCompletion } from "../../ai/providers/index.js";
import { reviewPromptTemplates } from "../prompts/review.prompts.js";
import logger from "../../../utils/logger.js";
import { Octokit } from "@octokit/rest";

const GITHUB_PR_REGEX = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;

function parsePrUrl(url) {
  const match = url.match(GITHUB_PR_REGEX);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    prNumber: parseInt(match[3], 10),
  };
}

function parseDiffContent(diffText) {
  const files = [];
  const fileBlocks = diffText.split(/^diff --git /m).filter(b => b.trim());

  for (const block of fileBlocks) {
    const headerMatch = block.match(/^a\/(\S+)\s+b\/(\S+)/m);
    if (!headerMatch) continue;

    const path = headerMatch[2];
    let status = "modified";

    const newFileMatch = block.match(/^new file mode/m);
    const deletedFileMatch = block.match(/^deleted file mode/m);

    if (newFileMatch) status = "added";
    if (deletedFileMatch) status = "deleted";

    const additions = (block.match(/^\+/gm) || []).length;
    const deletions = (block.match(/^-/gm) || []).length;

    files.push({
      path,
      status,
      additions: Math.max(0, additions - 1),
      deletions: Math.max(0, deletions - 1),
      patch: block.trim(),
    });
  }

  return files;
}

async function fetchPrFromGithub(githubAccessToken, owner, repo, prNumber) {
  const octokit = new Octokit({ auth: githubAccessToken });

  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: prFiles } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  const files = prFiles.map(f => ({
    path: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    patch: f.patch || null,
    content: null,
  }));

  return {
    title: pr.title,
    author: pr.user?.login || "unknown",
    baseBranch: pr.base?.ref || "main",
    headBranch: pr.head?.ref || "main",
    description: pr.body || "",
    files,
    prUrl: pr.html_url,
  };
}

async function parseSuggestionsFromResponse(aiText) {
  try {
    const cleaned = aiText
      .replace(/^```(json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return null;
  } catch (err) {
    logger.warn("Failed to parse AI review response as JSON:", err.message);
    return null;
  }
}

async function listRecentPrsFromGithub(githubAccessToken, owner, repo, perPage = 10) {
  const octokit = new Octokit({ auth: githubAccessToken });

  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    sort: "updated",
    direction: "desc",
    per_page: perPage,
  });

  return prs.map(pr => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login || "unknown",
    baseBranch: pr.base?.ref || "main",
    headBranch: pr.head?.ref || "main",
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    labels: pr.labels?.map(l => ({ name: l.name, color: l.color })) || [],
    draft: pr.draft || false,
    url: pr.html_url,
  }));
}

export const reviewService = {
  async listPrs(userId, repositoryId, perPage = 10) {
    const repository = await prisma.repository.findFirst({
      where: { id: repositoryId, userId },
    });
    if (!repository) {
      throw new Error("Repository not found or not accessible");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.githubAccessToken) {
      throw new Error("GitHub token not configured");
    }

    const parts = repository.fullName.split("/");
    if (parts.length !== 2) {
      throw new Error("Invalid repository name");
    }

    const prs = await listRecentPrsFromGithub(user.githubAccessToken, parts[0], parts[1], perPage);
    return prs;
  },

  async create(userId, repositoryId, options = {}) {
    const { prUrl, diffContent, title } = options;

    const repository = await prisma.repository.findFirst({
      where: { id: repositoryId, userId },
    });
    if (!repository) {
      throw new Error("Repository not found or not accessible");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    if (prUrl) {
      const parsed = parsePrUrl(prUrl);
      if (!parsed) {
        throw new Error("Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123");
      }

      const prData = await fetchPrFromGithub(user.githubAccessToken, parsed.owner, parsed.repo, parsed.prNumber);

      const session = await prisma.reviewSession.create({
        data: {
          repositoryId,
          userId,
          prUrl: prData.prUrl,
          prNumber: parsed.prNumber,
          title: title || prData.title,
          baseBranch: prData.baseBranch,
          headBranch: prData.headBranch,
          author: prData.author,
          status: "pending",
          files: {
            create: prData.files.map(f => ({
              path: f.path,
              status: f.status,
              additions: f.additions,
              deletions: f.deletions,
              patch: f.patch,
            })),
          },
        },
        include: {
          files: true,
          suggestions: true,
        },
      });

      return session;
    }

    if (diffContent) {
      const files = parseDiffContent(diffContent);

      const session = await prisma.reviewSession.create({
        data: {
          repositoryId,
          userId,
          title: title || "Manual Diff Review",
          status: "pending",
          files: {
            create: files.map(f => ({
              path: f.path,
              status: f.status,
              additions: f.additions,
              deletions: f.deletions,
              patch: f.patch,
            })),
          },
        },
        include: {
          files: true,
          suggestions: true,
        },
      });

      return session;
    }

    throw new Error("Either prUrl or diffContent is required");
  },

  async analyze(reviewId, userId, options = {}) {
    const session = await prisma.reviewSession.findFirst({
      where: { id: reviewId, userId },
      include: { files: true, repository: true },
    });
    if (!session) {
      throw new Error("Review session not found");
    }

    await prisma.reviewSession.update({
      where: { id: reviewId },
      data: { status: "analyzing" },
    });

    try {
      const currentFiles = session.files || [];
      
      // Search-first: check if there's an existing completed review with identical files & diffs
      const potentialMatches = await prisma.reviewSession.findMany({
        where: {
          repositoryId: session.repositoryId,
          status: "completed",
          NOT: { id: reviewId },
        },
        include: { files: true, suggestions: true },
      });

      const matchingSession = potentialMatches.find(pm => {
        const pmFiles = pm.files || [];
        if (pmFiles.length !== currentFiles.length) return false;

        return currentFiles.every(cf => {
          const pmf = pmFiles.find(f => f.path === cf.path);
          if (!pmf) return false;
          return (
            pmf.status === cf.status &&
            pmf.additions === cf.additions &&
            pmf.deletions === cf.deletions &&
            pmf.patch === cf.patch
          );
        });
      });

      if (matchingSession) {
        logger.info(`Cache hit! Reusing completed review from session ${matchingSession.id} for session ${reviewId}`);
        
        await prisma.reviewSuggestion.deleteMany({
          where: { reviewSessionId: reviewId },
        });

        for (const s of matchingSession.suggestions) {
          await prisma.reviewSuggestion.create({
            data: {
              reviewSessionId: reviewId,
              filePath: s.filePath,
              type: s.type,
              title: s.title,
              description: s.description,
              severity: s.severity,
              lineStart: s.lineStart,
              lineEnd: s.lineEnd,
              codeSnippet: s.codeSnippet,
            },
          });
        }

        const updated = await prisma.reviewSession.update({
          where: { id: reviewId },
          data: {
            status: "completed",
            riskLevel: matchingSession.riskLevel,
            mergeReady: matchingSession.mergeReady,
            testCoverage: matchingSession.testCoverage,
            ciStatus: matchingSession.ciStatus,
            summary: matchingSession.summary,
            report: matchingSession.report,
          },
          include: {
            files: true,
            suggestions: true,
          },
        });

        return updated;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      const diffContext = reviewPromptTemplates.formatDiffContext(
        session.repository,
        session.files
      );

      const systemInstruction = `${reviewPromptTemplates.systemPrompt}\n\n${diffContext}`;

      const completionOptions = {
        system: systemInstruction,
        ...(options.provider ? { provider: options.provider } : {}),
        ...(options.model ? { model: options.model } : {}),
        ...(!options.provider && !options.model ? { heavy: true } : {}),
      };

      const aiResult = await generateCompletion(
        [{ role: "user", content: "Review these code changes and return your findings as JSON." }],
        completionOptions
      );

      const parsed = await parseSuggestionsFromResponse(aiResult.text);

      if (parsed && parsed.suggestions) {
        const existingSuggestions = await prisma.reviewSuggestion.findMany({
          where: { reviewSessionId: reviewId },
        });
        if (existingSuggestions.length > 0) {
          await prisma.reviewSuggestion.deleteMany({
            where: { reviewSessionId: reviewId },
          });
        }

        for (const s of parsed.suggestions) {
          await prisma.reviewSuggestion.create({
            data: {
              reviewSessionId: reviewId,
              filePath: s.filePath || null,
              type: s.type || "quality",
              title: s.title || "Finding",
              description: s.description || "",
              severity: s.severity || "medium",
              lineStart: s.lineStart || null,
              lineEnd: s.lineEnd || null,
              codeSnippet: s.codeSnippet || null,
            },
          });
        }
      }

      const updated = await prisma.reviewSession.update({
        where: { id: reviewId },
        data: {
          status: "completed",
          riskLevel: parsed?.riskLevel || session.riskLevel,
          mergeReady: parsed?.mergeReady ?? session.mergeReady,
          testCoverage: parsed?.testCoverage || session.testCoverage,
          ciStatus: parsed?.ciStatus || session.ciStatus,
          summary: parsed?.summary || null,
          report: parsed?.report || null,
        },
        include: {
          files: true,
          suggestions: true,
        },
      });

      return updated;
    } catch (error) {
      logger.error("Review analysis failed:", error);

      await prisma.reviewSession.update({
        where: { id: reviewId },
        data: { status: "failed" },
      });

      throw error;
    }
  },

  async list(userId) {
    const sessions = await prisma.reviewSession.findMany({
      where: { userId },
      include: {
        _count: { select: { files: true, suggestions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Auto-heal any stuck sessions (analyzing for > 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    for (const s of sessions) {
      if (s.status === "analyzing" && s.updatedAt < fiveMinutesAgo) {
        logger.warn(`Auto-healing stuck review session ${s.id} in list view.`);
        await prisma.reviewSession.update({
          where: { id: s.id },
          data: { status: "failed" },
        });
        s.status = "failed";
      }
    }

    return sessions;
  },

  async get(reviewId, userId) {
    let session = await prisma.reviewSession.findFirst({
      where: { id: reviewId, userId },
      include: {
        files: { orderBy: { path: "asc" } },
        suggestions: { orderBy: { createdAt: "desc" } },
      },
    });

    // Auto-heal any stuck session (analyzing for > 5 minutes)
    if (session && session.status === "analyzing") {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (session.updatedAt < fiveMinutesAgo) {
        logger.warn(`Review session ${reviewId} is stuck in analyzing since ${session.updatedAt}. Marking as failed.`);
        session = await prisma.reviewSession.update({
          where: { id: reviewId },
          data: { status: "failed" },
          include: {
            files: { orderBy: { path: "asc" } },
            suggestions: { orderBy: { createdAt: "desc" } },
          },
        });
      }
    }

    return session;
  },

  async delete(reviewId, userId) {
    const session = await prisma.reviewSession.findFirst({
      where: { id: reviewId, userId },
    });
    if (!session) {
      throw new Error("Review session not found");
    }

    await prisma.reviewSession.delete({ where: { id: reviewId } });
  },
};
