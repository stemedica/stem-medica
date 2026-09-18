import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.QA_BASE_URL ?? (process.env.QA_AUTH_E2E ? "http://127.0.0.1:3001" : "http://127.0.0.1:3000") });

test("the full website is mounted at root", async ({ page, request }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: /Equipment for/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "View full catalogue", exact: true })).toHaveAttribute("href", "/products");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }

  expect((await request.get("/test")).status()).toBe(404);
  await page.getByRole("link", { name: "View full catalogue", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("search")).toHaveAttribute("action", "/products");
  await page.goto("/blog");
  await expect(page.getByRole("search")).toHaveAttribute("action", "/blog");

  if (!process.env.QA_BASE_URL) {
    for (const api of ["catalogue", "posts", "drafts", "media"]) {
      expect((await request.get(`/admin/api/${api}`)).status()).toBe(401);
    }
    expect((await request.get("/admin/api/history")).status()).toBe(404);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login$/);
  }
});
