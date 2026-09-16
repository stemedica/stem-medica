import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3000" });
test.skip(process.env.QA_NEON_PREVIEW !== "1", "Uses published test-branch articles, read-only.");

test("arrival styling is responsive and legacy post links still work", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/test/blog");
    await expect(page.getByRole("navigation", { name: "Post types" })).not.toContainText("Order update");
    const card = page.locator(".arrival-card").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("border-top-width", "4px");
    await expect(card.locator(".arrival-pulse")).toHaveCSS("animation-iteration-count", "3");
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/arrival-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.click();
    await expect(page.locator(".arrival-heading .arrival-badge")).toBeVisible();
  }
  await page.goto("/test/blog/test-order-review-checklist");
  await expect(page.locator("article header").getByRole("link", { name: "Blog", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/test/blog?kind=Upcoming+arrival");
  await expect(page.locator(".arrival-pulse").first()).toHaveCSS("animation-name", "none");
  await page.goto("/test");
  await expect(page.locator(".arrival-card").first()).toBeVisible();
});
