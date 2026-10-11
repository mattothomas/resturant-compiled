import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";

// every run starts clean, and the upload test gets a real image of the sample invoice
export default async function globalSetup(config) {
  execSync("npm run seed", { stdio: "inherit" });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.goto(new URL("/sample-invoice.html", config.projects[0].use.baseURL).href);
  await page.screenshot({ path: "tests/fixtures/sample-invoice.png", fullPage: true });
  await browser.close();
}
