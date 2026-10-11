import { test, expect, devices } from "@playwright/test";

const WINGS = "Buffalo wings (10)";

// any console error, page error, failed request, or 4xx/5xx a page sees fails the test
function guard(context, errors) {
  context.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  context.on("weberror", (e) => errors.push(`page error: ${e.error().message}`));
  context.on("requestfailed", (r) => {
    const why = r.failure()?.errorText;
    // a reload cancels the 2-second poll in flight; that's not a failure
    if (why !== "net::ERR_ABORTED") errors.push(`request failed: ${r.url()} ${why}`);
  });
  context.on("response", (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()}: ${r.url()}`));
  return context;
}

// the innermost div holding this dish's heading and a price = its card
const cardFor = (page, name) =>
  page.locator("div").filter({ has: page.getByRole("heading", { name, exact: true }), hasText: "$" }).last();

const plateCost = async (card) => {
  const text = await card.locator('dt:text-is("Plate cost") + dd').innerText();
  return Number(text.match(/\$([\d.]+)/g).pop().slice(1)); // last amount: "$3.63 → $4.23" while it flashes
};

test("invoice → over target → deal → claims → sold out", async ({ browser, page, request, baseURL }) => {
  const errors = [];
  guard(page.context(), errors);
  let before, dealId;

  await test.step("1. dashboard shows 3 dishes, wings not over target", async () => {
    await page.goto("/owner");
    await expect(page.getByRole("link", { name: "Drop a deal" })).toHaveCount(3);
    const wings = cardFor(page, WINGS);
    await expect(wings.getByText("Over cost target")).toHaveCount(0);
    before = await plateCost(wings);
  });

  await test.step("2. upload invoice, confirm wings line, save", async () => {
    await page.locator('input[type="file"]').setInputFiles("tests/fixtures/sample-invoice.png");
    await expect(page.getByRole("heading", { name: "Check the lines, then save" })).toBeVisible({ timeout: 90_000 });
    const rows = await page.$$eval("tbody tr", (trs) => trs.map((tr) => {
      const v = (label) => tr.querySelector(`[aria-label="${label}"]`).value;
      return { ingredient: v("Ingredient"), packCount: v("Pack count"), packSize: v("Pack size"), unit: v("Unit"), price: v("Line price in dollars") };
    }));
    const wings = rows.find((r) => r.ingredient === "chicken wings");
    expect(wings, JSON.stringify(rows)).toBeTruthy();
    expect(Number(wings.packCount)).toBe(4);
    expect(Number(wings.packSize)).toBe(10);
    expect(wings.unit).toBe("lb");
    expect(Number(wings.price)).toBe(136);
    await page.getByRole("button", { name: "Save costs" }).click();
    await expect(page.getByRole("heading", { name: /^Updated \d+ ingredient/ })).toBeVisible();
  });

  await test.step("3. wings now over target with a higher plate cost", async () => {
    const wings = cardFor(page, WINGS);
    await expect(wings.getByText("Over cost target")).toBeVisible();
    await expect.poll(() => plateCost(wings)).toBeGreaterThan(before);
  });

  await test.step("5. price below the minimum is blocked in the UI and the API", async () => {
    await cardFor(page, WINGS).getByRole("link", { name: "Drop a deal" }).click();
    await expect(page).toHaveURL(/\/owner\/deal/);
    await expect(page.getByLabel("Dish")).toHaveValue(WINGS);
    const price = page.getByLabel("Deal price ($)");
    await expect(price).not.toHaveValue("");
    await price.fill("4.00");
    await expect(page.getByText(/Price can.t go below/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Drop deal" })).toBeDisabled();
    const res = await request.post("/api/deals", { data: { dishName: WINGS, dealPrice: 400, qty: 2, expiresInMinutes: 60 } });
    expect(res.status()).toBe(400);
  });

  await test.step("4. drop a wings deal, quantity 2, at the suggested price", async () => {
    const suggested = (await page.getByText(/Suggested:/).innerText()).match(/Suggested: \$([\d.]+)/)[1];
    await page.getByLabel("Deal price ($)").fill(suggested);
    const fewer = page.getByRole("button", { name: "Fewer" });
    for (let i = 0; i < 8; i++) await fewer.click();
    await expect(fewer.locator("xpath=following-sibling::span[1]")).toHaveText("2");
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/deals") && r.request().method() === "POST"),
      page.getByRole("button", { name: "Drop deal" }).click(),
    ]);
    const deal = await res.json();
    expect(deal.dealPrice).toBe(Math.round(Number(suggested) * 100));
    dealId = deal._id;
    await expect(page.getByText("0 of 2")).toBeVisible();
  });

  const phone = guard(await browser.newContext({ ...devices["iPhone 13"], baseURL }), errors);
  const phonePage = await phone.newPage();

  await test.step("6. phone sees the deal within 5 seconds", async () => {
    await phonePage.goto("/deals");
    await expect(cardFor(phonePage, WINGS)).toBeVisible({ timeout: 5000 });
  });

  await test.step("7. claim on the phone; stays claimed after reload", async () => {
    const card = cardFor(phonePage, WINGS);
    await card.getByRole("button", { name: "Claim" }).click();
    await expect(card.getByText("Claimed!")).toBeVisible();
    await phonePage.reload();
    const after = cardFor(phonePage, WINGS);
    await expect(after.getByText("Claimed!")).toBeVisible();
    // the page swaps the Claim button for the "Claimed!" panel, so "disabled" means no Claim button
    await expect(after.getByRole("button", { name: "Claim" })).toHaveCount(0);
  });

  await test.step("8. third claim sells it out; further claims 409; page shows Sold out", async () => {
    const third = guard(await browser.newContext({ baseURL }), errors);
    const p = await third.newPage();
    await p.goto("/deals");
    const card = cardFor(p, WINGS);
    const [res] = await Promise.all([
      p.waitForResponse((r) => r.url().includes(`/api/deals/${dealId}/claim`)),
      card.getByRole("button", { name: "Claim" }).click(),
    ]);
    expect((await res.json()).qtyLeft).toBe(0);
    await expect(card.getByText("Claimed!")).toBeVisible();
    const again = await request.post(`/api/deals/${dealId}/claim`);
    expect(again.status()).toBe(409);
    expect(await again.json()).toEqual({ error: "Sold out" });
    // someone who hasn't claimed sees it sold out
    const fresh = await page.context().newPage();
    await fresh.goto("/deals");
    await expect(cardFor(fresh, WINGS).getByText("Sold out.")).toBeVisible({ timeout: 5000 });
    await fresh.close();
    await third.close();
  });

  await test.step("9. owner's live counter shows 2 of 2 within 5 seconds", async () => {
    await expect(page.getByText("2 of 2")).toBeVisible({ timeout: 5000 });
  });

  await phone.close();
  expect(errors).toEqual([]);
});
