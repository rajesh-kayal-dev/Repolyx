import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";
import { generateCompletion } from "../modules/ai/providers/index.js";

function buildContext(repo, analyses, files) {
  const archAnalysis = analyses.find((a) => a.type === "architecture");
  const apiAnalysis = analyses.find((a) => a.type === "api");
  const authAnalysis = analyses.find((a) => a.type === "auth");
  const depAnalysis = analyses.find((a) => a.type === "dependencies");

  const importantFiles = files.filter((f) => f.isImportant).slice(0, 20);
  const dbFiles = files.filter((f) =>
    f.path.includes("schema") || f.path.includes("migration") ||
    f.path.includes("prisma") || f.path.includes("database") ||
    f.path.includes("sql") || f.path.includes("model") ||
    f.extension === "prisma" || f.extension === "sql"
  );
  const deployFiles = files.filter((f) =>
    f.path.includes("Dockerfile") || f.path.includes("docker") ||
    f.path.includes("deploy") || f.path.includes("ci") ||
    f.path.includes(".github/workflows")
  );
  const envFiles = files.filter((f) =>
    f.path.includes(".env") || f.path.includes(".example") ||
    f.path.includes("config") || f.name === ".env.example" ||
    f.name === "docker-compose.yml"
  );

  const archData = archAnalysis?.data || {};
  const apiData = apiAnalysis?.data || {};
  const authData = authAnalysis?.data || {};
  const depData = depAnalysis?.data || {};

  let ctx = `Repository: ${repo.name || repo.fullName || "Unknown"}
Description: ${repo.description || "No description"}
Language: ${repo.language || "Unknown"}
Tech Stack: ${repo.techStack || "Not detected"}
Files: ${repo.fileCount || "N/A"}
Branches: ${repo.branchCount || "N/A"}
Dependencies: ${repo.dependencyCount || "N/A"}
`;
  if (repo.aiSummary) ctx += `AI Summary: ${repo.aiSummary}\n`;

  const dirs = archData.directories || archData.sourceDirs || [];
  if (dirs.length > 0) ctx += `\nDirectories:\n${dirs.map((d) => `  - ${d}`).join("\n")}\n`;

  const frameworks = archData.frameworks || [];
  if (frameworks.length > 0) ctx += `\nFrameworks: ${frameworks.join(", ")}\n`;

  const routes = apiData.routes || apiData.apiRoutes || [];
  if (routes.length > 0) {
    ctx += `\nAPI Routes:\n`;
    routes.forEach((r) => {
      ctx += `  ${(r.method || "GET").toUpperCase()} ${r.route || r.path || "/"} - ${r.summary || r.description || "No desc"}${r.auth || r.authRequired ? " [Auth]" : ""}\n`;
    });
  }

  const flows = authData.flows || authData.authFlows || [];
  if (flows.length > 0) {
    ctx += `\nAuth Flows:\n`;
    flows.forEach((f) => { ctx += `  - ${f.label || f.name}: ${f.status || "Review"}\n`; });
  }

  if (dbFiles.length > 0) {
    ctx += `\nDB Files:\n${dbFiles.slice(0, 10).map((f) => `  - ${f.path}`).join("\n")}\n`;
  }
  if (deployFiles.length > 0) {
    ctx += `\nDeploy Files:\n${deployFiles.slice(0, 8).map((f) => `  - ${f.path}`).join("\n")}\n`;
  }
  if (envFiles.length > 0) {
    ctx += `\nEnv Files:\n${envFiles.slice(0, 8).map((f) => `  - ${f.path}`).join("\n")}\n`;
  }

  ctx += `\nImportant Files:\n`;
  importantFiles.forEach((f) => {
    ctx += `  - ${f.path} (${f.modulePurpose || "source"}${f.aiAnalysis ? ": " + f.aiAnalysis.slice(0, 100) : ""})\n`;
  });

  const deps = depData.libraries || depData.dependencies || [];
  if (deps.length > 0) {
    ctx += `\nDependencies:\n`;
    deps.slice(0, 20).forEach((d) => { ctx += `  - ${d.name}@${d.version || "latest"}\n`; });
  }

  return ctx;
}

async function generateWithAI(ctx, repo) {
  const systemPrompt = `You are Repolyx AI, a professional documentation generator. Generate high-quality markdown documentation for a software repository. You MUST produce ALL 8 files listed below. Each file must be complete, accurate, and professional.

Return your response with each file separated by a marker like:
---FILE: README.md---
(content here)
---FILE: API.md---
(content here)

The files to generate:

1. **README.md** - Full README with: project name, description, badges (build, version, license), overview section, key features as a list, tech stack badges, quick start installation, detailed usage guide, API overview (if any), contributing guidelines, license info.

2. **API.md** - API documentation with: authentication section, base URL, all endpoints grouped by resource with method/route/auth/description tables, request/response examples in JSON code blocks, error codes table.

3. **ARCHITECTURE.md** - Architecture overview with: high-level architecture description, tech stack decisions explained, directory structure in a tree format, component relationships, data flow description, design patterns used.

4. **SETUP.md** - Setup guide with: prerequisites, step-by-step installation, environment variables table (name, description, required), common troubleshooting section.

5. **SECURITY.md** - Security documentation with: authentication flow description, security measures implemented, best practices checklist, security contact info.

6. **ENVIRONMENT.md** - Environment configuration with: all detected env files, configuration files table, common variables reference, deployment environment checklist.

7. **DEPLOYMENT.md** - Deployment guide with: build instructions, deployment options (Docker, cloud platform specific), CI/CD pipeline description, production checklist, environment variables needed in production.

8. **CHANGELOG.md** - Changelog with: version history, dates, changes grouped by type (Added, Changed, Fixed, Removed).

IMPORTANT RULES:
- Every file must start with a # heading and have meaningful content - no empty files
- Use proper markdown: tables, code blocks with language tags, lists, bold, horizontal rules
- Make each file at least 50 lines of content
- Be specific to this repository - use the actual data provided
- If data is missing for a section, note it constructively rather than leaving sections empty
- End each file with "---\n*Generated by Repolyx AI Documentation Workspace*"`;

  const userPrompt = `Generate complete markdown documentation for this repository. Here is all the data I have about it:

${ctx}

Remember to generate ALL 8 files (README.md, API.md, ARCHITECTURE.md, SETUP.md, SECURITY.md, ENVIRONMENT.md, DEPLOYMENT.md, CHANGELOG.md) separated by the ---FILE: marker. Each file must be thorough and professional.`;

  const result = await generateCompletion(
    [{ role: "user", content: userPrompt }],
    {
      system: systemPrompt,
      heavy: true,
      maxTokens: 8192,
      timeoutMs: 60000,
    }
  );

  if (!result.success || !result.text) {
    throw new Error("AI returned no content");
  }

  const text = result.text;
  const docs = {};
  const patterns = [
    "README.md", "API.md", "ARCHITECTURE.md", "SETUP.md",
    "SECURITY.md", "ENVIRONMENT.md", "DEPLOYMENT.md", "CHANGELOG.md",
  ];

  for (const filename of patterns) {
    const regex = new RegExp(
      `---FILE:\\s*${filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}---\\s*\\n([\\s\\S]*?)(?=\\n---FILE:|$)`,
      "i"
    );
    const match = text.match(regex);
    if (match && match[1].trim()) {
      docs[filename] = match[1].trim() + "\n\n---\n*Generated by Repolyx AI Documentation Workspace*";
    }
  }

  if (Object.keys(docs).length === 0) {
    const lines = text.split("\n");
    let currentFile = null;
    let currentContent = [];
    for (const line of lines) {
      const headerMatch = line.match(/^#+\s*(.+)/);
      if (headerMatch && !currentFile) {
        const title = headerMatch[1].toLowerCase();
        if (title.includes("readme") || title.includes("overview")) currentFile = "README.md";
        else if (title.includes("api")) currentFile = "API.md";
        else if (title.includes("architect")) currentFile = "ARCHITECTURE.md";
        else if (title.includes("setup") || title.includes("install")) currentFile = "SETUP.md";
        else if (title.includes("security") || title.includes("auth")) currentFile = "SECURITY.md";
        else if (title.includes("environment") || title.includes("env")) currentFile = "ENVIRONMENT.md";
        else if (title.includes("deploy")) currentFile = "DEPLOYMENT.md";
        else if (title.includes("change") || title.includes("changelog")) currentFile = "CHANGELOG.md";
        if (currentFile && !docs[currentFile]) {
          currentContent = [line];
          continue;
        }
      }
      if (currentFile) currentContent.push(line);
    }
    if (currentFile && currentContent.length > 0) {
      docs[currentFile] = currentContent.join("\n").trim();
    }
  }

  for (const filename of patterns) {
    if (!docs[filename]) {
      docs[filename] = `# ${filename.replace(".md", "")}\n\nDocumentation for this section could not be generated by AI.\n\n---\n*Generated by Repolyx AI Documentation Workspace*`;
    }
  }

  return docs;
}

function generateMissingDocs(sections) {
  const suggestions = [];
  const arch = sections.architecture;
  if (!arch?.directories?.length) suggestions.push({ type: "architecture", message: "Architecture section missing directory structure analysis" });
  if (!arch?.frameworks?.length) suggestions.push({ type: "architecture", message: "No frameworks detected in architecture analysis" });
  const api = sections.apis;
  if (!api?.routes?.length) suggestions.push({ type: "api", message: "No API endpoints documented - run API analysis first" });
  const auth = sections.auth;
  if (!auth?.flows?.length) suggestions.push({ type: "auth", message: "Authentication section missing - no auth flows detected" });
  if (!auth?.securityFindings?.length) suggestions.push({ type: "auth", message: "Security section missing findings - consider running security audit" });
  const db = sections.database;
  if (!db?.dbFiles?.length) suggestions.push({ type: "database", message: "No database schema files detected" });
  const env = sections.environment;
  if (!env?.envFiles?.length) suggestions.push({ type: "environment", message: "Missing environment configuration documentation" });
  const deploy = sections.deployment;
  if (!deploy?.deployFiles?.length) suggestions.push({ type: "deployment", message: "Missing deployment guide - no CI/CD or Docker config detected" });
  return suggestions;
}

async function buildArchitecture(analyses, files, repo) {
  const archAnalysis = analyses.find((a) => a.type === "architecture");
  const analysisData = archAnalysis?.data || {};
  const importantFiles = files.filter((f) => f.isImportant).slice(0, 15);
  return {
    title: "Architecture Overview",
    summary: archAnalysis?.summary || analysisData.summary || `Analysis of ${repo.name || repo.fullName} structure and organization.`,
    techStack: repo.techStack || "Not detected",
    language: repo.language || "Unknown",
    directories: analysisData.directories || analysisData.sourceDirs || [],
    frameworks: analysisData.frameworks || [],
    fileCount: repo.fileCount,
    branchCount: repo.branchCount,
    keyFiles: importantFiles.map((f) => ({ path: f.path, purpose: f.modulePurpose || "Source file", analysis: f.aiAnalysis?.slice(0, 200) || null })),
  };
}

async function buildAPIs(analyses, repo) {
  const apiAnalysis = analyses.find((a) => a.type === "api");
  const analysisData = apiAnalysis?.data || {};
  const routes = analysisData.routes || analysisData.apiRoutes || [];
  return {
    title: "API Documentation",
    summary: apiAnalysis?.summary || analysisData.summary || `API routes and endpoints in ${repo.name || repo.fullName}.`,
    routes: routes.map((r) => ({
      route: r.route || r.path || "/",
      method: (r.method || "GET").toUpperCase(),
      summary: r.summary || r.description || "No description",
      auth: r.auth || r.authRequired ? "Required" : "None",
    })),
    totalEndpoints: routes.length,
  };
}

async function buildAuth(analyses, repo) {
  const authAnalysis = analyses.find((a) => a.type === "auth");
  const analysisData = authAnalysis?.data || {};
  const flows = analysisData.flows || analysisData.authFlows || [];
  return {
    title: "Authentication & Authorization",
    summary: authAnalysis?.summary || analysisData.summary || "Auth flow analysis of the repository.",
    flows: flows.map((f) => ({ label: f.label || f.name || "Auth flow", detail: f.detail || f.description || "Authentication process", status: f.status === "Secure" ? "Secure" : f.status || "Review" })),
    securityFindings: analysisData.findings || analysisData.securityIssues || [],
  };
}

async function buildDatabase(analyses, files, repo) {
  const dbFiles = files.filter((f) => f.path.includes("schema") || f.path.includes("migration") || f.path.includes("prisma") || f.path.includes("database") || f.path.includes("db") || f.path.includes("sql") || f.path.includes("model") || f.path.includes("entity") || f.extension === "prisma" || f.extension === "sql");
  const depAnalysis = analyses.find((a) => a.type === "dependencies");
  const depData = depAnalysis?.data || {};
  const dbDeps = (depData.libraries || depData.dependencies || []).filter((d) => d.name?.toLowerCase().includes("prisma") || d.name?.toLowerCase().includes("sql") || d.name?.toLowerCase().includes("mongo") || d.name?.toLowerCase().includes("postgres") || d.name?.toLowerCase().includes("mysql") || d.name?.toLowerCase().includes("redis") || d.name?.toLowerCase().includes("orm") || d.name?.toLowerCase().includes("typeorm") || d.name?.toLowerCase().includes("sequelize") || d.name?.toLowerCase().includes("knex"));
  return {
    title: "Database Layer",
    summary: dbFiles.length > 0 ? `Found ${dbFiles.length} database-related files and ${dbDeps.length} database dependencies.` : "No database configuration detected in this repository.",
    dbFiles: dbFiles.slice(0, 10).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Database file" })),
    dbDependencies: dbDeps.map((d) => ({ name: d.name, version: d.version || "latest" })),
    totalDbFiles: dbFiles.length,
  };
}

async function buildComponents(files, analyses, repo) {
  const importantFiles = files.filter((f) => f.isImportant);
  const componentFiles = importantFiles.filter((f) => f.path.includes("component") || f.path.includes("Component") || f.extension === "tsx" || f.extension === "jsx" || f.extension === "vue" || f.extension === "svelte");
  return {
    title: "Key Components & Modules",
    summary: `Identified ${componentFiles.length} UI components and ${importantFiles.length - componentFiles.length} other important modules.`,
    components: componentFiles.slice(0, 12).map((f) => ({ path: f.path, purpose: f.modulePurpose || "UI Component", analysis: f.aiAnalysis?.slice(0, 150) || null })),
    modules: importantFiles.filter((f) => !componentFiles.includes(f)).slice(0, 8).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Module" })),
    totalImportant: importantFiles.length,
  };
}

async function buildEnvironment(files, repo) {
  const envFiles = files.filter((f) => f.path.includes(".env") || f.path.includes(".example") || f.path.includes("config") || f.path.includes("setting") || f.name === ".env.example" || f.name === ".env.sample" || f.name === "docker-compose.yml" || f.name === "docker-compose.yaml");
  const configFiles = files.filter((f) => f.path.includes("config") || f.name === "next.config.js" || f.name === "next.config.ts" || f.name === "tsconfig.json" || f.name === "tailwind.config.js" || f.name === "vite.config.ts" || f.name === "webpack.config.js");
  return {
    title: "Environment & Configuration",
    summary: `Found ${envFiles.length} environment files and ${configFiles.length} configuration files.`,
    envFiles: envFiles.slice(0, 8).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Env configuration" })),
    configFiles: configFiles.slice(0, 8).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Config" })),
    totalEnv: envFiles.length,
    totalConfig: configFiles.length,
  };
}

async function buildDeployment(files, analyses, repo) {
  const deployFiles = files.filter((f) => f.path.includes("Dockerfile") || f.path.includes("docker") || f.path.includes("deploy") || f.path.includes("ci") || f.path.includes(".github/workflows") || f.path.includes("helm") || f.path.includes("k8s") || f.name === "Dockerfile" || f.name === "docker-compose.yml" || f.name === ".github/workflows/deploy.yml");
  return {
    title: "Deployment & CI/CD",
    summary: deployFiles.length > 0 ? `Found ${deployFiles.length} deployment and CI/CD configuration files.` : "No deployment configuration detected in this repository.",
    deployFiles: deployFiles.slice(0, 8).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Deployment file" })),
    totalDeploy: deployFiles.length,
  };
}

function generateFallbackReadme(repo, sections) {
  const name = repo.name || repo.fullName || "Project";
  const techStack = repo.techStack || "Various";
  const lang = repo.language || "Unknown";
  let md = `# ${name}\n\n${repo.description || ""}\n\n`;
  md += `## Overview\n\n**${name}** is a ${lang} project.\n\n`;
  md += `## Tech Stack\n\n- **Language:** ${lang}\n- **Stack:** ${techStack}\n- **Files:** ${repo.fileCount || "N/A"}\n\n`;
  md += `## Installation\n\n\`\`\`bash\ngit clone <url>\ncd ${name.toLowerCase()}\nnpm install\nnpm run dev\n\`\`\`\n\n`;
  return md + `---\n*Generated by Repolyx AI Documentation Workspace*`;
}

function generateFallbackApi(sections) {
  const api = sections.apis;
  if (!api?.routes?.length) return "# API Documentation\n\nNo API endpoints detected.\n\n---\n*Generated by Repolyx AI Documentation Workspace*";
  let md = "# API Documentation\n\n";
  md += `Total endpoints: ${api.totalEndpoints}\n\n`;
  md += "| Method | Route | Auth | Description |\n|--------|-------|------|-------------|\n";
  api.routes.forEach((r) => { md += `| \`${r.method}\` | \`${r.route}\` | ${r.auth} | ${r.summary} |\n`; });
  return md + "\n---\n*Generated by Repolyx AI Documentation Workspace*";
}

function generateFallbackArchitecture(sections) {
  const arch = sections.architecture;
  let md = "# Architecture Overview\n\n";
  md += `**Language:** ${arch?.language || "Unknown"}\n`;
  md += `**Tech Stack:** ${arch?.techStack || "Not detected"}\n`;
  md += `**Files:** ${arch?.fileCount || "N/A"}\n\n`;
  if (arch?.frameworks?.length) md += `**Frameworks:** ${arch.frameworks.join(", ")}\n\n`;
  if (arch?.keyFiles?.length) {
    md += "| File | Purpose |\n|------|---------|\n";
    arch.keyFiles.forEach((f) => { md += `| \`${f.path}\` | ${f.purpose} |\n`; });
  }
  return md + "\n---\n*Generated by Repolyx AI Documentation Workspace*";
}

export const getRepositoryDocs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { repositoryId } = req.params;
    const repo = await prisma.repository.findFirst({ where: { id: repositoryId, userId } });
    if (!repo) return res.status(404).json({ success: false, message: "Repository not found" });

    const [analyses, files] = await Promise.all([
      prisma.repositoryAnalysis.findMany({ where: { repositoryId }, orderBy: { createdAt: "desc" } }),
      prisma.repositoryFile.findMany({ where: { repositoryId }, orderBy: [{ isImportant: "desc" }, { path: "asc" }] }),
    ]);

    const [architecture, apis, auth, database, components, environment, deployment] = await Promise.all([
      buildArchitecture(analyses, files, repo), buildAPIs(analyses, repo), buildAuth(analyses, repo),
      buildDatabase(analyses, files, repo), buildComponents(files, analyses, repo),
      buildEnvironment(files, repo), buildDeployment(files, analyses, repo),
    ]);

    res.json({ success: true, repository: { id: repo.id, name: repo.name, fullName: repo.fullName, description: repo.description, language: repo.language, techStack: repo.techStack, aiSummary: repo.aiSummary, fileCount: repo.fileCount, dependencyCount: repo.dependencyCount, branchCount: repo.branchCount, lastScanAt: repo.lastScanAt }, sections: { architecture, apis, auth, database, components, environment, deployment } });
  } catch (error) {
    logger.error(`Error in getRepositoryDocs: ${error.message}`);
    next(error);
  }
};

export const generateRepositoryDocs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { repositoryId } = req.params;
    const repo = await prisma.repository.findFirst({ where: { id: repositoryId, userId } });
    if (!repo) return res.status(404).json({ success: false, message: "Repository not found" });

    const [analyses, files] = await Promise.all([
      prisma.repositoryAnalysis.findMany({ where: { repositoryId }, orderBy: { createdAt: "desc" } }),
      prisma.repositoryFile.findMany({ where: { repositoryId }, orderBy: [{ isImportant: "desc" }, { path: "asc" }] }),
    ]);

    const [architecture, apis, auth, database, components, environment, deployment] = await Promise.all([
      buildArchitecture(analyses, files, repo), buildAPIs(analyses, repo), buildAuth(analyses, repo),
      buildDatabase(analyses, files, repo), buildComponents(files, analyses, repo),
      buildEnvironment(files, repo), buildDeployment(files, analyses, repo),
    ]);

    const sections = { architecture, apis, auth, database, components, environment, deployment };
    const ctx = buildContext(repo, analyses, files);

    let docs;
    try {
      logger.info(`Generating AI docs for repo ${repo.name}`);
      docs = await generateWithAI(ctx, repo);
      logger.info(`AI docs generated successfully for ${repo.name}`);
    } catch (aiError) {
      logger.error(`AI generation failed for ${repo.name}, using fallback: ${aiError.message}`);
      docs = {
        "README.md": generateFallbackReadme(repo, sections),
        "API.md": generateFallbackApi(sections),
        "ARCHITECTURE.md": generateFallbackArchitecture(sections),
        "SETUP.md": "# Setup Guide\n\n## Prerequisites\n- Node.js\n- npm\n\n## Installation\n\n```bash\ngit clone <url>\nnpm install\nnpm run dev\n```\n\n---\n*Generated by Repolyx AI Documentation Workspace*",
        "SECURITY.md": "# Security Documentation\n\nNo authentication flows detected.\n\n## Best Practices\n- Keep dependencies up to date\n- Use environment variables for secrets\n- Enable HTTPS in production\n\n---\n*Generated by Repolyx AI Documentation Workspace*",
        "ENVIRONMENT.md": `# Environment Configuration\n\n${sections.environment?.summary || "No environment files detected."}\n\n---\n*Generated by Repolyx AI Documentation Workspace*`,
        "DEPLOYMENT.md": `# Deployment Guide\n\n${sections.deployment?.summary || "No deployment configuration detected."}\n\n---\n*Generated by Repolyx AI Documentation Workspace*`,
        "CHANGELOG.md": "# Changelog\n\nNo changes recorded yet.\n\n---\n*Generated by Repolyx AI Documentation Workspace*",
      };
    }

    const missingDocs = generateMissingDocs(sections);

    res.json({
      success: true,
      repository: { id: repo.id, name: repo.name, fullName: repo.fullName, description: repo.description, language: repo.language, techStack: repo.techStack },
      docs,
      missingDocs,
      sections,
    });
  } catch (error) {
    logger.error(`Error in generateRepositoryDocs: ${error.message}`);
    next(error);
  }
};
