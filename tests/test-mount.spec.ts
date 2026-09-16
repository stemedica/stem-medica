import { test, expect } from "@playwright/test";
test.use({ baseURL: process.env.QA_AUTH_E2E ? "http://127.0.0.1:3001" : "http://127.0.0.1:3000" });
test.setTimeout(90000);

test("root is maintenance and the website is mounted only under test", async ({ page, request }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /We’re making room/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse equipment/ })).toHaveCount(0);
    await expect(page.locator('a[href^="/test"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width !== 320) await page.screenshot({ path: `test-results/maintenance-${width}.png`, caret: "initial" });
  }
  const response = await page.goto("/test");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.getByRole("heading", { name: /Equipment for/ })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: "View full catalogue", exact: true }).click();
  await expect(page).toHaveURL(/\/test\/products$/);
  await expect(page.getByRole("search")).toHaveAttribute("action", "/test/products");
  await page.goto("/test/blog");
  await expect(page.getByRole("search")).toHaveAttribute("action", "/test/blog");
  for (const old of ["/products", "/blog", "/admin", "/api/auth/get-session", "/admin/api/posts"]) {
    expect((await request.get(old)).status()).toBe(404);
  }
  for (const api of ["catalogue", "posts", "drafts", "media", "history"]) {
    expect((await request.get(`/test/admin/api/${api}`)).status()).toBe(401);
  }
  await page.goto("/test/admin");
  await expect(page).toHaveURL(/\/test\/auth\/login$/);
});
