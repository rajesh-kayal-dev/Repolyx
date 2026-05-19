import { Octokit } from "@octokit/rest";
import logger from "../utils/logger.js";

const IMPORTANT_PATTERNS = {
  auth: /auth|login|signin|signup|oauth|jwt|session|passport|credentials|permission|role|rbac|middleware\.auth|guard/i,
  api: /api|route|endpoint|controller|router|handler|graphql|trpc|rest/i,
  config: /config|\.env|\.json|\.ya?ml|\.toml|\.ini/i,
  database: /db|database|schema|model|migration|prisma|sequelize|mongoose|typeorm|knex/i,
  test: /\.test\.|\.spec\.|\.cy\.|__tests__|test|spec/i,
  docker: /docker|dockerfile|docker-compose/i,
  ci: /\.github|\.gitlab|\.circleci|jenkins|ci/i,
  main: /main|index|app|server|cli|entry/i,
};

const FRAMEWORK_PATTERNS = {
  "Next.js": /next\.config|create-next-app|next\/\w+/i,
  "React": /react|jsx|tsx|create-react-app/i,
  "Vue": /vue|nuxt/i,
  "Angular": /angular|@angular/i,
  "Express": /express|express\(\)/i,
  "Fastify": /fastify/i,
  "NestJS": /@nestjs/i,
  "Django": /django|manage\.py|wsgi\.py/i,
  "Flask": /flask|app\.run/i,
  "FastAPI": /fastapi/i,
  "Spring": /spring|spring-boot/i,
  "Laravel": /laravel|artisan/i,
  "Rails": /rails|ruby\s+on\s+rails|config\/routes\.rb/i,
  "Gin": /gin\.Default|gin\.New|github\.com\/gin-gonic/i,
  "Go Fiber": /fiber|github\.com\/gofiber/i,
  "PyTorch": /torch|pytorch/i,
  "TensorFlow": /tensorflow|tf\./i,
  "Tailwind": /tailwind|@tailwind|twMerge/i,
};

export const scannerService = {
  async fetchRepoTree(githubAccessToken, owner, repo, branch = "HEAD") {
    const octokit = new Octokit({ auth: githubAccessToken });

    try {
      const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: "1",
      });

      return data.tree
        .filter((item) => item.type === "blob")
        .map((item) => ({
          path: item.path,
          name: item.path.split("/").pop(),
          extension: item.path.includes(".") ? `.${item.path.split(".").pop()}` : "",
          size: item.size || 0,
          type: "file",
          sha: item.sha,
        }));
    } catch (error) {
      logger.error(`Error fetching repo tree for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async fetchBranches(githubAccessToken, owner, repo) {
    const octokit = new Octokit({ auth: githubAccessToken });

    try {
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 50,
      });

      return data.map((branch) => ({
        name: branch.name,
        sha: branch.commit.sha,
        isDefault: false,
      }));
    } catch (error) {
      logger.error(`Error fetching branches for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async fetchFileContent(githubAccessToken, owner, repo, path, branch = "HEAD") {
    const octokit = new Octokit({ auth: githubAccessToken });

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (data.type === "file" && data.content) {
        return Buffer.from(data.content, "base64").toString("utf-8");
      }
      return null;
    } catch (error) {
      logger.error(`Error fetching file content for ${owner}/${repo}/${path}:`, error);
      return null;
    }
  },

  async parsePackageJson(githubAccessToken, owner, repo, branch = "HEAD") {
    const content = await this.fetchFileContent(githubAccessToken, owner, repo, "package.json", branch);

    if (!content) return null;

    try {
      const pkg = JSON.parse(content);
      return {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        dependencies: { ...pkg.dependencies, ...pkg.devDependencies } || {},
        scripts: pkg.scripts || {},
      };
    } catch {
      return null;
    }
  },

  async detectImportantFiles(files) {
    return files.map((file) => {
      let isImportant = false;
      let modulePurpose = null;

      for (const [category, pattern] of Object.entries(IMPORTANT_PATTERNS)) {
        if (pattern.test(file.path)) {
          isImportant = true;
          modulePurpose = category;
          break;
        }
      }

      return { ...file, isImportant, modulePurpose };
    });
  },

  async detectFrameworks(files) {
    const matchedFrameworks = new Set();

    for (const file of files) {
      for (const [framework, pattern] of Object.entries(FRAMEWORK_PATTERNS)) {
        if (pattern.test(file.path) || pattern.test(file.name)) {
          matchedFrameworks.add(framework);
        }
      }
    }

    return Array.from(matchedFrameworks);
  },

  async detectAuthFlows(files) {
    const authFiles = files.filter(
      (f) =>
        IMPORTANT_PATTERNS.auth.test(f.path) &&
        (f.extension === ".js" || f.extension === ".ts" || f.extension === ".py" || f.extension === ".go" || f.extension === ".java")
    );

    const authPatterns = {
      "JWT": /jwt|jsonwebtoken/i,
      "OAuth": /oauth|passport|google-auth|github-auth/i,
      "Session": /session|cookie|express-session/i,
      "API Key": /api[_-]?key|apikey/i,
      "Basic Auth": /basic|btoa|atob|authorization:.*basic/i,
      "Firebase": /firebase/i,
    };

    const detected = new Set();
    return authFiles
      .filter((f) => {
        for (const [, pattern] of Object.entries(authPatterns)) {
          if (pattern.test(f.path)) {
            detected.add(f.path);
            return true;
          }
        }
        return false;
      })
      .map((f) => ({
        file: f.path,
        modulePurpose: "auth",
      }));
  },

  async detectAPIRoutes(files) {
    return files.filter(
      (f) =>
        IMPORTANT_PATTERNS.api.test(f.path) &&
        (f.extension === ".js" || f.extension === ".ts" || f.extension === ".py" || f.extension === ".go")
    );
  },

  async scanRepository(githubAccessToken, owner, repo, branch = "HEAD") {
    const [tree, branches, packageJson] = await Promise.all([
      this.fetchRepoTree(githubAccessToken, owner, repo, branch),
      this.fetchBranches(githubAccessToken, owner, repo),
      this.parsePackageJson(githubAccessToken, owner, repo, branch),
    ]);

    const importantFiles = await this.detectImportantFiles(tree);
    const frameworks = await this.detectFrameworks(tree);
    const authFlows = await this.detectAuthFlows(tree);
    const apiRoutes = await this.detectAPIRoutes(tree);

    return {
      files: importantFiles,
      branches,
      packageJson,
      frameworks,
      authFlows,
      apiRoutes,
      summary: {
        totalFiles: tree.length,
        totalDependencies: packageJson ? Object.keys(packageJson.dependencies).length : 0,
        totalBranches: branches.length,
        totalAuthFlows: authFlows.length,
        totalAPIRoutes: apiRoutes.length,
        frameworks: frameworks.join(", "),
      },
    };
  },
};
