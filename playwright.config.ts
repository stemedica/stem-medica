import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "**/*.spec.ts", workers: 1,
  use: { browserName: "chromium", launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }, screenshot: "only-on-failure", trace: "retain-on-failure" },
});
