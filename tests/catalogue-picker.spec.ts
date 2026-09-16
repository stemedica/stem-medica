import { test, expect } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
test.use({ baseURL: process.env.QA_BASE_URL ?? "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE });
test.skip(!process.env.QA_STORAGE_STATE, "Run npm run test:e2e:local for isolated authenticated tests.");

test("catalogue picker recovers, searches and preserves manual items", async ({ page, request }) => {
  // Explicit fixtures only: the application no longer seeds demo catalogue data.
  const snapshot = await (await request.get("/test/admin/api/catalogue")).json();
  const catalogue = snapshot.catalogue;
  catalogue.categories.push({ slug: "qa-picker", name: "QA picker", short: "QA", blurb: "Test category", image: "" });
  catalogue.products.push({ slug: "qa-picker-monitor", name: "QA picker monitor", brand: "QA", origin: "Test", category: "qa-picker", image: "", summary: "Test fixture", availability: "On request", leadTime: "Confirm on enquiry", featured: true, published: true, specs: [], services: [] });
  expect((await request.put("/test/admin/api/catalogue", { headers: { Origin: process.env.QA_BASE_URL ?? "http://127.0.0.1:3001" }, data: { catalogue, etag: snapshot.etag } })).status()).toBe(200);
  await page.goto("/test/admin/proformas");
  await page.route("**/admin/api/catalogue", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await page.getByRole("button", { name: "Browse catalogue" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Catalogue unavailable" })).toContainText("enter an item manually");
  await page.unroute("**/admin/api/catalogue");
  const response = await page.request.get("/test/admin/api/catalogue");
  const saved = await response.json();
  const product = saved.catalogue.products.find((entry: { published: boolean }) => entry.published);
  expect(product).toBeTruthy();
  await page.getByRole("button", { name: "Browse catalogue" }).click();
  await page.getByLabel("Search catalogue").fill("no-matching-equipment-123456789");
  await expect(page.getByText("No published products match.", { exact: false })).toBeVisible();
  await page.getByLabel("Search catalogue").fill(product.name);
  await page.getByRole("button", { name: `Add ${product.name}`, exact: true }).click();
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue(`${product.name} — ${product.brand}`);
  await page.getByLabel("Price", { exact: true }).fill("1250");
  await page.getByRole("button", { name: `Add ${product.name}`, exact: true }).click();
  await expect(page.getByLabel("Description", { exact: true })).toHaveCount(2);
  await expect(page.getByLabel("Price", { exact: true }).first()).toHaveValue("1250");
  await expect(page.getByLabel("Price", { exact: true }).last()).toHaveValue("0");
  await page.getByLabel("Search catalogue").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/picker-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Search catalogue").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/picker-mobile.png" });
});
