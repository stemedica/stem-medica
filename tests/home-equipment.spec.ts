import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.QA_AUTH_E2E ? "http://127.0.0.1:3001" : "http://127.0.0.1:3000" });
test.setTimeout(60000);
test("homepage puts browsable equipment immediately after the hero", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const equipment = page.getByRole("region", { name: "Explore our equipment." });
  await expect(equipment).toBeVisible();
  expect(await page.locator('section[aria-labelledby="hero-title"]').evaluate(el => el.nextElementSibling?.id)).toBe("equipment");
  const hero = page.getByRole("region", { name: /Equipment for/ });
  await expect(hero.getByRole("link").first()).toHaveText("Browse equipment");
  await expect(hero.getByRole("link").first()).toHaveAttribute("href", "#equipment");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await equipment.scrollIntoViewIfNeeded();
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/home-equipment-${width}.png` });
    const cards = equipment.locator('#home-equipment-results a');
    expect(await cards.count()).toBeLessThanOrEqual(6);
    if (await cards.count() >= 2) {
      const a = await cards.nth(0).boundingBox(), b = await cards.nth(1).boundingBox();
      expect(a!.y).toBeCloseTo(b!.y, 0);
      if (width < 640) {
        expect(b!.x).toBeLessThan(width);
        expect(b!.x + b!.width).toBeGreaterThan(width);
        await expect(equipment.getByRole("button", { name: "Previous product" })).toBeDisabled();
        for (let i = 1; i < await cards.count(); i++) {
          await equipment.getByRole("button", { name: "Next product", exact: true }).click();
          await expect(equipment.getByText(`${i + 1} / ${await cards.count()}`, { exact: true })).toBeVisible();
        }
        await expect(equipment.getByRole("button", { name: "Next product", exact: true })).toBeDisabled();
        await cards.first().focus();
        await expect.poll(() => equipment.locator("#equipment-product-rail").evaluate(el => el.scrollLeft)).toBeLessThan(5);
      }
    }
  }
  const filters = equipment.getByRole("navigation", { name: "Equipment categories" }).getByRole("link");
  for (let i = 1; i < await filters.count(); i++) {
    await filters.nth(i).click();
    await expect(filters.nth(i)).toHaveAttribute("aria-current", "true");
    await expect(page).toHaveURL(/\/$/);
    await expect(equipment.getByRole("status")).toContainText(/Showing|No equipment/);
    if (await equipment.getByRole("button", { name: "Show all equipment" }).count()) {
      await expect(equipment.getByRole("link", { name: /enquir/i })).toHaveCount(0);
    } else {
      await expect(equipment.getByRole("link", { name: "View category", exact: true })).toHaveAttribute("href", await filters.nth(i).getAttribute("href") ?? "");
    }
  }
  await filters.first().click();
  await expect(filters.first()).toHaveAttribute("aria-current", "true");
  expect(errors).toEqual([]);
});

test("mobile slide navigation resets on category changes and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const equipment = page.locator("#equipment");
  const filters = equipment.getByRole("navigation").getByRole("link");
  const next = equipment.getByRole("button", { name: "Next product", exact: true });
  if (await next.count() === 0 || await filters.count() < 2) {
    await expect(equipment.getByRole("heading", { name: "Our catalogue is being updated" })).toBeVisible();
    return;
  }
  await next.click();
  await expect(equipment.getByText(/^2 \/ /)).toBeVisible();
  await filters.nth(1).click();
  await filters.first().click();
  await expect(equipment.getByRole("button", { name: "Previous product" })).toBeDisabled();
  await expect.poll(() => equipment.locator("#equipment-product-rail").evaluate(el => el.scrollLeft)).toBe(0);
});

test("equipment and catalogue links remain available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.QA_AUTH_E2E ? "http://127.0.0.1:3001/" : "http://127.0.0.1:3000/");
  const equipment = page.getByRole("region", { name: "Explore our equipment." });
  await expect(equipment).toBeVisible();
  await expect(equipment.getByRole("link", { name: "Browse all equipment" })).toHaveAttribute("href", "/products");
  const filters = equipment.getByRole("navigation").getByRole("link");
  if (await filters.count() > 1) {
    await filters.nth(1).click();
    await expect(page).toHaveURL(/\/products\?cat=/);
  }
  await context.close();
});
