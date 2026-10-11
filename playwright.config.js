import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests",
  timeout: 120_000, // the invoice step makes a real AI call
  globalSetup: "./tests/global-setup.js",
  use: { baseURL: BASE_URL ?? "http://localhost:3000", storageState: "tests/fixtures/auth.json" }, // written by global-setup
  webServer: BASE_URL ? undefined : {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // only Chromium is installed; the e2e spec opens its own phone context
    { name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium" }, testIgnore: /e2e/ },
  ],
});
