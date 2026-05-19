import logger from "../utils/logger.js";

export const aiService = {
  async generateSummary(repoData) {
    const { name, description, language, frameworks, totalFiles, totalDependencies, totalBranches, totalAuthFlows, totalAPIRoutes, files } = repoData;

    const importantFiles = (files || []).filter((f) => f.isImportant).slice(0, 10);
    const importantPaths = importantFiles.map((f) => f.path);

    let summary = `**${name}**`;
    if (description) {
      summary += ` is ${description}.`;
    }

    if (language) {
      summary += ` The primary language is ${language}.`;
    }

    if (frameworks && frameworks.length > 0) {
      summary += ` It uses ${frameworks.join(", ")}.`;
    }

    summary += ` This repository contains ${totalFiles} files with ${totalDependencies} dependencies across ${totalBranches} branches.`;

    if (totalAuthFlows > 0) {
      summary += ` Authentication logic is present in ${totalAuthFlows} file(s).`;
    }

    if (totalAPIRoutes > 0) {
      summary += ` There are ${totalAPIRoutes} API-related files detected.`;
    }

    if (importantPaths.length > 0) {
      summary += ` Key files include: ${importantPaths.join(", ")}.`;
    }

    return summary;
  },

  async generateFileExplanation(file) {
    const { path, name, extension, modulePurpose } = file;

    const purposeMap = {
      auth: "handles authentication, authorization, or user session management",
      api: "defines API routes, request handlers, or endpoint logic",
      config: "contains configuration settings, environment variables, or project metadata",
      database: "manages database connections, schemas, models, or migrations",
      test: "contains unit tests, integration tests, or test utilities",
      docker: "configures Docker containers, services, or deployment infrastructure",
      ci: "defines continuous integration pipelines, workflows, or CI/CD configuration",
      main: "serves as the main entry point, application bootstrap, or core logic file",
    };

    const defaultPurpose = "is a source file in this repository";

    const whatItDoes = purposeMap[modulePurpose] || defaultPurpose;

    let explanation = `**${path}** ${whatItDoes}.`;

    if (extension === ".js" || extension === ".ts" || extension === ".tsx" || extension === ".jsx") {
      explanation += " It is a JavaScript/TypeScript module.";
    } else if (extension === ".py") {
      explanation += " It is a Python module.";
    } else if (extension === ".go") {
      explanation += " It is a Go source file.";
    } else if (extension === ".json") {
      explanation += " It is a JSON configuration or data file.";
    } else if (extension === ".yml" || extension === ".yaml") {
      explanation += " It is a YAML configuration file.";
    } else if (extension === ".css" || extension === ".scss" || extension === ".less") {
      explanation += " It is a stylesheet.";
    } else if (extension === ".md") {
      explanation += " It is a Markdown documentation file.";
    }

    return explanation;
  },

  async answerQuery(query, context) {
    const { repository, selectedFile, selectedBranch, files } = context;
    const lower = query.toLowerCase();

    if (lower.includes("auth") || lower.includes("login") || lower.includes("oauth") || lower.includes("password")) {
      const authFiles = (files || []).filter(
        (f) => f.modulePurpose === "auth" || f.path.toLowerCase().includes("auth")
      );
      if (authFiles.length > 0) {
        return `Authentication is handled in ${authFiles.length} file(s): ${authFiles.map((f) => `\`${f.path}\``).join(", ")}.`;
      }
      return `No specific authentication files were detected in **${repository}**.`;
    }

    if (lower.includes("depend") || lower.includes("package") || lower.includes("version")) {
      return `The repository has dependencies managed through standard package manifests. Check the package.json or equivalent file for the full dependency list.`;
    }

    if (lower.includes("api") || lower.includes("endpoint") || lower.includes("route")) {
      const apiFiles = (files || []).filter(
        (f) => f.modulePurpose === "api" || f.path.toLowerCase().includes("route") || f.path.toLowerCase().includes("api")
      );
      if (apiFiles.length > 0) {
        return `API routes are defined in ${apiFiles.length} file(s): ${apiFiles.map((f) => `\`${f.path}\``).join(", ")}.`;
      }
      return `No dedicated API route files were detected in **${repository}**.`;
    }

    if (lower.includes("architecture") || lower.includes("structure") || lower.includes("how is") || lower.includes("organized")) {
      const fileCount = (files || []).length;
      const dirs = new Set();
      (files || []).forEach((f) => {
        const parts = f.path.split("/");
        if (parts.length > 1) dirs.add(parts[0]);
      });
      return `**${repository}** has ${fileCount} files organized across ${dirs.size} top-level directories: ${Array.from(dirs).join(", ")}.`;
    }

    if (lower.includes("framework") || lower.includes("stack") || lower.includes("tech")) {
      return `**${repository}** is primarily built with modern web technologies. Check the repository summary for a detailed tech stack overview.`;
    }

    if (selectedFile) {
      return `Regarding \`${selectedFile}\` in **${repository}**: This file is part of the repository structure. For a detailed explanation, select the file in the explorer to see its AI analysis.`;
    }

    if (lower.includes("what") || lower.includes("about") || lower.includes("tell")) {
      return `**${repository}** contains ${(files || []).length} files. You can browse the file explorer to understand its structure, check the AI summary for an overview, or ask specific questions about auth, APIs, dependencies, or architecture.`;
    }

    return `I analyzed your question about "${query}" in the context of **${repository}** (branch: \`${selectedBranch}\`). The repository contains ${(files || []).length} indexed files. Try asking about authentication, APIs, dependencies, or architecture for more specific insights.`;
  },
};
