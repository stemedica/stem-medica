import { test, expect } from "@playwright/test";
test.use({ baseURL: "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE });
test.skip(!process.env.QA_STORAGE_STATE, "Use npm run test:e2e:local.");

test("repeated Add clicks reuse blank records and rapid saves send one request", async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const snapshot = await (await request.get("/test/admin/api/catalogue")).json();
  if (!snapshot.catalogue.categories.length) {
    snapshot.catalogue.categories.push({ slug: "qa-duplicates", name: "QA duplicates", short: "QA", blurb: "", image: "" });
    expect((await request.put("/test/admin/api/catalogue", { headers: { Origin: "http://127.0.0.1:3001" }, data: snapshot })).ok()).toBe(true);
  }
  await page.goto("/test/admin/catalogue");
  await expect(page.getByRole("status")).toContainText("Catalogue loaded");
  await page.getByRole("button", { name: "Add product", exact: true }).dblclick();
  await expect(page.getByRole("button", { name: /^Untitled\s*Draft$/ })).toHaveCount(1);
  await page.getByRole("button", { name: "Reload", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Discard and reload" }).click();
  await page.goto("/test/admin/posts");
  await expect(page.getByRole("status")).toHaveText("Posts loaded.");
  await page.getByRole("button", { name: "Add post", exact: true }).dblclick();
  await expect(page.getByRole("button", { name: /^New post\s*Blog · Draft$/ })).toHaveCount(1);
  let saves = 0;
  await page.route("**/admin/api/posts", async (route) => {
    if (route.request().method() !== "PUT") return route.continue();
    saves++;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return route.fulfill({ status: 503, json: { error: "Please retry. Your edits are still here." } });
  });
  await page.getByRole("button", { name: /^Save (posts|draft|changes)$/, exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); button.click(); });
  await expect(page.getByRole("region", { name: "Save actions" }).getByRole("alert")).toContainText("Please retry");
  expect(saves).toBe(1);
  await page.screenshot({ path: "test-results/duplicate-feedback-mobile.png" });
});
