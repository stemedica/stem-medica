import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3000" });
test("seeded test equipment photos load on homepage, catalogue and product detail", async ({ page }) => {
  test.skip(process.env.QA_AUTH_E2E === "1", "Requires the Neon test image fixtures, not the isolated auth database.");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/products", "/products/test-mindray-benevision-n1"]) {
      await page.goto(route);
      const images = page.locator('img[src^="/media/01994eee"]');
      await expect(images.first()).toBeAttached();
      for (const img of await images.all()) {
        if (!await img.isVisible()) continue; // Responsive detail photos share one cached source.
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (route === "/") {
        await page.locator("#equipment-product-rail").evaluate(el => el.scrollTo({ left: 0, behavior: "instant" }));
        await page.locator("#equipment").scrollIntoViewIfNeeded();
      } else await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `test-results/equipment-images-${route === "/" ? "home" : route === "/products" ? "catalogue" : "detail"}-${width}.png` });
    }
  }
});
