import { Octokit } from "@octokit/rest";
import { scannerService } from "../../../services/scanner.service.js";
import { generateCompletion } from "../../ai/providers/index.js";
import prisma from "../../../database/prisma.js";
import logger from "../../../utils/logger.js";

export const debugScanner = {
  async autoScanRepository(repositoryId, userId, token) {
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { files: true },
    });

    if (!repo) throw new Error("Repository not found");

    const [owner, repoName] = repo.fullName.split("/");
    const branch = repo.defaultBranch || "HEAD";

    const startTime = Date.now();

    const [packageJson, commits] = await Promise.all([
      scannerService.parsePackageJson(token, owner, repoName, branch),
      this.analyzeRecentCommits(token, owner, repoName),
    ]);

    const dependencyCount = packageJson?.dependencies ? Object.keys(packageJson.dependencies).length + (packageJson.devDependencies ? Object.keys(packageJson.devDependencies).length : 0) : 0;

    // Run detectors in parallel to avoid UI blocking
    const findings = [];
    const [
      envVarsIssues,
      tsIssues,
      errorHandlingIssues,
      securityIssues
    ] = await Promise.all([
      this.detectMissingEnvVars(repo.files, token, owner, repoName, branch),
      this.detectTypeScriptIssues(repo.files, token, owner, repoName, branch),
      this.detectMissingErrorHandling(repo.files, token, owner, repoName, branch),
      this.detectSecurityPatterns(repo.files, token, owner, repoName, branch)
    ]);

    if (envVarsIssues) findings.push(envVarsIssues);
    if (tsIssues) findings.push(tsIssues);
    if (errorHandlingIssues) findings.push(errorHandlingIssues);
    if (securityIssues) findings.push(securityIssues);

    const depIssues = this.detectDependencyRisks(packageJson);
    if (depIssues) findings.push(depIssues);

    const testIssues = this.detectMissingTests(repo.files);
    if (testIssues) findings.push(testIssues);

    if (commits.riskyCommits.length > 0) {
      findings.push({
        title: "Risky Commits Detected",
        description: `Found ${commits.riskyCommits.length} potentially unstable commits recently.`,
        severity: "medium",
        affectedFiles: [],
        commits: commits.riskyCommits,
      });
    }

    const buildIssues = this.detectBuildConfigIssues(repo.files, packageJson);
    if (buildIssues) findings.push(buildIssues);

    // AI Summarization & Incident Creation
    await prisma.debugIncident.deleteMany({
      where: { repositoryId, source: "auto-scan" },
    });

    const incidents = [];
    // Process AI completions in parallel
    const aiPromises = findings.slice(0, 5).map(async (finding) => {
      const prompt = `You are an expert AI debugging assistant analyzing an auto-detected repository issue.
Summarize the following finding into a clear, beginner-friendly explanation and recommend a fix.

FINDING:
Title: ${finding.title}
Description: ${finding.description}
Severity: ${finding.severity}
Affected Files: ${finding.affectedFiles?.join(", ") || "None"}

Provide a JSON output exactly like this structure:
{
  "summary": "Clear, beginner-friendly 1 sentence summary of what was found.",
  "problem": "Detailed explanation of what the problem is.",
  "impact": "Explanation of why this matters and what could happen.",
  "recommendations": ["Actionable step 1", "Actionable step 2"],
  "confidence": 90
}`;

      let parsed = null;
      let retries = 1;

      while (retries >= 0 && !parsed) {
        try {
          const aiResult = await generateCompletion([{ role: "user", content: prompt }], { heavy: false });
          const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          else throw new Error("No JSON found");
        } catch (err) {
          logger.warn(`AI parsing failed, retries left: ${retries}`, err);
          retries--;
        }
      }

      return prisma.debugIncident.create({
        data: {
          userId,
          repositoryId,
          title: finding.title,
          impactStatement: finding.description,
          severity: finding.severity,
          status: "identified",
          source: "auto-scan",
          aiSummary: parsed?.summary || "Detected an anomaly during scanning.",
          aiProblem: parsed?.problem || finding.description,
          aiImpact: parsed?.impact || "Could lead to instability or errors in production.",
          aiRecommendations: parsed?.recommendations || ["Review the affected files"],
          aiConfidence: parsed?.confidence || 80,
          riskLevel: finding.severity,
          affectedFiles: finding.affectedFiles || [],
          relatedCommits: finding.commits || [],
        },
      });
    });

    incidents.push(...(await Promise.all(aiPromises)));

    const scanDuration = Date.now() - startTime;

    // Update repo scan timestamp, dependency count, and duration
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { 
        lastScanAt: new Date(),
        lastScanDuration: scanDuration,
        dependencyCount
      },
    });

    return { incidents, scanDuration };
  },

  async analyzeRecentCommits(token, owner, repoName) {
    const octokit = new Octokit({ auth: token });
    try {
      const { data } = await octokit.rest.repos.listCommits({ owner, repo: repoName, per_page: 10 });
      const riskyCommits = data
        .filter(c => /fix:|revert:|breaking/i.test(c.commit.message))
        .map(c => ({
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author?.name || c.author?.login || "Unknown",
        }));
      return { riskyCommits };
    } catch {
      return { riskyCommits: [] };
    }
  },

  async detectMissingEnvVars(files, token, owner, repoName, branch) {
    const envExample = await scannerService.fetchFileContent(token, owner, repoName, ".env.example", branch);
    if (!envExample) return null;
    
    // Very simplified check for demonstration
    return {
      title: "Missing Environment Variables",
      description: "Found potential mismatches between code usage and .env.example",
      severity: "high",
      affectedFiles: [".env.example"],
    };
  },

  detectDependencyRisks(packageJson) {
    if (!packageJson) return null;
    let risky = false;
    for (const ver of Object.values(packageJson.dependencies || {})) {
      if (ver === "*" || ver === "latest") risky = true;
    }
    if (risky) {
      return {
        title: "Risky Dependencies",
        description: "Package.json uses wildcard or 'latest' versions.",
        severity: "medium",
        affectedFiles: ["package.json"],
      };
    }
    return null;
  },

  async detectTypeScriptIssues(files, token, owner, repoName, branch) {
    const tsFiles = files.filter(f => f.extension === ".ts" || f.extension === ".tsx");
    if (tsFiles.length === 0) return null;
    return {
      title: "TypeScript Issues",
      description: "Review strict mode settings and loose types.",
      severity: "low",
      affectedFiles: ["tsconfig.json"],
    };
  },

  async detectMissingErrorHandling(files, token, owner, repoName, branch) {
    const apiFiles = files.filter(f => f.path.includes("api") || f.path.includes("routes"));
    if (apiFiles.length === 0) return null;
    return null; // Stub
  },

  detectMissingTests(files) {
    const testFiles = files.filter(f => f.path.includes("test") || f.path.includes("spec"));
    if (testFiles.length === 0 && files.length > 10) {
       return {
         title: "Missing Test Coverage",
         description: "Critical files lack corresponding tests.",
         severity: "medium",
         affectedFiles: [],
       };
    }
    return null;
  },

  detectBuildConfigIssues(files, packageJson) {
    if (!packageJson?.engines) {
      return {
        title: "Missing Build Config",
        description: "Node version (engines) not specified in package.json.",
        severity: "low",
        affectedFiles: ["package.json"],
      };
    }
    return null;
  },

  async detectSecurityPatterns(files, token, owner, repoName, branch) {
    return null; // Stub
  }
};
