import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

// Render outside Playwright's JSX component transform using the app's TS loader.
function renderSkeleton(variant: string) {
  return execFileSync(process.execPath, ["--import", "tsx", "-e", `
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const { PageSkeleton } = require('./src/components/PageSkeleton.tsx');
    process.stdout.write(renderToStaticMarkup(React.createElement(PageSkeleton, { variant: ${JSON.stringify(variant)}, label: 'Loading content…' })));
  `], { encoding: "utf8" });
}

test.use({ baseURL: "http://127.0.0.1:3000" });

test("skeleton layouts are accessible, responsive and reduced-motion safe", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const variant of ["page", "catalogue", "product", "blog", "article", "admin"] as const) {
      const html = renderSkeleton(variant);
      await page.locator("main").evaluate((main, markup) => { main.innerHTML = markup; }, html);
      const skeleton = page.locator("[data-loading-skeleton]");
      await expect(skeleton.getByRole("status")).toHaveText("Loading content…");
      await expect(skeleton.locator("button, a, input")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 390 && variant === "blog") await page.screenshot({ path: "test-results/skeleton-blog-mobile.png" });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".skeleton-block").first()).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".skeleton-block").first()).toHaveCSS("animation-name", "skeleton-breathe");
  await page.goto("/blog");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-loading-skeleton]:visible")).toHaveCount(0);
});
