import { execSync } from "node:child_process";
import { chromium, request } from "@playwright/test";

// every run starts clean, logged in as the demo restaurant, and the upload test gets a real image of the sample invoice
export default async function globalSetup(config) {
  execSync("npm run seed", { stdio: "inherit" });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.goto(new URL("/sample-invoice.html", config.projects[0].use.baseURL).href);
  await page.screenshot({ path: "tests/fixtures/sample-invoice.png", fullPage: true });
  await browser.close();

  process.loadEnvFile(".env.local");
  const api = await request.newContext({ baseURL: config.projects[0].use.baseURL });
  const res = await api.post("/api/auth/login", { data: { email: "demo@kitchen.test", password: process.env.DEMO_PASSWORD } });
  if (!res.ok()) throw new Error(`demo login failed: ${res.status()}`);
  await api.storageState({ path: "tests/fixtures/auth.json" });
  await api.dispose();
}
