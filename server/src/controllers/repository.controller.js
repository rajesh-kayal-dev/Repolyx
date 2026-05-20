import { repositoryService } from "../services/repository.service.js";
import { scannerService } from "../services/scanner.service.js";
import { analysisService } from "../services/analysis.service.js";
import { aiService as legacyAiService } from "../services/ai.service.js";
import { aiService } from "../modules/ai/services/ai.service.js";
import { contextEngine } from "../modules/ai/context/context.engine.js";
import { promptTemplates } from "../modules/ai/prompts/templates.js";
import { generateCompletion } from "../modules/ai/providers/index.js";
import { eventService } from "../services/event.service.js";
import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

export const fetchAvailableRepositories = async (req, res, next) => {
  try {
    if (!req.user || !req.user.githubAccessToken) {
      return res.status(401).json({
        success: false,
        message: "GitHub access token not found. Please reconnect your GitHub account.",
      });
    }

    const [githubRepos, importedRepos] = await Promise.all([
      repositoryService.fetchGithubRepositories(req.user.githubAccessToken),
      repositoryService.getImportedRepositories(req.user.id),
    ]);

    const importedGithubIds = new Set(importedRepos.map((r) => r.githubRepoId));

    const annotatedRepos = githubRepos.map((r) => ({
      ...r,
      isImported: importedGithubIds.has(r.id),
    }));

    res.json({
      success: true,
      repositories: annotatedRepos,
      importedRepositories: importedRepos,
    });
  } catch (error) {
    logger.error("Error in fetchAvailableRepositories:", error);
    next(error);
  }
};

export const getImportedRepositories = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const repos = await repositoryService.getImportedRepositories(req.user.id);
    res.json({ success: true, repositories: repos });
  } catch (error) {
    logger.error("Error in getImportedRepositories:", error);
    next(error);
  }
};

export const importRepository = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { repoData } = req.body;

    if (!repoData || !repoData.id) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body. Expected { repoData: { id, name, ... } }",
      });
    }

    const savedRepo = await repositoryService.importRepository(req.user.id, repoData);

    await eventService.createEvent(
      savedRepo.id,
      "imported",
      `Repository "${savedRepo.name}" imported successfully`
    );

    res.json({ success: true, repository: savedRepo });
  } catch (error) {
    logger.error("Error in importRepository:", error);
    next(error);
  }
};

export const getRepositoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const repo = await prisma.repository.findFirst({
      where: {
        OR: [
          { id },
          { githubRepoId: id },
        ],
      },
      include: {
        files: true,
        events: { orderBy: { createdAt: "desc" }, take: 20 },
        analyses: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    res.json({ success: true, repository: repo });
  } catch (error) {
    logger.error("Error in getRepositoryById:", error);
    next(error);
  }
};

export const importAndScanRepository = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!req.user.githubAccessToken) {
      return res.status(401).json({ success: false, message: "GitHub token not found" });
    }

    const { repoData, branch } = req.body;

    if (!repoData || !repoData.id) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body. Expected { repoData: { id, name, ... } }",
      });
    }

    const savedRepo = await repositoryService.importRepository(req.user.id, repoData);

    await eventService.createEvent(
      savedRepo.id,
      "imported",
      `Repository "${savedRepo.name}" imported successfully`
    );

    await prisma.repository.update({
      where: { id: savedRepo.id },
      data: { scanStatus: "scanning" },
    });

    await eventService.createEvent(savedRepo.id, "indexed", "Started scanning repository...");

    const [owner, repoName] = savedRepo.fullName.split("/");
    const targetBranch = branch || savedRepo.defaultBranch || "HEAD";

    const scanResult = await scannerService.scanRepository(
      req.user.githubAccessToken,
      owner,
      repoName,
      targetBranch
    );

    await prisma.repositoryFile.deleteMany({ where: { repositoryId: savedRepo.id } });

    if (scanResult.files.length > 0) {
      await prisma.repositoryFile.createMany({
        data: scanResult.files.map((f) => ({
          repositoryId: savedRepo.id,
          path: f.path,
          name: f.name,
          extension: f.extension,
          size: f.size,
          type: f.type,
          isImportant: f.isImportant || false,
          modulePurpose: f.modulePurpose || null,
        })),
      });
    }

    await prisma.repository.update({
      where: { id: savedRepo.id },
      data: {
        scanStatus: "completed",
        isIndexed: true,
        fileCount: scanResult.summary.totalFiles,
        dependencyCount: scanResult.summary.totalDependencies,
        branchCount: scanResult.summary.totalBranches,
        techStack: scanResult.frameworks.join(", ") || savedRepo.language,
      },
    });

    await eventService.createEvent(
      savedRepo.id,
      "indexed",
      `Scanned ${scanResult.summary.totalFiles} files with ${scanResult.summary.totalDependencies} dependencies across ${scanResult.summary.totalBranches} branches`,
      { totalFiles: scanResult.summary.totalFiles, totalDeps: scanResult.summary.totalDependencies }
    );

    const summaryData = {
      name: savedRepo.name,
      description: savedRepo.description,
      language: savedRepo.language,
      frameworks: scanResult.frameworks,
      totalFiles: scanResult.summary.totalFiles,
      totalDependencies: scanResult.summary.totalDependencies,
      totalBranches: scanResult.summary.totalBranches,
      totalAuthFlows: scanResult.authFlows.length,
      totalAPIRoutes: scanResult.apiRoutes.length,
      files: scanResult.files,
    };

    const summary = await legacyAiService.generateSummary(summaryData);

    await prisma.repository.update({
      where: { id: savedRepo.id },
      data: { aiSummary: summary },
    });

    await eventService.createEvent(savedRepo.id, "summary_generated", "AI repository summary generated");

    const fullRepo = await prisma.repository.findUnique({
      where: { id: savedRepo.id },
      include: {
        files: true,
        events: { orderBy: { createdAt: "desc" }, take: 20 },
        analyses: { orderBy: { createdAt: "desc" } },
      },
    });

    res.json({
      success: true,
      repository: fullRepo,
      scanResult: {
        summary: scanResult.summary,
        frameworks: scanResult.frameworks,
        authFlows: scanResult.authFlows,
        apiRoutes: scanResult.apiRoutes,
        branches: scanResult.branches,
      },
    });
  } catch (error) {
    logger.error("Error in importAndScanRepository:", error);
    try {
      if (req.body?.repoData) {
        const existing = await prisma.repository.findUnique({ where: { githubRepoId: req.body.repoData.id } });
        if (existing) {
          await prisma.repository.update({ where: { id: existing.id }, data: { scanStatus: "failed" } });
        }
      }
    } catch {}
    next(error);
  }
};

export const scanRepository = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repo = await prisma.repository.findUnique({ where: { id } });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    if (!req.user || !req.user.githubAccessToken) {
      return res.status(401).json({ success: false, message: "GitHub token not found" });
    }

    await prisma.repository.update({
      where: { id },
      data: { scanStatus: "scanning" },
    });

    await eventService.createEvent(id, "indexed", "Started scanning repository...");

    const [owner, repoName] = repo.fullName.split("/");
    const branch = req.query.branch || repo.defaultBranch || "HEAD";

    const scanResult = await scannerService.scanRepository(
      req.user.githubAccessToken,
      owner,
      repoName,
      branch
    );

    await prisma.repositoryFile.deleteMany({ where: { repositoryId: id } });

    if (scanResult.files.length > 0) {
      await prisma.repositoryFile.createMany({
        data: scanResult.files.map((f) => ({
          repositoryId: id,
          path: f.path,
          name: f.name,
          extension: f.extension,
          size: f.size,
          type: f.type,
          isImportant: f.isImportant || false,
          modulePurpose: f.modulePurpose || null,
        })),
      });
    }

    await prisma.repository.update({
      where: { id },
      data: {
        scanStatus: "completed",
        isIndexed: true,
        fileCount: scanResult.summary.totalFiles,
        dependencyCount: scanResult.summary.totalDependencies,
        branchCount: scanResult.summary.totalBranches,
        techStack: scanResult.frameworks.join(", ") || repo.language,
      },
    });

    await eventService.createEvent(
      id,
      "indexed",
      `Scanned ${scanResult.summary.totalFiles} files with ${scanResult.summary.totalDependencies} dependencies across ${scanResult.summary.totalBranches} branches`,
      { totalFiles: scanResult.summary.totalFiles, totalDeps: scanResult.summary.totalDependencies }
    );

    res.json({
      success: true,
      scanResult: {
        summary: scanResult.summary,
        frameworks: scanResult.frameworks,
        authFlows: scanResult.authFlows,
        apiRoutes: scanResult.apiRoutes,
        branches: scanResult.branches,
        packageJson: scanResult.packageJson,
      },
    });
  } catch (error) {
    logger.error("Error in scanRepository:", error);
    try {
      await prisma.repository.update({
        where: { id: req.params.id },
        data: { scanStatus: "failed" },
      });
    } catch {}
    next(error);
  }
};

export const getFileTree = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repo = await prisma.repository.findUnique({ where: { id } });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    const files = await prisma.repositoryFile.findMany({
      where: { repositoryId: id },
      orderBy: { path: "asc" },
    });

    const tree = buildFileTree(files);

    res.json({ success: true, tree, files });
  } catch (error) {
    logger.error("Error in getFileTree:", error);
    next(error);
  }
};

export const getBranches = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repo = await prisma.repository.findUnique({ where: { id } });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    if (!req.user || !req.user.githubAccessToken) {
      return res.status(401).json({ success: false, message: "GitHub token not found" });
    }

    const [owner, repoName] = repo.fullName.split("/");
    const branches = await scannerService.fetchBranches(
      req.user.githubAccessToken,
      owner,
      repoName
    );

    const defaultBranch = repo.defaultBranch || "main";
    const sorted = [
      branches.find((b) => b.name === defaultBranch),
      ...branches.filter((b) => b.name !== defaultBranch),
    ].filter(Boolean);

    res.json({ success: true, branches: sorted, defaultBranch });
  } catch (error) {
    logger.error("Error in getBranches:", error);
    next(error);
  }
};

export const getFileContent = async (req, res, next) => {
  try {
    const { id, fileId } = req.params;
    const repo = await prisma.repository.findUnique({ where: { id } });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    const file = await prisma.repositoryFile.findUnique({ where: { id: fileId } });

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    if (!req.user || !req.user.githubAccessToken) {
      return res.status(401).json({ success: false, message: "GitHub token not found" });
    }

    const [owner, repoName] = repo.fullName.split("/");
    const branch = req.query.branch || repo.defaultBranch || "HEAD";

    const content = await scannerService.fetchFileContent(
      req.user.githubAccessToken,
      owner,
      repoName,
      file.path,
      branch
    );

    const explanation = await legacyAiService.generateFileExplanation(file);

    res.json({ success: true, file: { ...file, content, explanation } });
  } catch (error) {
    logger.error("Error in getFileContent:", error);
    next(error);
  }
};

export const generateSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repo = await prisma.repository.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    await eventService.createEvent(id, "summary_generated", "Generating AI repository summary...");

    const [owner, repoName] = repo.fullName.split("/");

    let frameworks = [];
    let authFlows = [];

    if (req.user?.githubAccessToken) {
      const scanResult = await scannerService.scanRepository(
        req.user.githubAccessToken,
        owner,
        repoName,
        repo.defaultBranch || "HEAD"
      );
      frameworks = scanResult.frameworks;
      authFlows = scanResult.authFlows;
    }

    const summaryData = {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      frameworks,
      totalFiles: repo.fileCount || repo.files.length,
      totalDependencies: repo.dependencyCount,
      totalBranches: repo.branchCount,
      totalAuthFlows: authFlows.length,
      totalAPIRoutes: 0,
      files: repo.files,
    };

    const summary = await legacyAiService.generateSummary(summaryData);

    await prisma.repository.update({
      where: { id },
      data: { aiSummary: summary },
    });

    await eventService.createEvent(id, "summary_generated", "AI repository summary generated");

    res.json({ success: true, summary });
  } catch (error) {
    logger.error("Error in generateSummary:", error);
    next(error);
  }
};

export const runAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const repo = await prisma.repository.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    const validTypes = ["architecture", "dependencies", "auth", "api", "security"];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid analysis type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    let summary = "";
    let files, packageJson, frameworks, authFlows, apiRoutes;

    if (req.user?.githubAccessToken) {
      const [owner, repoName] = repo.fullName.split("/");
      const scanResult = await scannerService.scanRepository(
        req.user.githubAccessToken,
        owner,
        repoName,
        repo.defaultBranch || "HEAD"
      );
      files = scanResult.files;
      packageJson = scanResult.packageJson;
      frameworks = scanResult.frameworks;
      authFlows = scanResult.authFlows;
      apiRoutes = scanResult.apiRoutes;
    } else {
      files = repo.files;
    }

    switch (type) {
      case "architecture":
        summary = await analysisService.analyzeArchitecture(id, files, frameworks, packageJson);
        break;
      case "dependencies":
        const depResult = await analysisService.analyzeDependencies(id, packageJson);
        summary = depResult?.summary || "No dependencies found";
        break;
      case "auth":
        summary = await analysisService.analyzeAuthFlow(id, authFlows || [], files);
        break;
      case "api":
        summary = await analysisService.analyzeAPI(id, apiRoutes || []);
        break;
      default:
        summary = "Analysis completed";
    }

    await eventService.createEvent(
      id,
      "analyzed",
      `Analysis "${type}" completed for ${repo.name}`,
      { type }
    );

    const lastAnalysis = await prisma.repositoryAnalysis.findFirst({
      where: { repositoryId: id, type },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, analysis: lastAnalysis || { type, summary } });
  } catch (error) {
    logger.error("Error in runAnalysis:", error);
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const events = await eventService.getEvents(id, limit, offset);
    res.json({ success: true, events });
  } catch (error) {
    logger.error("Error in getEvents:", error);
    next(error);
  }
};

export const queryRepository = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { query, selectedFile, selectedBranch } = req.body;

    const repo = await prisma.repository.findUnique({
      where: { id },
      include: { files: { take: 200 } },
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    if (!req.user?.githubAccessToken) {
      return res.status(401).json({ success: false, message: "GitHub token not found" });
    }

    const context = await contextEngine.buildContext(id, req.user.githubAccessToken, {
      activeFilePath: selectedFile || null,
      selectedBranch: selectedBranch || repo.defaultBranch || "main",
      userMessage: query,
    });

    const formattedContext = promptTemplates.formatContext(context);
    const systemInstruction = `${promptTemplates.systemPrompt}\n\n${formattedContext}`;

    const apiMessages = [
      { role: "user", content: query }
    ];

    const aiResult = await generateCompletion(apiMessages, {
      heavy: true,
      system: systemInstruction,
    });

    const referencedFiles = aiService.extractReferencedFiles ? 
      aiService.extractReferencedFiles(aiResult.text, context) : [];

    res.json({ 
      success: true, 
      answer: aiResult.text, 
      context: {
        ...context.analysis,
        referencedFiles,
        provider: aiResult.provider,
        model: aiResult.model,
      }
    });
  } catch (error) {
    logger.error("Error in queryRepository:", error);
    next(error);
  }
};

export const getAnalyses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analyses = await prisma.repositoryAnalysis.findMany({
      where: { repositoryId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, analyses });
  } catch (error) {
    logger.error("Error in getAnalyses:", error);
    next(error);
  }
};

function buildFileTree(files) {
  const root = { name: "root", path: "", type: "directory", children: [] };

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current.children.push({
          id: file.id,
          name: file.name,
          path: file.path,
          extension: file.extension,
          size: file.size,
          type: "file",
          isImportant: file.isImportant,
          modulePurpose: file.modulePurpose,
        });
      } else {
        let existing = current.children.find((c) => c.type === "directory" && c.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            type: "directory",
            children: [],
          };
          current.children.push(existing);
        }
        current = existing;
      }
    });
  });

  return root.children;
}
