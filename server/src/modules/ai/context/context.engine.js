import prisma from "../../../database/prisma.js";
import { scannerService } from "../../../services/scanner.service.js";
import { contextSizeLimiter } from "../utils/context-limiter.js";
import { redisCache } from "../cache/redis.service.js";
import logger from "../../../utils/logger.js";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".repolyx-cache");
const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(repositoryId, type) {
  return `${repositoryId}-${type}`;
}

function readFileCache(key) {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Date.now() - data.timestamp > CACHE_TTL) {
      fs.unlinkSync(filePath);
      return null;
    }
    return data.value;
  } catch {
    return null;
  }
}

function writeFileCache(key, value) {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ timestamp: Date.now(), value }));
  } catch (err) {
    logger.warn(`Failed to write cache for ${key}: ${err.message}`);
  }
}

const INTENT_KEYWORD_MAP = {
  auth: ["auth", "passport", "jwt", "session", "login", "oauth", "signin", "signup", "cookie", "middleware", "permission", "role", "guard", "token", "bearer", "credentials", "protect", "authorize", "verify"],
  database: ["prisma", "sequelize", "mongoose", "db", "database", "schema", "migration", "model", "entity", "repository", "knex", "typeorm", "neon", "postgres", "mysql", "mongodb", "redis", "query", "orm"],
  api: ["route", "router", "controller", "endpoint", "handler", "express", "rest", "graphql", "trpc", "api", "http", "request", "response", "fetch", "axios"],
  config: ["config", "env", "dotenv", "setting", "environment", "constant", "secret", "variable", "setup", "init", "bootstrap"],
  middleware: ["middleware", "interceptor", "guard", "hook", "before", "after", "plugin", "pipe", "stack"],
  frontend: ["component", "page", "view", "layout", "react", "next", "vue", "angular", "tsx", "jsx", "render", "ui", "dom"],
  testing: ["test", "spec", "jest", "cypress", "mocha", "vitest", "playwright", "assert", "mock", "stub"],
  docker: ["docker", "dockerfile", "compose", "container", "kubernetes", "k8s", "deploy", "image"],
  ci: ["github actions", "gitlab", "circleci", "workflow", "pipeline", "ci", "cd", "deploy", "build"],
  main: ["main", "index", "server", "app", "entry", "bootstrap", "start", "root"],
  security: ["security", "cors", "helmet", "rate-limit", "sanitize", "validate", "encrypt", "hash", "csrf", "xss"],
  state: ["store", "redux", "zustand", "context", "state", "provider", "atom", "signal"],
  styling: ["css", "tailwind", "styled", "scss", "sass", "theme", "design", "style"],
};

const FILE_SCORE_WEIGHTS = {
  auth: 10,
  middleware: 9,
  config: 8,
  security: 8,
  api: 7,
  database: 7,
  main: 5,
  frontend: 4,
  docker: 3,
  state: 4,
  styling: 2,
  testing: 2,
  ci: 2,
};

const FILE_TYPE_IMPORTANCE = {
  ".ts": 3, ".tsx": 3, ".js": 2, ".jsx": 2,
  ".mjs": 2, ".cjs": 2,
  ".py": 3, ".go": 3, ".java": 3, ".rs": 3,
  ".json": 1, ".yaml": 1, ".yml": 1, ".toml": 1,
  ".md": 1, ".css": 1, ".scss": 1, ".sass": 1,
};

async function readCache(key) {
  const redisResult = await redisCache.get(key);
  if (redisResult !== null) return redisResult;
  return readFileCache(key);
}

function writeCache(key, value) {
  redisCache.set(key, value, 3600);
  writeFileCache(key, value);
}

export const contextEngine = {
  extractQueryIntent(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const detectedIntents = [];
    const allKeywords = [];
    const keywordMatches = [];

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORD_MAP)) {
      const matchedKeywords = [];
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          matchedKeywords.push(keyword);
          if (!allKeywords.includes(keyword)) {
            allKeywords.push(keyword);
          }
        }
      }
      if (matchedKeywords.length > 0) {
        if (!detectedIntents.includes(intent)) {
          detectedIntents.push(intent);
        }
        keywordMatches.push({ intent, keywords: matchedKeywords });
      }
    }

    if (detectedIntents.length === 0) {
      detectedIntents.push("main", "api", "config");
      allKeywords.push("main", "index", "server", "app", "route", "config");
      keywordMatches.push({ intent: "general", keywords: allKeywords });
    }

    detectedIntents.sort((a, b) => (FILE_SCORE_WEIGHTS[b] || 1) - (FILE_SCORE_WEIGHTS[a] || 1));

    return { detectedIntents, keywords: allKeywords, keywordMatches };
  },

  findRelevantFiles(allFiles, detectedIntents, keywords) {
    const scoredFiles = [];

    for (const file of allFiles) {
      let score = 0;
      const lowerPath = file.path.toLowerCase();
      const ext = file.extension?.toLowerCase() || "";
      const fileTypeScore = FILE_TYPE_IMPORTANCE[ext] || 1;

      for (const keyword of keywords) {
        if (lowerPath.includes(keyword)) {
          score += 3 * fileTypeScore;
        }
      }

      for (const intent of detectedIntents) {
        const weight = FILE_SCORE_WEIGHTS[intent] || 1;
        if (file.modulePurpose && file.modulePurpose === intent) {
          score += weight * 2;
        }
        const intentKeywords = INTENT_KEYWORD_MAP[intent] || [];
        for (const keyword of intentKeywords) {
          if (lowerPath.includes(keyword)) {
            score += 2 * fileTypeScore;
          }
        }
      }

      if (file.isImportant) {
        score += 2;
      }

      const pathDepth = file.path.split("/").length;
      if (pathDepth <= 3) {
        score += 1;
      }

      if (score > 0) {
        scoredFiles.push({ file, score });
      }
    }

    scoredFiles.sort((a, b) => b.score - a.score);
    return scoredFiles.slice(0, 8).map(s => s.file);
  },

  detectImports(content) {
    const imports = [];
    const importRegex = /(?:import\s+(?:type\s+)?(?:{[^}]+}|[\w]+)\s+from\s+['"]([^'"]+)['"])|(?:require\(['"]([^'"]+)['"]\))/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imp = match[1] || match[2];
      if (imp) {
        if (imp.startsWith(".")) {
          imports.push({ path: imp, type: "local" });
        } else {
          imports.push({ path: imp, type: "external" });
        }
      }
    }
    return imports;
  },

  detectExports(content) {
    const exports = [];
    const exportRegex = /(?:export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+))|(?:export\s+{([^}]+)})/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1]) {
        exports.push(match[1]);
      } else if (match[2]) {
        match[2].split(",").forEach(e => exports.push(e.trim()));
      }
    }
    return [...new Set(exports)];
  },

  async buildFileIndexAsync(repositoryId, githubAccessToken, owner, repo, branch) {
    const cacheKey = getCacheKey(repositoryId, "file-index");
    const cached = await readCache(cacheKey);
    if (cached) return cached;

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { files: { take: 500 } },
    });

    if (!repository) {
      throw new Error("Repository not found in database");
    }

    const categories = {
      authFiles: [],
      apiFiles: [],
      databaseFiles: [],
      configFiles: [],
      middlewareFiles: [],
      importantFiles: [],
      topLevelFiles: [],
    };

    const directories = new Set();

    repository.files.forEach(f => {
      const parts = f.path.split("/");
      if (parts.length > 1) {
        for (let i = 0; i < parts.length - 1; i++) {
          directories.add(parts.slice(0, i + 1).join("/"));
        }
      }
      if (f.isImportant) categories.importantFiles.push(f.path);
      if (parts.length === 1) categories.topLevelFiles.push(f.path);
      if (f.modulePurpose === "auth") categories.authFiles.push(f.path);
      if (f.modulePurpose === "api") categories.apiFiles.push(f.path);
      if (f.modulePurpose === "database") categories.databaseFiles.push(f.path);
      if (f.modulePurpose === "config") categories.configFiles.push(f.path);
      if (f.modulePurpose === "middleware") categories.middlewareFiles.push(f.path);
    });

    const fileIndex = {
      files: repository.files.map(f => ({
        path: f.path,
        name: f.name,
        extension: f.extension,
        size: f.size,
        isImportant: f.isImportant,
        modulePurpose: f.modulePurpose,
      })),
      directories: Array.from(directories),
      ...categories,
    };

    writeCache(cacheKey, fileIndex);
    return fileIndex;
  },

  buildFileIndex(repositoryId, githubAccessToken, owner, repo, branch) {
    return this.buildFileIndexAsync(repositoryId, githubAccessToken, owner, repo, branch);
  },

  async buildContext(repositoryId, githubAccessToken, options = {}) {
    const { activeFilePath, selectedBranch, userMessage } = options;

    try {
      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: { files: { take: 500 } },
      });

      if (!repository) {
        throw new Error("Repository not found in database");
      }

      const branch = selectedBranch || repository.defaultBranch || "main";
      const [owner, repoName] = repository.fullName.split("/");

      let detectedIntents = ["main"];
      let intentKeywords = [];
      let keywordMatches = [];

      if (userMessage) {
        const intentResult = this.extractQueryIntent(userMessage);
        detectedIntents = intentResult.detectedIntents;
        intentKeywords = intentResult.keywords;
        keywordMatches = intentResult.keywordMatches;
      }

      let activeFileMeta = null;
      let activeFileContent = null;
      let activeFileImports = [];
      let activeFileExports = [];

      if (activeFilePath) {
        activeFileMeta = repository.files.find(f => f.path === activeFilePath);
        if (activeFileMeta) {
          const cacheKey = getCacheKey(repositoryId, `content-${activeFilePath.replace(/\//g, "-")}`);
          const cachedContent = readCache(cacheKey);

          if (cachedContent) {
            activeFileContent = cachedContent;
          } else {
            activeFileContent = await scannerService.fetchFileContent(
              githubAccessToken, owner, repoName, activeFilePath, branch
            ).catch(err => {
              logger.warn(`Failed to fetch active file ${activeFilePath}: ${err.message}`);
              return null;
            });
            if (activeFileContent) {
              writeCache(cacheKey, activeFileContent);
            }
          }

          if (activeFileContent) {
            activeFileImports = this.detectImports(activeFileContent);
            activeFileExports = this.detectExports(activeFileContent);
          }
        }
      }

      const relevantFiles = this.findRelevantFiles(repository.files, detectedIntents, intentKeywords);

      const filesToFetch = relevantFiles
        .filter(f => !activeFilePath || f.path !== activeFilePath)
        .slice(0, contextSizeLimiter.getMaxRelatedFiles());

      const fetchedRelatedFiles = [];
      await Promise.all(
        filesToFetch.map(async (file) => {
          try {
            const cacheKey = getCacheKey(repositoryId, `content-${file.path.replace(/\//g, "-")}`);
            let content = readCache(cacheKey);

            if (!content) {
              content = await scannerService.fetchFileContent(
                githubAccessToken, owner, repoName, file.path, branch
              );
              if (content) {
                writeCache(cacheKey, content);
              }
            }

            if (content) {
              fetchedRelatedFiles.push({
                path: file.path,
                purpose: file.modulePurpose,
                content: contextSizeLimiter.limitFileContent(content),
                imports: this.detectImports(content).filter(i => i.type === "local").slice(0, 5),
                exports: this.detectExports(content).slice(0, 5),
              });
            }
          } catch (err) {
            logger.warn(`Failed to fetch related file ${file.path}: ${err.message}`);
          }
        })
      );

      const fileIndex = await this.buildFileIndexAsync(repositoryId, githubAccessToken, owner, repoName, branch);

      const analysisMetadata = {
        detectedIntents,
        keywordMatches,
        matchedFiles: relevantFiles.map(f => ({
          path: f.path,
          purpose: f.modulePurpose,
        })),
        filesFetched: fetchedRelatedFiles.length + (activeFileContent ? 1 : 0),
        totalFilesInRepo: repository.fileCount || repository.files.length,
        directories: fileIndex.directories.slice(0, 10),
        importantFiles: fileIndex.importantFiles.slice(0, 15),
        authFiles: fileIndex.authFiles,
        apiFiles: fileIndex.apiFiles,
        databaseFiles: fileIndex.databaseFiles,
        configFiles: fileIndex.configFiles,
        middlewareFiles: fileIndex.middlewareFiles,
      };

      logger.info(
        `Context built for "${userMessage || "unknown query"}": intents=[${detectedIntents.join(",")}], files=${analysisMetadata.filesFetched}`
      );

      return {
        repository: {
          name: repository.name,
          fullName: repository.fullName,
          description: repository.description,
          techStack: repository.techStack,
          aiSummary: repository.aiSummary,
          language: repository.language,
          fileCount: repository.fileCount,
          dependencyCount: repository.dependencyCount,
          branchCount: repository.branchCount,
        },
        activeFile: activeFileMeta ? {
          path: activeFileMeta.path,
          purpose: activeFileMeta.modulePurpose,
          content: activeFileContent,
          imports: activeFileImports,
          exports: activeFileExports,
        } : null,
        relatedFiles: contextSizeLimiter.limitRelatedFiles(fetchedRelatedFiles),
        fileIndex,
        branch,
        analysis: analysisMetadata,
      };
    } catch (error) {
      logger.error("Error building context in Context Engine:", error);
      throw error;
    }
  },
};
