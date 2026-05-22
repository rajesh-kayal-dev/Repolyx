import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";

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
    lastScanAt: repo.lastScanAt,
    keyFiles: importantFiles.map((f) => ({
      path: f.path,
      purpose: f.modulePurpose || "Source file",
      analysis: f.aiAnalysis?.slice(0, 200) || null,
    })),
    raw: analysisData,
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
      response: r.response || r.responseType || "JSON",
    })),
    totalEndpoints: routes.length,
    raw: analysisData,
  };
}

async function buildAuth(analyses, repo) {
  const authAnalysis = analyses.find((a) => a.type === "auth");
  const analysisData = authAnalysis?.data || {};
  const flows = analysisData.flows || analysisData.authFlows || [];

  return {
    title: "Authentication & Authorization",
    summary: authAnalysis?.summary || analysisData.summary || "Auth flow analysis of the repository.",
    flows: flows.map((f) => ({
      label: f.label || f.name || "Auth flow",
      detail: f.detail || f.description || "Authentication process",
      status: f.status === "Secure" ? "Secure" : f.status || "Review",
    })),
    securityFindings: analysisData.findings || analysisData.securityIssues || [],
    raw: analysisData,
  };
}

async function buildDatabase(analyses, files, repo) {
  const dbFiles = files.filter(
    (f) =>
      f.path.includes("schema") ||
      f.path.includes("migration") ||
      f.path.includes("prisma") ||
      f.path.includes("database") ||
      f.path.includes("db") ||
      f.path.includes("sql") ||
      f.path.includes("model") ||
      f.path.includes("entity") ||
      f.extension === "prisma" ||
      f.extension === "sql"
  );
  const depAnalysis = analyses.find((a) => a.type === "dependencies");
  const depData = depAnalysis?.data || {};
  const dbDeps = (depData.libraries || depData.dependencies || []).filter(
    (d) =>
      d.name?.toLowerCase().includes("prisma") ||
      d.name?.toLowerCase().includes("sql") ||
      d.name?.toLowerCase().includes("mongo") ||
      d.name?.toLowerCase().includes("postgres") ||
      d.name?.toLowerCase().includes("mysql") ||
      d.name?.toLowerCase().includes("redis") ||
      d.name?.toLowerCase().includes("orm") ||
      d.name?.toLowerCase().includes("typeorm") ||
      d.name?.toLowerCase().includes("sequelize") ||
      d.name?.toLowerCase().includes("knex")
  );

  return {
    title: "Database Layer",
    summary: dbFiles.length > 0
      ? `Found ${dbFiles.length} database-related files and ${dbDeps.length} database dependencies.`
      : "No database configuration detected in this repository.",
    dbFiles: dbFiles.slice(0, 10).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Database file" })),
    dbDependencies: dbDeps.map((d) => ({ name: d.name, version: d.version || "latest" })),
    totalDbFiles: dbFiles.length,
    raw: depData,
  };
}

async function buildComponents(files, analyses, repo) {
  const importantFiles = files.filter((f) => f.isImportant);
  const componentFiles = importantFiles.filter(
    (f) =>
      f.path.includes("component") ||
      f.path.includes("Component") ||
      f.extension === "tsx" ||
      f.extension === "jsx" ||
      f.extension === "vue" ||
      f.extension === "svelte"
  );

  return {
    title: "Key Components & Modules",
    summary: `Identified ${componentFiles.length} UI components and ${importantFiles.length - componentFiles.length} other important modules.`,
    components: componentFiles.slice(0, 12).map((f) => ({
      path: f.path,
      purpose: f.modulePurpose || "UI Component",
      analysis: f.aiAnalysis?.slice(0, 150) || null,
    })),
    modules: importantFiles
      .filter((f) => !componentFiles.includes(f))
      .slice(0, 8)
      .map((f) => ({
        path: f.path,
        purpose: f.modulePurpose || "Module",
        analysis: f.aiAnalysis?.slice(0, 150) || null,
      })),
    totalImportant: importantFiles.length,
    raw: null,
  };
}

async function buildEnvironment(files, repo) {
  const envFiles = files.filter(
    (f) =>
      f.path.includes(".env") ||
      f.path.includes(".example") ||
      f.path.includes("config") ||
      f.path.includes("setting") ||
      f.name === ".env.example" ||
      f.name === ".env.sample" ||
      f.name === "docker-compose.yml" ||
      f.name === "docker-compose.yaml"
  );

  const configFiles = files.filter(
    (f) =>
      f.path.includes("config") ||
      f.name === "next.config.js" ||
      f.name === "next.config.ts" ||
      f.name === "tsconfig.json" ||
      f.name === "tailwind.config.js" ||
      f.name === "vite.config.ts" ||
      f.name === "webpack.config.js"
  );

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
  const deployFiles = files.filter(
    (f) =>
      f.path.includes("Dockerfile") ||
      f.path.includes("docker") ||
      f.path.includes("deploy") ||
      f.path.includes("ci") ||
      f.path.includes(".github/workflows") ||
      f.path.includes("helm") ||
      f.path.includes("k8s") ||
      f.name === "Dockerfile" ||
      f.name === "docker-compose.yml" ||
      f.name === ".github/workflows/deploy.yml"
  );

  return {
    title: "Deployment & CI/CD",
    summary: deployFiles.length > 0
      ? `Found ${deployFiles.length} deployment and CI/CD configuration files.`
      : "No deployment configuration detected in this repository.",
    deployFiles: deployFiles.slice(0, 8).map((f) => ({ path: f.path, purpose: f.modulePurpose || "Deployment file" })),
    totalDeploy: deployFiles.length,
  };
}

function generateReadmeMd(repo, sections) {
  const name = repo.name || repo.fullName || "Project";
  const desc = repo.description || sections.architecture?.summary || "";
  const techStack = repo.techStack || sections.architecture?.techStack || "Various";
  const lang = repo.language || "Unknown";

  let md = `# ${name}\n\n`;
  if (desc) md += `${desc}\n\n`;
  md += `## 🚀 Overview\n\n`;
  md += `**${name}** is a ${lang} project built with **${techStack}**.\n\n`;
  md += `## 📊 Repository Stats\n\n`;
  md += `- **Language:** ${lang}\n`;
  md += `- **Tech Stack:** ${techStack}\n`;
  md += `- **Files:** ${repo.fileCount || "N/A"}\n`;
  md += `- **Branches:** ${repo.branchCount || "N/A"}\n`;
  md += `- **Dependencies:** ${repo.dependencyCount || "N/A"}\n\n`;

  if (repo.aiSummary) {
    md += `## 🤖 AI Summary\n\n${repo.aiSummary}\n\n`;
  }

  md += `## 📦 Installation\n\n`;
  md += "```bash\n# Clone the repository\ngit clone <repository-url>\ncd " + name.toLowerCase().replace(/\s+/g, "-") + "\n\n# Install dependencies\nnpm install\n\n# Set up environment variables\ncp .env.example .env\n\n# Start development server\nnpm run dev\n```\n\n";

  const apiSection = sections.apis;
  if (apiSection?.routes?.length > 0) {
    md += `## 🔌 API Endpoints\n\n`;
    md += `This project has **${apiSection.totalEndpoints}** API endpoint(s).\n\n`;
    md += `| Method | Route | Auth | Description |\n|--------|-------|------|-------------|\n`;
    apiSection.routes.forEach((r) => {
      md += `| \`${r.method}\` | \`${r.route}\` | ${r.auth} | ${r.summary} |\n`;
    });
    md += "\n";
  }

  const dbSection = sections.database;
  if (dbSection?.dbFiles?.length > 0) {
    md += `## 🗄️ Database\n\n`;
    md += `Found **${dbSection.totalDbFiles}** database-related files.\n\n`;
  }

  md += `## 📄 License\n\n`;
  md += `N/A - No license file detected.\n\n`;
  md += `---\n\n`;
  md += `*Generated by Repolyx AI Documentation Workspace*\n`;

  return md;
}

function generateApiMd(sections) {
  const apiSection = sections.apis;
  if (!apiSection?.routes?.length) {
    return "# API Documentation\n\nNo API endpoints detected in this repository.\n\n*Generated by Repolyx AI Documentation Workspace*\n";
  }

  let md = `# API Documentation\n\n`;
  md += `${apiSection.summary || ""}\n\n`;
  md += `## Overview\n\n`;
  md += `- **Total Endpoints:** ${apiSection.totalEndpoints}\n\n`;
  md += `## Endpoints\n\n`;

  const grouped = {};
  apiSection.routes.forEach((r) => {
    const base = r.route.split("/").slice(0, 3).join("/") || "/";
    if (!grouped[base]) grouped[base] = [];
    grouped[base].push(r);
  });

  Object.entries(grouped).forEach(([base, routes]) => {
    md += `### ${base}\n\n`;
    md += `| Method | Route | Auth | Description |\n|--------|-------|------|-------------|\n`;
    routes.forEach((r) => {
      md += `| \`${r.method}\` | \`${r.route}\` | ${r.auth} | ${r.summary} |\n`;
    });
    md += "\n";
  });

  md += `## Authentication\n\n`;
  md += `Endpoints requiring authentication use the Authorization header with Bearer token.\n\n`;
  md += `## Error Handling\n\n`;
  md += `All API errors follow a standard format:\n\n`;
  md += "```json\n{\n  \"success\": false,\n  \"message\": \"Error description\"\n}\n```\n\n";
  md += `*Generated by Repolyx AI Documentation Workspace*\n`;

  return md;
}

function generateArchitectureMd(sections) {
  const arch = sections.architecture;

  let md = `# Architecture Overview\n\n`;
  md += `${arch?.summary || "Architecture analysis of the repository."}\n\n`;

  md += `## Tech Stack\n\n`;
  md += `- **Language:** ${arch?.language || "Unknown"}\n`;
  md += `- **Tech Stack:** ${arch?.techStack || "Not detected"}\n`;
  md += `- **Files:** ${arch?.fileCount || "N/A"}\n`;
  md += `- **Branches:** ${arch?.branchCount || "N/A"}\n\n`;

  if (arch?.frameworks?.length > 0) {
    md += `## Frameworks\n\n`;
    arch.frameworks.forEach((fw) => { md += `- ${fw}\n`; });
    md += "\n";
  }

  if (arch?.directories?.length > 0) {
    md += `## Directory Structure\n\n`;
    md += "```\n";
    arch.directories.forEach((dir) => { md += `${dir}/\n`; });
    md += "```\n\n";
  }

  if (arch?.keyFiles?.length > 0) {
    md += `## Key Files\n\n`;
    md += `| File | Purpose |\n|------|---------|\n`;
    arch.keyFiles.forEach((f) => {
      md += `| \`${f.path}\` | ${f.purpose} |\n`;
    });
    md += "\n";
  }

  md += `*Generated by Repolyx AI Documentation Workspace*\n`;
  return md;
}

function generateSetupMd(repo, sections) {
  const name = repo.name || repo.fullName || "Project";
  const techStack = repo.techStack || sections.architecture?.techStack || "Node.js";
  const lang = repo.language || "Unknown";
  const isFrontend = techStack?.toLowerCase().includes("react") || techStack?.toLowerCase().includes("next") || techStack?.toLowerCase().includes("vue");
  const isBackend = techStack?.toLowerCase().includes("express") || techStack?.toLowerCase().includes("node") || techStack?.toLowerCase().includes("fastify");
  const packageManager = "npm";

  let md = `# Setup Guide\n\n`;
  md += `## Prerequisites\n\n`;
  md += `- ${lang} runtime\n`;
  md += `- ${packageManager} (Node Package Manager)\n`;
  if (isBackend) md += `- Database (configured in your environment)\n`;
  md += `- Git\n\n`;

  md += `## Getting Started\n\n`;
  md += "### 1. Clone the Repository\n\n";
  md += "```bash\ngit clone <repository-url>\ncd " + name.toLowerCase().replace(/\s+/g, "-") + "\n```\n\n";

  md += "### 2. Install Dependencies\n\n";
  md += "```bash\n" + packageManager + " install\n```\n\n";

  md += "### 3. Environment Variables\n\n";
  md += "```bash\ncp .env.example .env\n# Edit .env with your configuration\n```\n\n";

  const envSection = sections.environment;
  if (envSection?.envFiles?.length > 0) {
    md += "### Environment Files\n\n";
    envSection.envFiles.forEach((f) => { md += `- \`${f.path}\`\n`; });
    md += "\n";
  }

  if (isBackend) {
    md += "### 4. Database Setup\n\n";
    md += "```bash\n# Run migrations\n" + packageManager + " run migrate\n\n# Seed data (optional)\n" + packageManager + " run seed\n```\n\n";
  }

  md += "### 5. Start Development Server\n\n";
  if (isFrontend && isBackend) {
    md += "```bash\n# Terminal 1 - Backend\n" + packageManager + " run dev\n\n# Terminal 2 - Frontend\ncd client && " + packageManager + " run dev\n```\n\n";
  } else {
    md += "```bash\n" + packageManager + " run dev\n```\n\n";
  }

  md += `## Available Scripts\n\n`;
  md += `| Command | Description |\n|---------|-------------|\n`;
  md += `| \`${packageManager} run dev\` | Start development server |\n`;
  md += `| \`${packageManager} run build\` | Build for production |\n`;
  md += `| \`${packageManager} run start\` | Start production server |\n`;
  md += `| \`${packageManager} run test\` | Run tests |\n`;
  md += `| \`${packageManager} run lint\` | Lint code |\n\n`;

  md += `## Troubleshooting\n\n`;
  md += `- **Port already in use:** Change the port in your \`.env\` file\n`;
  md += `- **Module not found:** Run \`${packageManager} install\` to reinstall dependencies\n`;
  md += `- **Database connection failed:** Verify your database credentials in \`.env\`\n\n`;

  md += `*Generated by Repolyx AI Documentation Workspace*\n`;
  return md;
}

function generateSecurityMd(sections) {
  const auth = sections.auth;

  let md = `# Security Documentation\n\n`;

  if (auth?.flows?.length > 0) {
    md += `## Authentication Flows\n\n`;
    md += `| Flow | Status | Description |\n|------|--------|-------------|\n`;
    auth.flows.forEach((f) => {
      md += `| ${f.label} | ${f.status} | ${f.detail} |\n`;
    });
    md += "\n";
  }

  if (auth?.securityFindings?.length > 0) {
    md += `## Security Findings\n\n`;
    auth.securityFindings.forEach((f) => {
      const msg = typeof f === "string" ? f : f.title || f.message || JSON.stringify(f);
      md += `- ⚠️ ${msg}\n`;
    });
    md += "\n";
  }

  if (!auth?.flows?.length && !auth?.securityFindings?.length) {
    md += `No authentication flows or security findings detected.\n\n`;
  }

  md += `## Best Practices\n\n`;
  md += `- Keep dependencies up to date\n`;
  md += `- Use environment variables for secrets\n`;
  md += `- Enable HTTPS in production\n`;
  md += `- Validate and sanitize all user inputs\n`;
  md += `- Implement rate limiting on API endpoints\n`;
  md += `- Use proper CORS configuration\n\n`;

  md += `*Generated by Repolyx AI Documentation Workspace*\n`;
  return md;
}

function generateEnvironmentMd(sections) {
  const env = sections.environment;

  let md = `# Environment Configuration\n\n`;
  md += `${env?.summary || "Environment and configuration file analysis."}\n\n`;

  if (env?.envFiles?.length > 0) {
    md += `## Environment Files\n\n`;
    md += `| File | Purpose |\n|------|---------|\n`;
    env.envFiles.forEach((f) => { md += `| \`${f.path}\` | ${f.purpose} |\n`; });
    md += "\n";
  }

  if (env?.configFiles?.length > 0) {
    md += `## Configuration Files\n\n`;
    md += `| File | Purpose |\n|------|---------|\n`;
    env.configFiles.forEach((f) => { md += `| \`${f.path}\` | ${f.purpose} |\n`; });
    md += "\n";
  }

  md += `## Common Environment Variables\n\n`;
  md += `| Variable | Description | Required |\n|----------|-------------|----------|\n`;
  md += `| \`NODE_ENV\` | Application environment | Yes |\n`;
  md += `| \`PORT\` | Server port | No |\n`;
  md += `| \`DATABASE_URL\` | Database connection string | If DB used |\n`;
  md += `| \`API_KEY\` | API authentication key | If needed |\n\n`;

  md += `*Generated by Repolyx AI Documentation Workspace*\n`;
  return md;
}

function generateDeploymentMd(sections) {
  const deploy = sections.deployment;

  let md = `# Deployment Guide\n\n`;
  md += `${deploy?.summary || "Deployment configuration analysis."}\n\n`;

  if (deploy?.deployFiles?.length > 0) {
    md += `## Deployment Files\n\n`;
    md += `| File | Purpose |\n|------|---------|\n`;
    deploy.deployFiles.forEach((f) => { md += `| \`${f.path}\` | ${f.purpose} |\n`; });
    md += "\n";
  }

  md += `## Deployment Options\n\n`;
  md += `### Option 1: Traditional Hosting\n\n`;
  md += "```bash\n# Build the project\nnpm run build\n\n# Start the server\nnpm start\n```\n\n";

  md += `### Option 2: Docker\n\n`;
  const hasDocker = deploy?.deployFiles?.some((f) => f.path.includes("Dockerfile"));
  if (hasDocker) {
    md += "```bash\n# Build the Docker image\ndocker build -t my-app .\n\n# Run the container\ndocker run -p 3000:3000 my-app\n```\n\n";
  } else {
    md += "No Dockerfile detected. You can create one to containerize this application.\n\n";
  }

  md += `### Option 3: Cloud Platforms\n\n`;
  md += `- **Vercel:** Deploy frontend apps with zero configuration\n`;
  md += `- **Render:** Deploy backend services with automatic HTTPS\n`;
  md += `- **Railway:** Simple deployment with database integrations\n`;
  md += `- **AWS/GCP/Azure:** Full cloud deployment with scaling\n\n`;

  md += `## Environment Variables in Production\n\n`;
  md += `Make sure these environment variables are set in your production environment:\n\n`;
  md += "- `NODE_ENV=production`\n";
  md += "- `PORT` (default: 3000)\n";
  md += "- All variables from `.env`\n\n";

  md += `*Generated by Repolyx AI Documentation Workspace*\n`;
  return md;
}

function generateChangelogMd(repo, analyses) {
  const events = analyses.filter((a) => a.createdAt).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let md = `# Changelog\n\n`;
  md += `## ${repo.name || repo.fullName || "Project"}\n\n`;

  if (events.length > 0) {
    const byDate = {};
    events.forEach((e) => {
      const date = new Date(e.createdAt).toISOString().split("T")[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(e);
    });

    Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([date, items]) => {
        md += `### ${date}\n\n`;
        items.forEach((item) => {
          const type = item.type || "update";
          const summary = item.summary?.slice(0, 120) || "Analysis completed";
          md += `- **${type}:** ${summary}\n`;
        });
        md += "\n";
      });
  } else {
    md += `No changes recorded yet.\n\n`;
  }

  md += `---\n\n`;
  md += `*Generated by Repolyx AI Documentation Workspace*\n`;
  return md;
}

function generateMissingDocs(sections) {
  const suggestions = [];

  const arch = sections.architecture;
  if (!arch?.directories?.length) {
    suggestions.push({ type: "architecture", message: "Architecture section missing directory structure analysis" });
  }
  if (!arch?.frameworks?.length) {
    suggestions.push({ type: "architecture", message: "No frameworks detected in architecture analysis" });
  }

  const api = sections.apis;
  if (!api?.routes?.length) {
    suggestions.push({ type: "api", message: "No API endpoints documented - run API analysis first" });
  }

  const auth = sections.auth;
  if (!auth?.flows?.length) {
    suggestions.push({ type: "auth", message: "Authentication section missing - no auth flows detected" });
  }
  if (!auth?.securityFindings?.length) {
    suggestions.push({ type: "auth", message: "Security section missing findings - consider running security audit" });
  }

  const db = sections.database;
  if (!db?.dbFiles?.length) {
    suggestions.push({ type: "database", message: "No database schema files detected" });
  }

  const env = sections.environment;
  if (!env?.envFiles?.length) {
    suggestions.push({ type: "environment", message: "Missing environment configuration documentation" });
  }
  if (!env?.configFiles?.length) {
    suggestions.push({ type: "environment", message: "No configuration files detected" });
  }

  const deploy = sections.deployment;
  if (!deploy?.deployFiles?.length) {
    suggestions.push({ type: "deployment", message: "Missing deployment guide - no CI/CD or Docker config detected" });
  }

  const comp = sections.components;
  if (!comp?.components?.length && !comp?.modules?.length) {
    suggestions.push({ type: "components", message: "No UI components or modules documented" });
  }

  return suggestions;
}

export const getRepositoryDocs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { repositoryId } = req.params;

    const repo = await prisma.repository.findFirst({
      where: { id: repositoryId, userId },
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    const [analyses, files] = await Promise.all([
      prisma.repositoryAnalysis.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.repositoryFile.findMany({
        where: { repositoryId },
        orderBy: [{ isImportant: "desc" }, { path: "asc" }],
      }),
    ]);

    const [architecture, apis, auth, database, components, environment, deployment] = await Promise.all([
      buildArchitecture(analyses, files, repo),
      buildAPIs(analyses, repo),
      buildAuth(analyses, repo),
      buildDatabase(analyses, files, repo),
      buildComponents(files, analyses, repo),
      buildEnvironment(files, repo),
      buildDeployment(files, analyses, repo),
    ]);

    res.json({
      success: true,
      repository: {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        language: repo.language,
        techStack: repo.techStack,
        aiSummary: repo.aiSummary,
        fileCount: repo.fileCount,
        dependencyCount: repo.dependencyCount,
        branchCount: repo.branchCount,
        lastScanAt: repo.lastScanAt,
      },
      sections: {
        architecture,
        apis,
        auth,
        database,
        components,
        environment,
        deployment,
      },
    });
  } catch (error) {
    logger.error(`Error in getRepositoryDocs: ${error.message}`);
    next(error);
  }
};

export const generateRepositoryDocs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { repositoryId } = req.params;

    const repo = await prisma.repository.findFirst({
      where: { id: repositoryId, userId },
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    const [analyses, files] = await Promise.all([
      prisma.repositoryAnalysis.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.repositoryFile.findMany({
        where: { repositoryId },
        orderBy: [{ isImportant: "desc" }, { path: "asc" }],
      }),
    ]);

    const [architecture, apis, auth, database, components, environment, deployment] = await Promise.all([
      buildArchitecture(analyses, files, repo),
      buildAPIs(analyses, repo),
      buildAuth(analyses, repo),
      buildDatabase(analyses, files, repo),
      buildComponents(files, analyses, repo),
      buildEnvironment(files, repo),
      buildDeployment(files, analyses, repo),
    ]);

    const sections = { architecture, apis, auth, database, components, environment, deployment };

    const readmeMd = generateReadmeMd(repo, sections);
    const apiMd = generateApiMd(sections);
    const architectureMd = generateArchitectureMd(sections);
    const setupMd = generateSetupMd(repo, sections);
    const securityMd = generateSecurityMd(sections);
    const environmentMd = generateEnvironmentMd(sections);
    const deploymentMd = generateDeploymentMd(sections);
    const changelogMd = generateChangelogMd(repo, analyses);

    const missingDocs = generateMissingDocs(sections);

    res.json({
      success: true,
      repository: {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        language: repo.language,
        techStack: repo.techStack,
      },
      docs: {
        "README.md": readmeMd,
        "API.md": apiMd,
        "ARCHITECTURE.md": architectureMd,
        "SETUP.md": setupMd,
        "SECURITY.md": securityMd,
        "ENVIRONMENT.md": environmentMd,
        "DEPLOYMENT.md": deploymentMd,
        "CHANGELOG.md": changelogMd,
      },
      missingDocs,
      sections,
    });
  } catch (error) {
    logger.error(`Error in generateRepositoryDocs: ${error.message}`);
    next(error);
  }
};
