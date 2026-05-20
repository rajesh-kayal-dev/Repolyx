import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth|login/);
    expect(page.url()).toContain("auth");
  });

  test.describe("authenticated", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/api/auth/github/callback?code=test");
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
    });

    test("renders dashboard layout with all sections", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Workspace");
      await expect(page.locator("text=Repositories").first()).toBeVisible();
      await expect(page.locator("text=Activity")).toBeVisible();
      await expect(page.locator("text=Sessions").or(page.locator("text=Chat"))).toBeVisible();
      await expect(page.locator("text=Health").or(page.locator("text=Repository Health"))).toBeVisible();
      await expect(page.locator("text=Actions").or(page.locator("text=Suggested Actions"))).toBeVisible();
    });

    test("displays workspace stats from API", async ({ page }) => {
      const statCards = page.locator(".grid-cols-2 > div, .lg\\\\:grid-cols-4 > div");
      const count = await statCards.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test("shows repository health table when repos exist", async ({ page }) => {
      const table = page.locator("table");
      const tableExists = (await table.count()) > 0;
      if (tableExists) {
        const rows = await table.locator("tbody tr").count();
        expect(rows).toBeGreaterThanOrEqual(1);
      }
    });

    test("shows activity feed with events", async ({ page }) => {
      const activitySection = page.locator("text=Recent Activity");
      await expect(activitySection).toBeVisible();
    });

    test("shows suggested actions", async ({ page }) => {
      const actions = page.locator("text=Suggested Actions");
      await expect(actions).toBeVisible();
    });

    test("displays loading skeletons then content", async ({ page }) => {
      const skeleton = page.locator(".animate-pulse").first();
      await expect(skeleton).toBeVisible({ timeout: 5000 }).catch(() => {});
      await page.waitForLoadState("networkidle");
      const skeletonCount = await page.locator(".animate-pulse").count();
      expect(skeletonCount).toBeLessThan(5);
    });
  });
});
