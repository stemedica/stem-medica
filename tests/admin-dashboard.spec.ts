import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE });
test.skip(!process.env.QA_STORAGE_STATE, "Use npm run test:e2e:local.");

test("admin opens the mobile-first overview and navigates to each workspace", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect((await fetch("http://127.0.0.1:3001/admin/proformas", { redirect: "manual" })).status).toBe(307);
  await page.goto("/test/admin");
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proforma builder", exact: true })).toHaveCount(0);
  const { catalogue } = await (await request.get("/test/admin/api/catalogue")).json();
  const overview = page.getByRole("region", { name: "Content overview" });
  await expect(overview.getByRole("link", { name: /^Categories/ })).toHaveText(`Categories${catalogue.categories.length}`);
  await expect(page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const link of await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/admin-overview-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: /Open proforma builder/ }).click();
  await expect(page).toHaveURL(/\/admin\/proformas$/);
  await expect(page.getByRole("heading", { name: "Proforma builder", exact: true })).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Catalogue", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Catalogue loaded");
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Updates & blog", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Posts loaded.");
  expect(errors).toEqual([]);
});
