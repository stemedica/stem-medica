import { expect, test } from "@playwright/test";

const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3001";
const widths = [320, 390, 768, 1440];

test.use({ baseURL, storageState: process.env.QA_STORAGE_STATE });
test.setTimeout(120_000);

async function expectResponsiveControls(page: import("@playwright/test").Page, route: string) {
  await page.goto(route, { waitUntil: "networkidle" });
  const audit = await page.evaluate(() => {
    const visible = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const controls = [...document.querySelectorAll("button, [role=button], a.btn-primary, a.btn-outline, a.btn-ghost, .v2-btn")].filter(visible);
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      undersized: controls.map((element) => {
        const rect = element.getBoundingClientRect();
        return { label: element.getAttribute("aria-label") || element.textContent?.trim(), width: rect.width, height: rect.height };
      }).filter(({ width, height }) => width < 44 || height < 44),
      clipped: controls.filter((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
        .map((element) => element.getAttribute("aria-label") || element.textContent?.trim()),
    };
  });
  expect(audit, `${route} at ${await page.evaluate(() => innerWidth)}px`).toEqual({ overflow: 0, undersized: [], clipped: [] });
}

test("public actions remain usable from narrow phones through desktop", async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/products", "/service", "/blog", "/about", "/contact", "/quote", "/auth/login"]) {
      await expectResponsiveControls(page, route);
    }
  }
});

test("admin actions remain usable from narrow phones through desktop", async ({ page }) => {
  test.skip(!process.env.QA_STORAGE_STATE, "Run against the isolated authenticated browser suite.");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/admin", "/admin/catalogue", "/admin/posts", "/admin/enquiries", "/admin/proformas"]) {
      await expectResponsiveControls(page, route);
    }
  }
});
