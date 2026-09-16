import { test, expect } from "@playwright/test";
import { previewCatalogue, previewPosts } from "../scripts/fixtures/local-preview-content";

test.use({ baseURL: "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE });
test.skip(!process.env.QA_AUTH_E2E || !process.env.QA_STORAGE_STATE, "Uses disposable authenticated test storage only.");
test.setTimeout(120000);

test("six homepage previews, ten per listing page, filters and mobile rails", async ({ page, request }) => {
  const posts = Array.from({ length: 25 }, (_, i) => ({ ...previewPosts[0], id: crypto.randomUUID(), slug: `qa-story-${i}`, title: `QA story ${i}`, kind: "Blog", published: true }));
  const products = Array.from({ length: 25 }, (_, i) => ({ ...previewCatalogue.products[0], slug: `qa-equipment-${i}`, name: `QA equipment ${i}`, published: true }));
  const postSnapshot = await (await request.get("/test/admin/api/posts")).json();
  expect((await request.put("/test/admin/api/posts", { data: { posts, etag: postSnapshot.etag }, headers: { Origin: "http://127.0.0.1:3001" } })).ok()).toBe(true);
  const catalogueSnapshot = await (await request.get("/test/admin/api/catalogue")).json();
  expect((await request.put("/test/admin/api/catalogue", { data: { catalogue: { categories: previewCatalogue.categories, products }, etag: catalogueSnapshot.etag }, headers: { Origin: "http://127.0.0.1:3001" } })).ok()).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/test");
  const latest = page.getByRole("group", { name: "Latest updates", exact: true });
  await expect(latest.locator("[data-card-rail] > div")).toHaveCount(6);
  await expect(page.locator("#home-equipment-results a")).toHaveCount(6);
  await latest.getByRole("button", { name: "Next in Latest updates", exact: true }).click();
  await expect(latest.getByText("2 / 6", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "View all updates", exact: true }).click();
  for (const [route, label] of [["/test/blog?kind=Blog&q=QA", "Blog posts"], ["/test/products?q=QA", "Catalogue products"]]) {
    await page.goto(route);
    let rail = page.getByRole("group", { name: label, exact: true });
    await expect(rail.locator("[data-card-rail] > div")).toHaveCount(10);
    await rail.getByRole("button", { name: `Next in ${label}`, exact: true }).click();
    await expect(rail.getByText("2 / 10", { exact: true })).toBeVisible();
    await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Page 2", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/q=QA/);
    rail = page.getByRole("group", { name: label, exact: true });
    await expect(rail.locator("[data-card-rail] > div")).toHaveCount(10);
    await expect(rail.getByRole("button", { name: `Previous in ${label}`, exact: true })).toBeDisabled();
    await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Page 3", exact: true }).click();
    await expect(rail.locator("[data-card-rail] > div")).toHaveCount(5);
    await expect(page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Next", exact: true })).toHaveCount(0);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await rail.scrollIntoViewIfNeeded();
      if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/rails-${label.replaceAll(" ", "-")}-${width}.png` });
    }
    await page.setViewportSize({ width: 390, height: 844 });
  }
  expect(errors).toEqual([]);
});
