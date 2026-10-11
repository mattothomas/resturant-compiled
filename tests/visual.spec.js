import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "landing", path: "/", ready: (p) => p.getByRole("heading", { level: 1 }) },
  { name: "owner", path: "/owner", ready: (p) => p.getByRole("link", { name: "Drop a deal" }).first() },
  { name: "owner-deal", path: "/owner/deal", ready: (p) => p.getByText("Suggested:") },
  { name: "deals", path: "/deals", ready: (p) => p.getByText(/Claim|Sold out|Claimed!|No deals/).first() },
];

for (const { name, path, ready } of PAGES) {
  test(`${name} looks right`, async ({ page, request }, info) => {
    // locally, put a live deal on /deals so a real card gets checked; never create deals on a deployed site
    if (name === "deals" && !process.env.BASE_URL)
      await request.post("/api/deals", { data: { dishName: "Margherita pizza", dealPrice: 700, qty: 5, expiresInMinutes: 30 } });

    await page.goto(path);
    await expect(ready(page)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `tests/screenshots/${info.project.name}-${name}.png`, fullPage: true });

    const scroll = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect.soft(scroll[0], "horizontal scroll").toBeLessThanOrEqual(scroll[1]);

    const tiny = await page.evaluate(() => {
      const out = [];
      for (const el of document.body.querySelectorAll("*")) {
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        const s = getComputedStyle(el);
        if (hasText && el.getClientRects().length && s.visibility !== "hidden" && parseFloat(s.fontSize) < 16)
          out.push(`${el.tagName} "${el.textContent.trim().slice(0, 40)}" ${s.fontSize}`);
      }
      return out;
    });
    expect.soft(tiny, "text under 16px").toEqual([]);

    const short = await page.evaluate(() =>
      [...document.querySelectorAll("a, button")]
        .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden")
        .map((el) => [el.textContent.trim().slice(0, 40), el.getBoundingClientRect().height])
        .filter(([, h]) => h < 44)
        .map(([t, h]) => `"${t}" ${h}px`));
    expect.soft(short, "buttons/links under 44px tall").toEqual([]);

    const { violations } = await new AxeBuilder({ page }).exclude("nextjs-portal").analyze();
    const bad = violations.filter((v) => ["serious", "critical"].includes(v.impact))
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    expect.soft(bad, "serious/critical axe violations").toEqual([]);
  });
}
