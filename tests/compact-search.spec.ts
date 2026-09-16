import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3000" });
test("equipment search stays compact and submits search and category together", async ({ page }) => {
  await page.goto("/test/products");
  const form = page.getByRole("search", { name: "Find equipment" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(form).toBeVisible();
    expect((await form.boundingBox())!.height).toBeLessThanOrEqual(width < 640 ? 100 : 48);
    for (const control of [form.getByLabel("Search equipment"), form.getByLabel("Category"), form.getByRole("button", { name: "Search", exact: true })]) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) await form.screenshot({ path: `test-results/compact-search-${width}.png`, caret: "initial" });
  }
  const category = await form.getByLabel("Category").locator("option").nth(1).getAttribute("value");
  await form.getByLabel("Category").selectOption(category!);
  await form.getByLabel("Search equipment").fill("no-match-compact-search");
  await form.getByLabel("Search equipment").press("Enter");
  await expect(page).toHaveURL(/q=no-match-compact-search/);
  expect(new URL(page.url()).searchParams.get("cat")).toBe(category);
  await expect(page.getByRole("heading", { name: "No matching equipment" })).toBeVisible();
  await page.getByRole("link", { name: "Clear filters", exact: true }).click();
  await expect(form.getByLabel("Search equipment")).toHaveValue("");
  await expect(form.getByLabel("Category")).toHaveValue("");
});
