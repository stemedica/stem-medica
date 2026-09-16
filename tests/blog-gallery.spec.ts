import { test, expect } from "@playwright/test";
test.use({ baseURL: "http://127.0.0.1:3000" });
test.skip(process.env.QA_NEON_PREVIEW !== "1", "Read-only test branch check.");
test("test article has a cover and responsive CMS gallery", async ({ page }) => {
  test.setTimeout(420_000);
  await expect(async () => {
    await page.goto("/blog/test-preparing-an-equipment-enquiry");
    await expect(page.getByRole("region", { name: "Article gallery" })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 330_000, intervals: [10_000] });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const gallery = page.getByRole("region", { name: "Article gallery" });
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.locator("img")).toHaveCount(2);
    for (const image of await gallery.locator("img").all()) await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await gallery.screenshot({ path: `test-results/blog-gallery-${width}.png` });
  }
});
