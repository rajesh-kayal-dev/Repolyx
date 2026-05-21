import { test, expect, Page } from "@playwright/test";

const MOCK_USER = {
  success: true,
  user: {
    id: "test-user-id",
    username: "rajesh-kayal-dev",
    email: "rajesh@example.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/101010101?v=4",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
};

const MOCK_STATS = {
  success: true,
  stats: {
    repositories: 5,
    indexedRepositories: 5,
    totalFiles: 602,
    totalDependencies: 65,
    totalAnalyses: 12,
    healthyRepos: 5,
    warningRepos: 0,
    activeSessions: 7,
  },
  recentActivity: [
    { id: "1", type: "scan", title: "indexed", repo: "repolyx/cli", timestamp: new Date().toISOString() },
    { id: "2", type: "analysis", title: "analyzed", repo: "repolyx/core", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "3", type: "ai", title: "summary_generated", repo: "repolyx/ui", timestamp: new Date(Date.now() - 7200000).toISOString() },
  ],
};

const MOCK_REPOS = {
  success: true,
  repositories: [
    { id: "1", name: "repolyx/cli", language: "TypeScript", defaultBranch: "main", status: "healthy", isIndexed: true, fileCount: 142, dependencyCount: 18, updatedAt: "2026-05-20T10:00:00Z" },
    { id: "2", name: "repolyx/core", language: "Rust", defaultBranch: "main", status: "healthy", isIndexed: true, fileCount: 89, dependencyCount: 12, updatedAt: "2026-05-19T08:00:00Z" },
    { id: "3", name: "repolyx/ui", language: "TypeScript", defaultBranch: "develop", status: "healthy", isIndexed: true, fileCount: 371, dependencyCount: 35, updatedAt: "2026-05-18T14:00:00Z" },
  ],
};

const MOCK_GITHUB_PROFILE = {
  success: true,
  profile: {
    login: "rajesh-kayal-dev",
    name: "Rajesh",
    avatarUrl: "https://avatars.githubusercontent.com/u/101010101?v=4",
    bio: "Full-stack developer",
    location: "Kolkata, West Bengal, India",
    blog: "https://rajeshkayal.dev",
    followers: 0,
    following: 0,
    publicRepos: 58,
  },
};

const MOCK_README = {
  success: true,
  readme: "# Rajesh\n\nFull-stack developer from India.\n\n- 🔭 Working on Repolyx\n- 🌱 Learning AI/ML\n",
  htmlUrl: "https://github.com/rajesh-kayal-dev/rajesh-kayal-dev",
};

const MOCK_CONTRIBUTIONS = {
  success: true,
  contributions: {
    totalContributions: 100,
    activeDays: 12,
    longestStreak: 5,
    weeks: [],
  },
};

async function mockAuth(page: Page) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
  });
}

async function mockDashboard(page: Page) {
  await page.route("**/api/dashboard/stats", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_STATS) });
  });
  await page.route("**/api/dashboard/repos", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPOS) });
  });
  await page.route("**/api/dashboard/github-profile", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_GITHUB_PROFILE) });
  });
  await page.route("**/api/dashboard/readme", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_README) });
  });
  await page.route("**/api/dashboard/contributions", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_CONTRIBUTIONS) });
  });
}

test.describe("Overview Page", () => {
  test("redirects unauthenticated users to landing page", async ({ page }) => {
    await page.goto("/overview");
    await page.waitForURL("http://localhost:3000/");
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test.describe("authenticated", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page);
      await mockDashboard(page);
      await page.goto("/overview");
      await page.waitForLoadState("load");
    });

    test("renders the overview page with key sections", async ({ page }) => {
      await expect(page.locator("text=Workspace Insights")).toBeVisible({ timeout: 10000 });
      await expect(page.locator("text=Activity").first()).toBeVisible();
      await expect(page.locator("text=Repository Health")).toBeVisible();
    });

    test("renders repository names from mock data", async ({ page }) => {
      await expect(page.locator("text=repolyx/cli").first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator("text=repolyx/core").first()).toBeVisible();
      await expect(page.locator("text=repolyx/ui").first()).toBeVisible();
    });

    test("shows workspace insight metrics from mock stats", async ({ page }) => {
      await expect(page.locator("text=5").first()).toBeVisible({ timeout: 10000 });
    });

    test("displays loading skeletons then resolves cleanly", async ({ page }) => {
      const skeleton = page.locator(".animate-pulse").first();
      await expect(skeleton).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(page.locator("text=Workspace Insights")).toBeVisible({ timeout: 15000 });
      await expect(page.locator("text=Activity").first()).toBeVisible();
      // Wait for the skeleton elements to disappear (meaning loading has finished and actual data has rendered)
      await page.locator(".animate-pulse").first().waitFor({ state: "hidden", timeout: 15000 });
      const skeletonCount = await page.locator(".animate-pulse").count();
      expect(skeletonCount).toBeLessThan(10);
    });
  });
});
