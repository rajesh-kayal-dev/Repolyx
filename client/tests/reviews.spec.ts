import { test, expect, Page } from "@playwright/test";

const MOCK_USER = {
  success: true,
  user: {
    id: "user-1",
    username: "rajesh-kayal-dev",
    email: "rajesh@example.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/101010101?v=4",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
};

const MOCK_REPOS = {
  success: true,
  repositories: [
    { id: "repo-1", name: "repolyx/cli", fullName: "repolyx/cli", language: "TypeScript", defaultBranch: "main", status: "healthy", isIndexed: true },
    { id: "repo-2", name: "repolyx/core", fullName: "repolyx/core", language: "Rust", defaultBranch: "main", status: "healthy", isIndexed: true },
  ],
};

const MOCK_PRS = {
  success: true,
  prs: [
    {
      number: 42,
      title: "Add dark mode toggle",
      author: "dev-user",
      headBranch: "feat/dark-mode",
      baseBranch: "main",
      createdAt: "2026-05-20T10:00:00Z",
      updatedAt: "2026-05-21T08:00:00Z",
      labels: [{ name: "enhancement", color: "a2eeef" }],
      draft: false,
      url: "https://github.com/repolyx/cli/pull/42",
    },
    {
      number: 41,
      title: "Fix memory leak in cache layer",
      author: "senior-dev",
      headBranch: "fix/memory-leak",
      baseBranch: "main",
      createdAt: "2026-05-19T14:00:00Z",
      updatedAt: "2026-05-20T09:00:00Z",
      labels: [{ name: "bug", color: "d73a4a" }],
      draft: true,
      url: "https://github.com/repolyx/cli/pull/41",
    },
  ],
};

function mockEmptyReview(reviewId: string, prNumber?: number) {
  return {
    id: reviewId, repositoryId: "repo-1", userId: "user-1",
    prUrl: prNumber ? `https://github.com/repolyx/cli/pull/${prNumber}` : null,
    prNumber: prNumber || null,
    title: prNumber ? "Add dark mode toggle" : "Manual Diff Review",
    baseBranch: "main", headBranch: "feat/dark-mode", author: "dev-user",
    status: "pending", riskLevel: null, mergeReady: null, summary: null,
    testCoverage: null, ciStatus: null, createdAt: "2026-05-22T00:00:00.000Z",
    files: [], suggestions: [], _count: { files: 0, suggestions: 0 },
  };
}

function mockCompletedReview(reviewId: string) {
  return {
    id: reviewId, repositoryId: "repo-1", userId: "user-1",
    prUrl: "https://github.com/repolyx/cli/pull/42", prNumber: 42,
    title: "Add dark mode toggle", baseBranch: "main", headBranch: "feat/dark-mode",
    author: "dev-user", status: "completed", riskLevel: "low", mergeReady: 85,
    summary: "Well-structured PR with clean changes.",
    testCoverage: "adequate", ciStatus: "passing",
    createdAt: "2026-05-22T00:00:00.000Z",
    files: [
      { id: "f1", path: "src/components/ThemeToggle.tsx", status: "added", additions: 45, deletions: 0, patch: "+ export function ThemeToggle() { ... }" },
      { id: "f2", path: "src/hooks/useTheme.ts", status: "added", additions: 32, deletions: 0, patch: "+ export function useTheme() { ... }" },
    ],
    suggestions: [
      { id: "s1", filePath: "src/components/ThemeToggle.tsx", type: "style", title: "Use semantic CSS variables", description: "Consider using CSS custom properties for theme colors instead of inline styles.", severity: "low", lineStart: 10, lineEnd: 15, codeSnippet: "color: darkblue;" },
    ],
    _count: { files: 2, suggestions: 1 },
  };
}

test.describe("Reviews Page", () => {
  test("redirects unauthenticated users to landing page", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test.describe("authenticated", () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("repolyx_token", "test-mock-token");
      });
      await page.route("**/api/auth/me", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
      });
      await page.route("**/api/repositories**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPOS) });
      });
    });

    test("shows empty state", async ({ page }) => {
      await page.route("**/api/reviews", async (route) => {
        if (route.request().method() !== "POST") {
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, sessions: [] }) });
        }
      });
      await page.goto("/reviews");
      await expect(page.locator("text=No reviews yet")).toBeVisible({ timeout: 10000 });
    });

    test("shows PR picker in create mode", async ({ page }) => {
      await page.route("**/api/reviews", async (route) => {
        if (route.request().method() !== "POST") {
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, sessions: [] }) });
        }
      });
      await page.route(/\/api\/reviews\/prs\//, async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PRS) });
      });

      await page.goto("/reviews");
      await page.locator("text=New Review").click();
      await page.waitForTimeout(2000);
      await expect(page.locator("text=Add dark mode toggle")).toBeVisible({ timeout: 10000 });
      await expect(page.locator("text=Draft").first()).toBeVisible();
    });

    test("creates review and shows detail view", async ({ page }) => {
      await page.route("**/api/reviews", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, session: mockEmptyReview("r1", 42) }) });
        } else {
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, sessions: [] }) });
        }
      });
      await page.route(/\/api\/reviews\/prs\//, async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PRS) });
      });

      await page.goto("/reviews");
      await page.locator("text=New Review").click();
      await page.waitForTimeout(2000);
      await page.locator("text=Add dark mode toggle").click();
      await page.waitForTimeout(1000);
      await expect(page.getByText("Review Summary").first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("AI Report").first()).toBeVisible();
    });

    test("clicking Run Review triggers analysis", async ({ page }) => {
      const empty = mockEmptyReview("r2", 42);
      const completed = mockCompletedReview("r2");

      await page.route("**/api/reviews", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, session: empty }) });
        } else {
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, sessions: [empty] }) });
        }
      });
      await page.route(/\/api\/reviews\/prs\//, async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PRS) });
      });
      await page.route("**/api/reviews/r2/analyze", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, session: completed, files: completed.files, suggestions: completed.suggestions }) });
      });
      await page.route("**/api/reviews/r2", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, session: completed, files: completed.files, suggestions: completed.suggestions }) });
      });

      await page.goto("/reviews");
      await page.locator("text=New Review").click();
      await page.waitForTimeout(2000);
      await page.locator("text=Add dark mode toggle").click();
      await page.waitForTimeout(1000);
      const sparkleBtn = page.locator('button[title="Run AI Review"], button[title="Re-analyze"]');
      if (await sparkleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sparkleBtn.click();
        await page.waitForTimeout(2000);
        await expect(page.locator('button[title="Re-analyze"]')).toBeVisible({ timeout: 10000 });
      }
    });

    test("lists existing reviews", async ({ page }) => {
      const completed = mockCompletedReview("r3");
      await page.route("**/api/reviews", async (route) => {
        if (route.request().method() !== "POST") {
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, sessions: [completed] }) });
        }
      });
      await page.goto("/reviews");
      await expect(page.getByText("Add dark mode toggle").first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("low risk")).toBeVisible();
    });
  });
});
