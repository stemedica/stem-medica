import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3000" });
test.skip(process.env.QA_NEON_PREVIEW !== "1", "Read-only checks for the connected Neon preview.");

test("migrated test content renders and admin data remains protected", async ({ page, request }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("main")).toContainText("BeneVision N1");
    for (const [slug, name] of [["test", "Sterilization & infection control — test"], ["test2", "Laboratory equipment — test"]]) {
      await page.goto(`/products?cat=${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
      await expect(page.locator("main").getByRole("link", { name: slug === "test" ? /Vacuklav 31 B/ : /CX23 biological/ })).toBeVisible();
      await page.goto(`/products?cat=${slug}&q=no-such-equipment-qa`);
      await expect(page.getByRole("heading", { name: "No matching equipment" })).toBeVisible();
      await expect(page.locator("main").locator('a[href^="/quote"]')).toHaveCount(0);
      await page.getByRole("link", { name: "Clear search", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`cat=${slug}$`));
      if (width === 390) await page.screenshot({ path: `test-results/category-${slug}-mobile.png`, fullPage: true });
    }
    await page.goto("/products/test-mindray-benevision-n1");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("BeneVision N1");
    await page.goto("/blog/test-preparing-an-equipment-enquiry");
    await expect(page.locator("main")).toContainText("test");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  for (const path of ["/admin/api/catalogue", "/admin/api/posts", "/admin/api/drafts"]) {
    expect((await request.get(path)).status()).toBe(401);
  }
  expect(errors).toEqual([]);
});
