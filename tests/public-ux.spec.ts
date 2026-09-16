import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { previewCatalogue, previewPosts } from "../scripts/fixtures/local-preview-content";

test.use({ baseURL: "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE, extraHTTPHeaders: { Origin: "http://127.0.0.1:3001" } });
test.skip(!process.env.QA_STORAGE_STATE, "Use the isolated local test runner.");

test("public pages reflow on phones and tablets, filter live CMS data and preserve browsing context", async ({ page, request }) => {
  test.setTimeout(120_000);
  const previousCatalogue = await (await request.get("/admin/api/catalogue")).json();
  const previousPosts = await (await request.get("/admin/api/posts")).json();
  const catalogue = structuredClone(previewCatalogue);
  catalogue.categories.push({ slug: "test-empty", name: "Empty category", short: "Empty", blurb: "", image: "" });
  const longName = "PortableMonitor".repeat(10);
  catalogue.products.push(...Array.from({ length: 25 }, (_, i) => ({ ...previewCatalogue.products[0], slug: `test-extra-${i}`, name: i === 0 ? longName : `Preview monitor ${i}`, featured: false })));
  const posts = [...previewPosts, ...Array.from({ length: 12 }, (_, i) => ({ ...previewPosts[0], id: randomUUID(), slug: `test-article-${i}`, title: `Procurement note ${i} — test`, date: "2026-09-01" }))];
  expect((await request.put("/admin/api/catalogue", { data: { catalogue, etag: previousCatalogue.etag } })).ok()).toBeTruthy();
  expect((await request.put("/admin/api/posts", { data: { posts, etag: previousPosts.etag } })).ok()).toBeTruthy();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/hydration|hydrated|didn't match/i.test(message.text())) errors.push(message.text()); });
  try {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/products?cat=test-patient-monitoring", "/blog", "/blog/test-preparing-an-equipment-enquiry", "/products/test-mindray-benevision-n1", "/about", "/service", "/contact", "/quote"]) {
        await page.goto(path);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${path}`).toBe(true);
        await expect(page.locator("main")).not.toContainText(/lorem ipsum|Bilingual, when the copy is ready/i);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const browse = page.getByRole("link", { name: "Browse equipment", exact: true }).first();
    expect((await browse.boundingBox())!.y + (await browse.boundingBox())!.height).toBeLessThan(780);
    await page.screenshot({ path: "test-results/public-home-mobile.png", fullPage: true, caret: "initial" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Products", exact: true }).click();
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("test-patient-monitoring");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Patient monitoring — test");
    await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText("Page 1 of 2");
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(/cat=test-patient-monitoring.*page=2/);
    await page.getByRole("link", { name: "Previous", exact: true }).click();
    await page.getByLabel("Search equipment").fill("BeneVision N1 patient monitor");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("1 product matching", { exact: false })).toBeVisible();
    await page.screenshot({ path: "test-results/public-category-mobile.png", fullPage: true, caret: "initial" });
    await page.locator("main").getByRole("link", { name: /BeneVision N1 patient monitor/ }).click();
    await expect(page.locator("main").getByRole("link", { name: "Patient monitoring — test", exact: true })).toHaveAttribute("href", "/products?cat=test-patient-monitoring");
    await page.goto("/products?cat=test-empty");
    await expect(page.getByRole("heading", { name: "No equipment listed yet" })).toBeVisible();
    await expect(page.locator("main").locator('a[href^="/quote"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Browse all equipment" })).toHaveAttribute("href", "/products");
    await page.goto("/products?cat=does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Category unavailable");
    await page.goto("/blog");
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText("Page 2 of 2");
    await page.getByLabel("Search updates").fill("equipment enquiry");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Preparing a useful equipment enquiry — test article" })).toBeVisible();
    await page.goto("/blog/test-preparing-an-equipment-enquiry");
    await page.getByText("In this article", { exact: true }).click();
    await page.getByRole("navigation", { name: "In this article" }).getByRole("link", { name: "Review the quotation details" }).click();
    const heading = page.getByRole("heading", { name: "Review the quotation details" });
    expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(72);
    await page.goto("/blog/test-preparing-an-equipment-enquiry");
    await page.screenshot({ path: "test-results/public-article-mobile.png", fullPage: true, caret: "initial" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/blog");
    await page.screenshot({ path: "test-results/public-blog-desktop.png", fullPage: true, caret: "initial" });
    // A CMS update must reach the public page immediately, without changing code.
    const latest = await (await request.get("/admin/api/catalogue")).json();
    latest.catalogue.categories[0].name = "Updated monitoring category";
    expect((await request.put("/admin/api/catalogue", { data: latest })).ok()).toBeTruthy();
    await page.goto("/products?cat=test-patient-monitoring");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Updated monitoring category");
    await page.goto("/blog/not-a-real-post");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page isn’t available");
    expect(errors).toEqual([]);
  } finally {
    const c = await (await request.get("/admin/api/catalogue")).json();
    const p = await (await request.get("/admin/api/posts")).json();
    expect((await request.put("/admin/api/catalogue", { data: { catalogue: previousCatalogue.catalogue, etag: c.etag } })).ok()).toBeTruthy();
    expect((await request.put("/admin/api/posts", { data: { posts: previousPosts.posts, etag: p.etag } })).ok()).toBeTruthy();
  }
});
