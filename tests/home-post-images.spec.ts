import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3000" });
test.skip(process.env.QA_NEON_PREVIEW !== "1", "Read-only checks for local Neon test content.");

test("homepage posts reserve image space on mobile and desktop", async ({ page }) => {
  test.setTimeout(420_000);
  // Direct test-data seeding does not invoke the admin API's cache invalidation.
  // Allow the existing five-minute public cache to refresh without changing app behaviour.
  await expect(async () => {
    await page.goto("/test/blog");
    await expect(page.locator('main article img[src^="/test/media/"]')).toHaveCount(3, { timeout: 1000 });
  }).toPass({ timeout: 330_000, intervals: [10_000] });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/test");
    const section = page.getByRole("region", { name: "Latest updates and blog" });
    const cards = section.locator('a[href^="/test/blog/"]');
    expect(await cards.count()).toBeGreaterThan(1);
    for (const card of await cards.all()) {
      const cover = card.locator('img, [role="img"]');
      await expect(cover).toHaveCount(1);
      const box = await cover.boundingBox();
      expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `test-results/home-post-images-${width}.png` });
    await page.goto("/test/blog");
    const blogCovers = page.locator('main article img[src^="/test/media/"]');
    await expect(blogCovers).toHaveCount(3);
    for (const cover of await blogCovers.all()) {
      await expect(cover).toBeVisible();
      await expect.poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/blog-post-images-${width}.png`, fullPage: true });
  }
  await page.goto("/test/blog/test-preparing-an-equipment-enquiry");
  const articleCover = page.locator('main article > figure img');
  await expect(articleCover).toBeVisible();
  await expect.poll(() => articleCover.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});
