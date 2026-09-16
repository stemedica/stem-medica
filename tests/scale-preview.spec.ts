import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3000", extraHTTPHeaders: { "Cache-Control": "no-cache" } });
test.skip(process.env.SCALE_PREVIEW_QA !== "1", "Read-only check for the explicitly seeded Neon scale preview.");
test.setTimeout(120000);
test("large preview keeps six home cards and ten results per listing page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/test");
    await expect(page.locator("#home-equipment-results a")).toHaveCount(6);
    await expect(page.getByRole("group", { name: "Latest updates", exact: true }).locator("[data-card-rail] > div")).toHaveCount(6);
    await expect(page.getByRole("navigation", { name: "Equipment categories" }).getByRole("link")).toHaveCount(11);
    for (const [route, label, total] of [["/test/products", "Catalogue products", 10], ["/test/blog", "Blog posts", 6]] as const) {
      const started = Date.now();
      await page.goto(route);
      const rail = page.getByRole("group", { name: label, exact: true });
      await expect(rail.locator("[data-card-rail] > div")).toHaveCount(10);
      await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText(`Page 1 of ${total}`);
      console.log(`${route} at ${width}px: first 10 cards ready in ${Date.now() - started}ms (local dev, not a production benchmark)`);
      await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: `Page ${total}`, exact: true }).click();
      await expect(rail.locator("[data-card-rail] > div")).toHaveCount(10);
      await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText(`Page ${total} of ${total}`);
      if (width === 390) {
        await rail.getByRole("button", { name: `Next in ${label}`, exact: true }).click();
        await expect(rail.getByText("2 / 10", { exact: true })).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await rail.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/scale-${label.replaceAll(" ", "-")}-${width}.png`, caret: "initial" });
    }
  }
  await page.goto("/test/products?cat=test-teaching-microscopy");
  await expect(page.getByRole("group", { name: "Catalogue products", exact: true }).locator("[data-card-rail] > div")).toHaveCount(10);
  await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
  expect(errors).toEqual([]);
});
