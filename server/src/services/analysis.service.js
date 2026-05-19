import logger from "../utils/logger.js";
import prisma from "../database/prisma.js";

export const analysisService = {
  async analyzeArchitecture(repositoryId, files, frameworks, packageJson) {
    try {
      const directories = new Set();
      files.forEach((f) => {
        const parts = f.path.split("/");
        if (parts.length > 1) {
          for (let i = 0; i < parts.length - 1; i++) {
            directories.add(parts.slice(0, i + 1).join("/"));
          }
        }
      });

      let architectureSummary = `This repository contains ${files.length} files across ${directories.size} directories.`;

      if (frameworks.length > 0) {
        architectureSummary += ` It uses ${frameworks.join(", ")}.`;
      }

      if (packageJson) {
        architectureSummary += ` The project has ${Object.keys(packageJson.dependencies).length} dependencies.`;
      }

      const srcDirs = Array.from(directories).filter((d) => d.startsWith("src") || d.startsWith("app") || d.startsWith("lib"));
      if (srcDirs.length > 0) {
        architectureSummary += ` Core source code is organized under: ${srcDirs.slice(0, 5).join(", ")}.`;
      }

      const testFiles = files.filter((f) => f.path.includes("test") || f.path.includes("spec") || f.path.includes("__tests__"));
      if (testFiles.length > 0) {
        architectureSummary += ` Has ${testFiles.length} test files.`;
      }

      await prisma.repositoryAnalysis.create({
        data: {
          repositoryId,
          type: "architecture",
          summary: architectureSummary,
          data: {
            directories: Array.from(directories),
            totalDirs: directories.size,
            totalFiles: files.length,
            frameworks,
          },
        },
      });

      return architectureSummary;
    } catch (error) {
      logger.error("Error analyzing architecture:", error);
      throw error;
    }
  },

  async analyzeDependencies(repositoryId, packageJson) {
    try {
      if (!packageJson) {
        await prisma.repositoryAnalysis.create({
          data: {
            repositoryId,
            type: "dependencies",
            summary: "No package.json found. Cannot analyze dependencies.",
            data: null,
          },
        });
        return null;
      }

      const deps = Object.keys(packageJson.dependencies || {});
      const depCategories = {};

      deps.forEach((dep) => {
        if (dep.includes("react") || dep.includes("vue") || dep.includes("angular") || dep.includes("svelte")) {
          depCategories["Frontend Framework"] = depCategories["Frontend Framework"] || [];
          depCategories["Frontend Framework"].push(dep);
        } else if (dep.includes("express") || dep.includes("fastify") || dep.includes("koa") || dep.includes("nest")) {
          depCategories["Backend Framework"] = depCategories["Backend Framework"] || [];
          depCategories["Backend Framework"].push(dep);
        } else if (dep.includes("prisma") || dep.includes("mongoose") || dep.includes("typeorm") || dep.includes("sequelize") || dep.includes("knex")) {
          depCategories["Database ORM"] = depCategories["Database ORM"] || [];
          depCategories["Database ORM"].push(dep);
        } else if (dep.includes("eslint") || dep.includes("prettier") || dep.includes("typescript") || dep.includes("jest") || dep.includes("vitest")) {
          depCategories["Developer Tools"] = depCategories["Developer Tools"] || [];
          depCategories["Developer Tools"].push(dep);
        } else {
          depCategories["Other"] = depCategories["Other"] || [];
          depCategories["Other"].push(dep);
        }
      });

      const summary = `Found ${deps.length} dependencies across ${Object.keys(depCategories).length} categories: ${Object.entries(depCategories)
        .map(([cat, items]) => `${cat} (${items.length})`)
        .join(", ")}.`;

      await prisma.repositoryAnalysis.create({
        data: {
          repositoryId,
          type: "dependencies",
          summary,
          data: depCategories,
        },
      });

      return { summary, categories: depCategories, total: deps.length };
    } catch (error) {
      logger.error("Error analyzing dependencies:", error);
      throw error;
    }
  },

  async analyzeAuthFlow(repositoryId, authFlows, files) {
    try {
      const authFiles = files.filter((f) => f.isImportant && f.modulePurpose === "auth");

      let summary;
      if (authFlows.length === 0 && authFiles.length === 0) {
        summary = "No authentication flow detected in this repository.";
      } else {
        const paths = authFlows.length > 0 ? authFlows.map((a) => a.file) : authFiles.map((a) => a.path);
        summary = `Authentication flow detected across ${paths.length} file(s): ${paths.join(", ")}.`;
      }

      await prisma.repositoryAnalysis.create({
        data: {
          repositoryId,
          type: "auth",
          summary,
          data: {
            authFiles: authFlows.length > 0 ? authFlows : authFiles.map((f) => ({ file: f.path, modulePurpose: "auth" })),
          },
        },
      });

      return summary;
    } catch (error) {
      logger.error("Error analyzing auth flow:", error);
      throw error;
    }
  },

  async analyzeAPI(repositoryId, apiRoutes) {
    try {
      let summary;
      if (apiRoutes.length === 0) {
        summary = "No API route files detected in this repository.";
      } else {
        const routes = apiRoutes.map((r) => r.path);
        summary = `Found ${apiRoutes.length} API-related file(s): ${routes.join(", ")}.`;
      }

      await prisma.repositoryAnalysis.create({
        data: {
          repositoryId,
          type: "api",
          summary,
          data: { routes: apiRoutes.map((r) => ({ path: r.path })) },
        },
      });

      return summary;
    } catch (error) {
      logger.error("Error analyzing API routes:", error);
      throw error;
    }
  },
};
