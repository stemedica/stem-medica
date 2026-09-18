import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3001", storageState: process.env.QA_STORAGE_STATE });
test.skip(!process.env.QA_STORAGE_STATE, "Use npm run test:e2e:local.");

test("a public quotation request is saved and appears in the admin inbox", async ({ browser, page }) => {
  const publicContext = await browser.newContext({ baseURL: "http://127.0.0.1:3001" });
  const quote = await publicContext.newPage();
  await quote.goto("/quote");
  await quote.getByLabel("Hospital or organization").fill("QA Clinic");
  await quote.getByLabel("Your name").fill("Test requester");
  await quote.getByLabel("Phone number").fill("+251900000000");
  await quote.getByLabel("Equipment needed").fill("Patient monitor");
  await quote.getByRole("button", { name: "Send quotation request" }).click();
  await expect(quote.getByRole("status")).toContainText("request is saved");
  await publicContext.close();

  await page.goto("/admin/enquiries");
  await expect(page.getByRole("heading", { name: "QA Clinic" })).toBeVisible();
  await expect(page.getByText("Patient monitor", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Call \+251900000000/ })).toHaveAttribute("href", "tel:+251900000000");
});

test("quotation submission works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3001", javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/quote");
  await page.getByLabel("Hospital or organization").fill("No-script Clinic");
  await page.getByLabel("Your name").fill("No-script requester");
  await page.getByLabel("Phone number").fill("0911000000");
  await page.getByLabel("Equipment needed").fill("Microscope");
  await page.getByRole("button", { name: "Send quotation request" }).click();
  await expect(page).toHaveURL(/\/quote\?sent=1$/);
  await expect(page.getByRole("status")).toContainText("request is saved");
  await context.close();
});
