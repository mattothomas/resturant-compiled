# PLAN.MD

Oct 11, 2026 · @leon

## Scope

The app is four screens and five API routes. Everything else is seeded, faked, or cut. Lean on an AI coding agent for scaffolding and boilerplate; spend your own attention on the invoice step and the claim logic.

**Build:**

1. **Owner dashboard** (`/owner`): seeded dishes as cards with plate cost, price, and margin; an Upload invoice button.
2. **Invoice confirm panel** on the dashboard: AI-extracted lines in an editable table, then Save.
3. **Deal drop** (`/owner/deal`): dish, quantity, price (can't go below plate cost), Drop deal.
4. **Live deals** (`/deals`): student phone page that refreshes every 2 seconds, with a Claim button.
5. **Landing** (`/`): only if time allows. A headline and two big buttons is enough.

**Skip:** logins, a dish setup page, ingredient matching (seed names that match the invoice), price alerts, multi-page PDFs, live push, claim codes per device beyond a simple browser check.

**Flag wording:** a dish is flagged when its food cost is over the owner's target (default 35% of menu price). Label it "Over cost target," not "losing money": plate cost rarely exceeds the menu price, so the honest claim is that the margin is too thin.

## Stack and setup

One Next.js app deployed to Vercel, MongoDB Atlas for data, the DeepSeek API for reading invoices. Deploy a blank page in the first 15 minutes so environment problems show up early, not at 7:30.

| Piece | Choice |
| --- | --- |
| App | Next.js (App Router) + Tailwind, from `npx create-next-app@latest` |
| Hosting | Vercel, deploy on every git push |
| Database | MongoDB Atlas free cluster, `mongodb` npm driver |
| Invoice reading | `@anthropic-ai/sdk` pointed at DeepSeek's Anthropic-compatible endpoint, model `deepseek-v4.1-flash` (confirm it accepts images; if not, see "If you're behind") |

Setup checklist:

- [ ] Create the Next.js app, push to GitHub, import into Vercel
- [ ] Create the Atlas cluster; for tonight, allow access from anywhere (Vercel's IPs change). Delete the cluster or lock it down after the event.
- [ ] Put `MONGODB_URI` and `DEEPSEEK_API_KEY` in `.env.local` and in Vercel's environment variables. Never prefix them with `NEXT_PUBLIC_`, or they ship to the browser.
- [ ] Add `export const maxDuration = 60;` to the invoice route so a slow AI call isn't cut off
- [ ] Shrink photos in the browser before upload (about 1600px wide, JPEG). Vercel functions reject request bodies over about 4.5 MB, and phone photos are often bigger.

API reference: [DeepSeek API docs](https://api-docs.deepseek.com/)

## Build order

About 2 hours of building, in an order where every step leaves something working your video teammate can film. Times are elapsed from when you start; 8:00 is the hard stop.

| # | Step | Time | Done by | Done when | Hand to video |
| --- | --- | --- | --- | --- | --- |
| 1 | Setup | 15 min | +0:15 | Blank page loads on the Vercel URL |  |
| 2 | Seed data + dashboard | 25 min | +0:40 | `/owner` shows 3 dish cards with plate costs from MongoDB; one is flagged | Film the dashboard |
| 3 | Invoice upload + AI read | 35 min | +1:15 | Upload a photo or 1-page PDF, see extracted lines in the panel |  |
| 4 | Confirm + recompute | 15 min | +1:30 | Save updates ingredient costs and the cards change | Film the upload flow |
| 5 | Deal drop + live deals + claim | 30 min | +2:00 | Deal dropped on laptop shows on a phone within 2 seconds; Claim lowers the count | Film the drop with real phones |
| 6 | Landing page | 15 min | +2:15 | Headline, two buttons, live deal count | Film the opening shot |

If you're behind at step 4, skip step 6. Stop coding 15 minutes before 8:00 and only fix bugs your teammate hits while filming.

Tell your teammate the Vercel URL as soon as step 1 is done, so they can plan shots around the real pages.

## Data and seed

Three collections. Every ingredient has one base unit (g, ml, or each), recipes are written in that base unit, and money is in cents, so plate cost is plain multiplication with no conversions at read time.

| Collection | Fields |
| --- | --- |
| ingredients | name, unit (`g` / `ml` / `each`), costPerUnit (cents per base unit) |
| dishes | name, price (cents), lines: \[{ ingredient (name), qty }\] |
| deals | dishName, normalPrice, dealPrice, qtyLeft, expiresAt |

Have your agent write a one-off script that inserts this data. The prices are placeholders: replace them with numbers from the real invoice if you get one. Wings sit at 33% food cost on purpose. An invoice with wings at $3.40/lb pushes them to about 38% and over the 35% target, so the flag appears live in the demo.

```json
{
  "ingredients": [
    { "name": "flour",               "unit": "g",    "costPerUnit": 0.1323 },
    { "name": "tomato sauce",        "unit": "g",    "costPerUnit": 0.1667 },
    { "name": "mozzarella",          "unit": "g",    "costPerUnit": 0.8818 },
    { "name": "olive oil",           "unit": "ml",   "costPerUnit": 1.0 },
    { "name": "sub roll",            "unit": "each", "costPerUnit": 50 },
    { "name": "chicken breast",      "unit": "g",    "costPerUnit": 0.6614 },
    { "name": "chicken wings",       "unit": "g",    "costPerUnit": 0.6173 },
    { "name": "hot sauce",           "unit": "ml",   "costPerUnit": 0.317 },
    { "name": "blue cheese dressing", "unit": "g",   "costPerUnit": 0.8818 },
    { "name": "celery",              "unit": "g",    "costPerUnit": 0.3307 }
  ],
  "dishes": [
    { "name": "Margherita pizza", "price": 1400, "lines": [
      { "ingredient": "flour", "qty": 250 }, { "ingredient": "tomato sauce", "qty": 120 },
      { "ingredient": "mozzarella", "qty": 200 }, { "ingredient": "olive oil", "qty": 10 } ] },
    { "name": "Chicken parm sub", "price": 1200, "lines": [
      { "ingredient": "sub roll", "qty": 1 }, { "ingredient": "chicken breast", "qty": 225 },
      { "ingredient": "mozzarella", "qty": 85 }, { "ingredient": "tomato sauce", "qty": 90 } ] },
    { "name": "Buffalo wings (10)", "price": 1100, "lines": [
      { "ingredient": "chicken wings", "qty": 450 }, { "ingredient": "hot sauce", "qty": 60 },
      { "ingredient": "blue cheese dressing", "qty": 60 }, { "ingredient": "celery", "qty": 40 } ] }
  ]
}
```

Starting food cost: Margherita about 17%, Chicken parm about 24%, Wings about 33%.

## Key code

The five pieces worth getting exactly right. Hand everything else (layout, forms, cards) to your coding agent.

### 1. Read the invoice (`app/api/invoice/route.js`)

The prompt includes your ingredient names, so the AI does the matching too and you skip a match screen.

````js
import Anthropic from "@anthropic-ai/sdk";
export const maxDuration = 60;
const client = new Anthropic({ baseURL: "https://api.deepseek.com/anthropic", apiKey: process.env.DEEPSEEK_API_KEY });

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const fileBlock = file.type === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
    : { type: "image", source: { type: "base64", media_type: file.type, data } };

  const names = [/* ingredient names from MongoDB */];
  const prompt = `Read this supplier invoice. Return ONLY a JSON array, no other text.
One object per line item:
{"description": text as printed, "ingredient": one of ${JSON.stringify(names)} or null,
 "packCount": number, "packSize": number,
 "packUnit": "lb"|"oz"|"kg"|"g"|"gal"|"l"|"ml"|"fl oz"|"each", "linePrice": dollars}
Example: "WINGS JUMBO 4/10LB 136.00" -> packCount 4, packSize 10, packUnit "lb", linePrice 136`;

  const msg = await client.messages.create({
    model: "deepseek-v4.1-flash",
    max_tokens: 2000,
    messages: [{ role: "user", content: [fileBlock, { type: "text", text: prompt }] }],
  });
  const text = msg.content.filter(b => b.type === "text").map(b => b.text).join("");
  return Response.json({ lines: JSON.parse(text.replace(/```json|```/g, "").trim()) });
}
````

### 2. Cost math (`lib/cost.js`)

```js
const TO_BASE = { lb: 453.592, oz: 28.3495, kg: 1000, g: 1,
  gal: 3785.41, l: 1000, ml: 1, "fl oz": 29.5735, each: 1 };

// cents per base unit, from one confirmed invoice line
export const costPerUnit = (line) =>
  (line.linePrice * 100) / (line.packCount * line.packSize * TO_BASE[line.packUnit]);

// costs = { ingredientName: costPerUnit }
export const plateCost = (dish, costs) =>
  dish.lines.reduce((sum, l) => sum + l.qty * costs[l.ingredient], 0);

// flag when plateCost / dish.price > 0.35
```

Check: 4 × 10 lb of wings for $136 gives 0.7496 cents per gram, which is $3.40/lb. If the invoice's unit is a volume but the ingredient is stored in grams (or the reverse), skip that line and let the owner fix it in the confirm table.

### 3. Claim without overselling (`app/api/deals/[id]/claim/route.js`)

One atomic update: it only decrements if stock is left and the deal hasn't expired, so 50 simultaneous taps can't go below zero.

```js
const deal = await db.collection("deals").findOneAndUpdate(
  { _id: new ObjectId(id), qtyLeft: { $gt: 0 }, expiresAt: { $gt: new Date() } },
  { $inc: { qtyLeft: -1 } },
  { returnDocument: "after" }
);
if (!deal) return Response.json({ error: "Sold out" }, { status: 409 });
return Response.json({ qtyLeft: deal.qtyLeft });
```

On the deals page, save `claimed:<dealId>` in localStorage after a claim and disable that button, so one phone can't claim twice by accident.

### 4. Live deals page refresh

```js
useEffect(() => {
  const load = () => fetch("/api/deals", { cache: "no-store" }).then(r => r.json()).then(setDeals);
  load();
  const t = setInterval(load, 2000);
  return () => clearInterval(t);
}, []);
```

Add `export const dynamic = "force-dynamic";` to `app/api/deals/route.js` so Next.js never serves a cached deal list.

### 5. Shrink photos before upload (browser)

```js
async function shrink(file) {
  if (file.type === "application/pdf") return file;
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / img.width);
  const c = Object.assign(document.createElement("canvas"),
    { width: img.width * scale, height: img.height * scale });
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(
    b => r(new File([b], "invoice.jpg", { type: "image/jpeg" })), "image/jpeg", 0.85));
}
```

Test an upload from an iPhone early; phone photo formats are the most likely thing to break here.

## If you're behind

Cut from the top, in order. Never cut the invoice upload, the dashboard, or the deal drop with the live deals page: those are the demo.

1. Landing page: point the root URL at `/owner` instead.
2. Expiry times on deals: leave `expiresAt` far in the future.
3. The localStorage double-claim check.
4. PDF support: photos only.

| Problem | Quick fix |
| --- | --- |
| AI returns broken JSON | Retry once; if it fails again, show the raw lines and let you type the numbers |
| AI reads a line wrong | Fix it in the confirm table before saving |
| Upload fails from a phone | Upload from the laptop for the video; mention phone upload in the pitch |
| Vercel deploy breaks | Run locally and expose it with a tunnel (e.g. ngrok) so phones can reach it |
| MongoDB connection errors on Vercel | Check that Atlas network access allows all IPs and that `MONGODB_URI` is set in Vercel, not just locally |
