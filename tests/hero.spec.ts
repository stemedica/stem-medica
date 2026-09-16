import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.QA_AUTH_E2E ? "http://127.0.0.1:3001" : "http://127.0.0.1:3000" });

test("abstract hero fills the background, settles and stays usable on mobile", async ({ page }) => {
  const media: string[] = [];
  page.on("request", request => { if (request.url().includes("hero-preview")) media.push(request.url()); });
  await page.goto("/test");
  const hero = page.getByRole("region", { name: /Equipment for/ });
  await expect(hero.locator("video")).toHaveCount(0);
  const ribbon = hero.locator(".hero-ribbon-front");
  await expect(ribbon).toHaveCSS("animation-iteration-count", "1");
  await expect(ribbon).toHaveCSS("animation-duration", "4.8s");
  await expect(hero.getByRole("button", { name: /background animation/ })).toHaveCount(0);
  const bg = await hero.locator(".hero-animation").boundingBox();
  const frame = await hero.locator(".hero-animation").locator("..").boundingBox();
  expect(bg!.width).toBeCloseTo(frame!.width, 0);
  expect(bg!.height).toBeCloseTo(frame!.height, 0);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const action = await hero.getByRole("link", { name: "Browse equipment" }).boundingBox();
    expect(action!.y + action!.height).toBeLessThan(810);
    if (width < 640) {
      const frame = await hero.locator(".hero-animation").boundingBox();
      expect(frame!.height).toBeGreaterThanOrEqual(900 - 132);
      const down = hero.getByRole("link", { name: "Scroll down to explore equipment" });
      await expect(down).toBeVisible();
      await expect(down).toHaveAttribute("href", "#equipment");
    }
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/hero-animation-${width}.png` });
  }
  expect(media).toHaveLength(0);
});

test("reduced motion keeps the hero still and calls to action accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/test");
  await expect(page.locator(".hero-ribbon-front")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-scroll-arrow")).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("button", { name: "Pause background animation" })).toBeHidden();
  await expect(page.getByRole("region", { name: /Equipment for/ }).getByRole("link", { name: "Request a quote" })).toHaveAttribute("href", "/test/quote");
});
