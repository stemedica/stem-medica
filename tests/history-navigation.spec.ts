import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE });
test.skip(!process.env.QA_STORAGE_STATE, "Use npm run test:e2e:local.");
test.setTimeout(60000);

for (const editor of [
  { route: "posts", nav: "Updates & blog", field: "Title", add: "Add post" },
  { route: "catalogue", nav: "Catalogue", field: "Name", add: "Add product" },
  { route: "proformas", nav: "Proformas", field: "Name", add: "" },
]) {
  test(`${editor.route}: history cancel preserves edits, approval leaves, clean history works`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const nativeDialogs: string[] = [];
    page.on("dialog", async dialog => { nativeDialogs.push(dialog.type()); await dialog.dismiss(); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin");
    await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: editor.nav, exact: true }).click();
    if (editor.add) await page.getByRole("button", { name: editor.add, exact: true }).click();
    const field = page.getByLabel(editor.field, { exact: true });
    await field.fill("Keep these unsaved edits");
    const length = await page.evaluate(() => history.length);
    // Do not await goBack's page load: the intended result is a blocked traversal.
    await page.evaluate(() => history.back());
    const modal = page.getByRole("dialog", { name: "Leave without saving?" });
    await expect(modal).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/admin/${editor.route}$`));
    await expect(modal.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
    await page.screenshot({ path: `test-results/history-${editor.route}-mobile.png` });
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
    await expect(field).toHaveValue("Keep these unsaved edits");
    await expect(field).toBeFocused();
    expect(await page.evaluate(() => history.length)).toBe(length);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => history.back());
    await expect(modal).toBeVisible();
    await page.screenshot({ path: `test-results/history-${editor.route}-desktop.png` });
    await modal.getByRole("button", { name: "Leave page", exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.evaluate(() => history.forward());
    await expect(page).toHaveURL(new RegExp(`/admin/${editor.route}$`));
    await expect(page.getByRole("dialog")).not.toBeVisible();
    // A clean editor can leave normally; no history trap or duplicate entries.
    await page.getByRole("heading", { name: editor.route === "proformas" ? "Proforma builder" : editor.nav, exact: true }).waitFor();
    await page.evaluate(() => history.back());
    await expect(page).toHaveURL(/\/admin$/);
    expect(nativeDialogs).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("dirty editor protects Forward and multi-entry traversal without dropping forward history", async ({ page }) => {
  await page.goto("/admin");
  const nav = page.getByRole("navigation", { name: "Admin navigation" });
  await nav.getByRole("link", { name: "Proformas", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).waitFor();
  await nav.getByRole("link", { name: "Updates & blog", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Posts loaded.");
  await page.goBack();
  const field = page.getByLabel("Name", { exact: true });
  await field.fill("Forward must ask too");
  await page.evaluate(() => history.forward());
  const modal = page.getByRole("dialog", { name: "Leave without saving?" });
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(field).toHaveValue("Forward must ask too");
  await page.evaluate(() => history.forward());
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Leave page", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/posts$/);
  await page.getByRole("button", { name: "Add post", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Multi-entry test");
  await page.evaluate(() => history.go(-2));
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Multi-entry test");
  await page.evaluate(() => history.go(-2));
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Leave page", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("hash entries, repeated Back, save and reload retain normal history behaviour", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name: "Proformas", exact: true }).click();
  const field = page.getByLabel("Name", { exact: true });
  await field.fill("History regression draft");
  await page.evaluate(() => { location.hash = "proforma-doc"; });
  await expect(page).toHaveURL(/#proforma-doc$/);
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/admin\/proformas$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(field).toHaveValue("History regression draft");
  await page.evaluate(() => history.back());
  const modal = page.getByRole("dialog", { name: "Leave without saving?" });
  await expect(modal).toBeVisible();
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/admin\/proformas$/);
  await modal.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(field).toHaveValue("History regression draft");
  const warning = page.waitForEvent("dialog");
  // A dismissed reload never reaches "load"; bound the navigation promise.
  const reload = page.reload({ timeout: 2000 }).catch(() => null);
  const dialog = await warning;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.dismiss();
  await reload;
  await expect(field).toHaveValue("History regression draft");
  await page.getByRole("button", { name: "Save as draft", exact: true }).click();
  await expect(page.getByRole("region", { name: "Save actions" })).toContainText("No unsaved changes");
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
