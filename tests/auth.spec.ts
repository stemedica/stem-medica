import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:3001", trace: "off", screenshot: "off" });
test.skip(process.env.QA_AUTH_E2E !== "1", "Run only against the disposable authentication database.");
test.setTimeout(120000);
test("email and password protect every admin surface", async ({ page, request }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/login/);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const path of ["catalogue", "posts", "drafts", "media", "history"]) expect((await request.get(`/admin/api/${path}`)).status()).toBe(401);
  expect((await request.post("/api/auth/sign-up/email", { data: {} })).status()).toBe(404);
  expect((await request.post("/api/auth/sign-in/email", { headers: { Origin: "https://untrusted.example" }, data: {} })).status()).toBe(403);

  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Test12345!");
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect((await page.request.get("/admin/api/posts")).status()).toBe(200);
  const beforeLogout = await page.context().cookies();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/login/);
  expect((await request.get("/admin/api/posts", { headers: { Cookie: beforeLogout.map((entry) => `${entry.name}=${entry.value}`).join("; ") } })).status()).toBe(401);

  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Password", { exact: true }).fill("wrong password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Unable to sign in" })).toHaveClass(/text-red-800/);
  await page.getByLabel("Password", { exact: true }).fill("Test12345!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(errors).toEqual([]);
  if (process.env.QA_STORAGE_STATE) await page.context().storageState({ path: process.env.QA_STORAGE_STATE });
});
